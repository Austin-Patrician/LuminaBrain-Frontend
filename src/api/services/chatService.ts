// OpenAI兼容的消息格式
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// OpenAI兼容的聊天请求格式
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  chatType?: string; // 新增：模型类型
}

// OpenAI兼容的聊天响应格式
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
}

// 流式响应的数据块格式
export interface ChatCompletionStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason?: string;
  }>;
}

// 聊天服务类
export class ChatService {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL = 'http://localhost:5154/api/v1', apiKey = '') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  // 非流式聊天完成
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // 检查响应的Content-Type来判断返回格式
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // 如果是JSON格式，直接解析
        return response.json();
      } else {
        // 如果是文本格式，包装成标准的ChatCompletionResponse格式
        const textContent = await response.text();
        return {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: request.model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: textContent,
            },
            finish_reason: 'stop',
          }],
        };
      }
    } catch (error) {
      console.error('Chat completion error:', error);
      throw new Error('Failed to create chat completion');
    }
  }

  // 流式聊天完成 - 直接连接后台 OpenAI 流式输出
  async createStreamingChatCompletion(
    request: ChatCompletionRequest,
    onChunk: (chunk: ChatCompletionStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }


      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            onComplete();
            break;
          }

          // 解码数据流
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 按行分割处理 SSE 数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留可能不完整的最后一行

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            // 跳过空行和注释行
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }

            // 处理 SSE 结束标志
            if (trimmedLine === 'data: [DONE]') {
              onComplete();
              return;
            }

            // 解析 SSE data 行
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonData = trimmedLine.slice(6).trim(); // 移除 "data: " 前缀
                
                // 跳过空的 data 行
                if (!jsonData) continue;
                
                const parsedChunk: ChatCompletionStreamChunk = JSON.parse(jsonData);
                
                // 验证数据结构
                if (parsedChunk && parsedChunk.choices && parsedChunk.choices.length > 0) {
                  onChunk(parsedChunk);
                } else {
                  console.warn('Invalid chunk structure:', parsedChunk);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE chunk:', parseError, 'Line:', trimmedLine);
                // 不抛出错误，继续处理下一行
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Streaming chat completion error:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // 设置API密钥
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  // 设置基础URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

// 创建默认实例
export const chatService = new ChatService();

// 导出便捷方法
export const sendMessage = async (
  messages: ChatMessage[],
  model: string = 'gpt-4.1',
  streaming: boolean = true,
  chatType?: string // 新增：模型类型参数
): Promise<string> => {
  const request: ChatCompletionRequest = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 8000,
    ...(chatType && { chatType }), // 如果有chatType则添加到请求中
  };

  if (streaming) {
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      chatService.createStreamingChatCompletion(
        request,
        (chunk) => {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
          }
        },
        () => resolve(fullResponse),
        (error) => reject(error)
      );
    });
  } else {
    const response = await chatService.createChatCompletion(request);
    return response.choices[0]?.message?.content || '';
  }
};

export default chatService;