import apiClient from '../apiClient';

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
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

  constructor(baseURL = '/api/v1', apiKey = '') {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  // 非流式聊天完成
  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await apiClient.post({
        url: '/chat/completions',
        data: request,
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      return response.data;
    } catch (error) {
      console.error('Chat completion error:', error);
      throw new Error('Failed to create chat completion');
    }
  }

  // 流式聊天完成
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
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          ...request,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '') continue;
          if (trimmedLine === 'data: [DONE]') {
            onComplete();
            return;
          }
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonData = trimmedLine.slice(6); // 移除 "data: " 前缀
              const chunk: ChatCompletionStreamChunk = JSON.parse(jsonData);
              onChunk(chunk);
            } catch (error) {
              console.warn('Failed to parse SSE chunk:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming chat completion error:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // 模拟本地流式响应（用于测试或离线模式）
  async simulateStreamingResponse(
    request: ChatCompletionRequest,
    onChunk: (chunk: ChatCompletionStreamChunk) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const userMessage = request.messages[request.messages.length - 1];
      const simulatedResponse = this.generateSimulatedResponse(userMessage.content, request.model);
      
      // 生成响应ID
      const responseId = `chatcmpl-${Date.now()}`;
      const created = Math.floor(Date.now() / 1000);

      // 按词组分块，而不是逐字符
      const words = simulatedResponse.split('');
      let accumulatedContent = '';
      
      // 使用更合理的分块策略
      for (let i = 0; i < words.length; i++) {
        const char = words[i];
        accumulatedContent += char;
        
        // 每1-3个字符发送一次，让流式效果更自然
        const shouldSend = (
          i === words.length - 1 || // 最后一个字符
          Math.random() < 0.3 || // 随机发送概率
          char === ' ' || char === '，' || char === '。' || char === '\n' // 在标点符号处发送
        );
        
        if (shouldSend && accumulatedContent) {
          const chunk: ChatCompletionStreamChunk = {
            id: responseId,
            object: 'chat.completion.chunk',
            created: created,
            model: request.model,
            choices: [{
              index: 0,
              delta: {
                content: accumulatedContent,
              },
            }],
          };

          onChunk(chunk);
          accumulatedContent = ''; // 重置累积内容
          
          // 模拟更自然的网络延迟
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        }
      }

      // 如果还有剩余内容，发送它
      if (accumulatedContent) {
        const chunk: ChatCompletionStreamChunk = {
          id: responseId,
          object: 'chat.completion.chunk',
          created: created,
          model: request.model,
          choices: [{
            index: 0,
            delta: {
              content: accumulatedContent,
            },
          }],
        };
        onChunk(chunk);
      }

      // 发送完成信号
      const finalChunk: ChatCompletionStreamChunk = {
        id: responseId,
        object: 'chat.completion.chunk',
        created: created,
        model: request.model,
        choices: [{
          index: 0,
          delta: {},
          finish_reason: 'stop',
        }],
      };

      onChunk(finalChunk);
      onComplete();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Simulation error'));
    }
  }

  // 生成模拟响应内容
  private generateSimulatedResponse(userInput: string, model: string): string {
    const responses = [
      `我正在使用 ${model} 模型来回答您的问题："${userInput}"。

让我为您详细分析一下：

1. **理解您的需求**：我已经仔细分析了您的问题，明确了您想要获得的信息。

2. **知识检索**：基于我的训练数据，我搜索了相关的信息和最佳实践。

3. **逻辑推理**：我运用逻辑思维来组织答案，确保回答的准确性和实用性。

4. **结构化回答**：我将为您提供清晰、有条理的回答。

如果您需要更详细的解释或有其他问题，请随时告诉我！我会根据我们的对话历史提供更加个性化的回答。`,

      `感谢您的问题！作为 ${model}，我很高兴为您提供帮助。

关于"${userInput}"这个问题，让我从以下几个方面来回答：

**核心概念解释**：
首先，我会解释相关的基本概念，确保我们在同一个理解基础上。

**实际应用**：
然后，我会提供一些实际的应用场景和示例，帮助您更好地理解。

**最佳实践**：
基于我的知识库，我会分享一些行业内的最佳实践和建议。

**注意事项**：
最后，我会提醒您一些需要注意的关键点。

请告诉我是否需要我深入讲解某个特定方面！`,

      `很高兴收到您的问题！让我用 ${model} 的能力来为您提供全面的回答。

针对"${userInput}"，我的分析如下：

🎯 **问题核心**
我识别出您想了解的核心内容，这有助于我提供更精准的回答。

💡 **解决方案**
基于我的训练数据，我会提供几种可能的解决方案或观点。

📚 **背景知识**
我会补充一些相关的背景信息，帮助您更好地理解整个上下文。

🔍 **深入思考**
如果需要，我可以从多个角度来分析这个问题。

您希望我重点关注哪个方面呢？或者有其他相关问题想要了解？`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
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
  model: string = 'gpt-4o',
  streaming: boolean = true
): Promise<string> => {
  const request: ChatCompletionRequest = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  };

  if (streaming) {
    return new Promise((resolve, reject) => {
      let fullResponse = '';
      
      chatService.simulateStreamingResponse(
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