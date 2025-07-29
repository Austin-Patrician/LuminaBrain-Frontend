// 提示词优化请求参数
export interface GeneratePromptInput {
  /// 需要优化的提示词
  Prompt: string;

  /// 用户需求
  Requirements?: string;

  /// 是否启用深入推理
  EnableDeepReasoning: boolean;

  /// 用于生成的模型id
  ModelId: string;
}

// 优化结果类型
export interface OptimizationResult {
  originalPrompt: string;
  optimizedPrompt: string;
  deepReasoning?: string;
  evaluation: string;
  optimizationType: "function-calling" | "prompt-optimization";
  timestamp: Date;
}

// 流式内容类型
export interface StreamingContent {
  deepReasoning: string;
  optimizedPrompt: string;
  evaluation: string;
}

// SSE 事件类型
export interface SSEEventData {
  type: string;
  message?: string;
}

// 聊天消息类型
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// 运行请求参数
export interface RunPromptInput {
  systemPrompt?: string;
  userInput: string;
  messages: ChatMessage[];
  modelId: string;
  additionalMessage?: string; // 来自优化按钮的额外输入
}

// 提示词历史记录类型
export interface PromptHistory {
  id: string;
  prompt: string;
  requirement: string;
  deepReasoning: string;
  result: string;
  optimizedType: "Common" | "FunctionCalling";
  optimizedId: string;
  createdAt?: string;
}

// 提示词历史查询参数
export interface PromptHistoryQuery {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
  optimizedType?: string;
}

// 提示词历史分页响应
export interface PromptHistoryResponse {
  data: PromptHistory[];
  total: number;
  page: number;
  pageSize: number;
}
