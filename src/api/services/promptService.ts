import userStore from "@/store/userStore";
import type { GeneratePromptInput } from "@/pages/prompt/types";

// 提示词优化服务类
export class PromptService {
  private baseURL: string;

  constructor(baseURL = import.meta.env.VITE_APP_BASE_API) {
    this.baseURL = baseURL;
  }

  // 流式提示词优化
  async optimizePromptStream(input: GeneratePromptInput): Promise<Response> {
    const { userToken } = userStore.getState();
    
    const response = await fetch(`${this.baseURL}/prompt/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        "Cache-Control": "no-cache",
        "Authorization": `Bearer ${userToken.accessToken}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response;
  }

  // 非流式提示词优化（备用方案）
  async optimizePrompt(input: GeneratePromptInput): Promise<any> {
    const { userToken } = userStore.getState();
    
    const response = await fetch(`${this.baseURL}/prompt/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userToken.accessToken}`,
      },
      body: JSON.stringify({
        ...input,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  // 设置基础URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }
}

// 创建默认实例
export const promptService = new PromptService();

export default promptService;
