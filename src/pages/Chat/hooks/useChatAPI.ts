import { useCallback } from 'react';
import { message as antdMessage } from 'antd';
import { ChatMessage, ChatConfig } from '../types';
import { chatService, type ChatMessage as APIChatMessage } from '@/api/services/chatService';

interface UseChatAPIProps {
  config: ChatConfig;
  onStreamChunk?: (content: string) => void;
  onStreamComplete?: (fullContent: string, responseTime: number) => void;
  onStreamError?: (error: Error) => void;
}

export const useChatAPI = ({
  config,
  onStreamChunk,
  onStreamComplete,
  onStreamError,
}: UseChatAPIProps) => {

  // Convert messages to API format
  const convertMessagesToAPIFormat = useCallback((messages: ChatMessage[]): APIChatMessage[] => {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }, []);

  // Send streaming chat request
  const sendStreamingMessage = useCallback(async (
    messages: ChatMessage[]
  ): Promise<void> => {
    const startTime = Date.now();
    const apiMessages = convertMessagesToAPIFormat(messages);
    let fullResponse = '';
    
    try {
      // 使用新的 SSE 流式API
      for await (const event of chatService.createStreamingChatCompletionSSE({
        model: config.selectedModel,
        messages: apiMessages,
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 8000,
        ...(config.selectedModelType && { chatType: config.selectedModelType }),
      })) {
        // 处理流式响应数据
        if (event.data) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "error") {
              // 处理错误类型
              const error = new Error(data.message || data.error || '聊天失败，请重试');
              onStreamError?.(error);
              break;
            } else if (data.type === "message") {
              if (data.message) {
                fullResponse += data.message;
                onStreamChunk?.(fullResponse);
              }
            }

            // 检查是否完成
            if (data.done || event.event === 'done') {
              const endTime = Date.now();
              const responseTime = Number(((endTime - startTime) / 1000).toFixed(1));
              onStreamComplete?.(fullResponse, responseTime);
              break;
            }
          } catch (e) {
            // 如果不是JSON格式，直接添加到结果中
            if (event.data !== '[DONE]') {
              fullResponse += event.data;
              onStreamChunk?.(fullResponse);
            } else {
              // 完成时创建最终消息
              const endTime = Date.now();
              const responseTime = Number(((endTime - startTime) / 1000).toFixed(1));
              onStreamComplete?.(fullResponse, responseTime);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("SSE Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      onStreamError?.(new Error(`消息发送失败：${errorMessage}`));
    }
  }, [config, convertMessagesToAPIFormat, onStreamChunk, onStreamComplete, onStreamError]);



  // Main send message function
  const sendMessage = useCallback(async (
    messages: ChatMessage[]
  ): Promise<void> => {
    if (!config.selectedModel) {
      antdMessage.error('请先选择一个模型');
      return;
    }

    await sendStreamingMessage(messages);
  }, [config.selectedModel, sendStreamingMessage]);

  return {
    sendMessage,
    sendStreamingMessage,
  };
};
