import { useCallback } from 'react';
import { message as antdMessage } from 'antd';
import { ChatMessage, ChatConfig } from '../types';
import { chatService, type ChatMessage as APIChatMessage } from '@/api/services/chatService';
import { generateMessageId } from '../utils';

interface UseChatAPIProps {
  config: ChatConfig;
  onStreamChunk?: (content: string) => void;
  onStreamComplete?: (fullContent: string, responseTime: number) => void;
  onStreamError?: (error: Error) => void;
  onNonStreamComplete?: (content: string, responseTime: number) => void;
  onNonStreamError?: (error: Error) => void;
}

export const useChatAPI = ({
  config,
  onStreamChunk,
  onStreamComplete,
  onStreamError,
  onNonStreamComplete,
  onNonStreamError,
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
      await chatService.createStreamingChatCompletion(
        {
          model: config.selectedModel,
          messages: apiMessages,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          ...(config.selectedModelType && { chatType: config.selectedModelType }),
        },
        (chunk) => {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            onStreamChunk?.(fullResponse);
          }
        },
        () => {
          const endTime = Date.now();
          const responseTime = Number(((endTime - startTime) / 1000).toFixed(1));
          onStreamComplete?.(fullResponse, responseTime);
        },
        (error) => {
          onStreamError?.(error);
        }
      );
    } catch (error) {
      onStreamError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [config, convertMessagesToAPIFormat, onStreamChunk, onStreamComplete, onStreamError]);

  // Send non-streaming chat request
  const sendNonStreamingMessage = useCallback(async (
    messages: ChatMessage[]
  ): Promise<void> => {
    const startTime = Date.now();
    const apiMessages = convertMessagesToAPIFormat(messages);

    try {
      const response = await chatService.createChatCompletion({
        model: config.selectedModel,
        messages: apiMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        ...(config.selectedModelType && { chatType: config.selectedModelType }),
      });

      const endTime = Date.now();
      const responseTime = Number(((endTime - startTime) / 1000).toFixed(1));
      const content = response.choices[0]?.message?.content || '';
      
      onNonStreamComplete?.(content, responseTime);
    } catch (error) {
      onNonStreamError?.(error instanceof Error ? error : new Error('Unknown error'));
    }
  }, [config, convertMessagesToAPIFormat, onNonStreamComplete, onNonStreamError]);

  // Main send message function
  const sendMessage = useCallback(async (
    messages: ChatMessage[]
  ): Promise<void> => {
    if (!config.selectedModel) {
      antdMessage.error('请先选择一个模型');
      return;
    }

    if (config.selectedModelIsStream) {
      await sendStreamingMessage(messages);
    } else {
      await sendNonStreamingMessage(messages);
    }
  }, [config.selectedModel, config.selectedModelIsStream, sendStreamingMessage, sendNonStreamingMessage]);

  return {
    sendMessage,
    sendStreamingMessage,
    sendNonStreamingMessage,
  };
};
