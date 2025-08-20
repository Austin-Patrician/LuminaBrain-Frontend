import userStore from "@/store/userStore";

// OpenAI兼容的消息格式
export interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

// SSE请求配置接口
interface SSEConfig {
	url?: string;
	method?: "POST" | "GET";
	headers?: Record<string, string>;
	timeout?: number;
}

// SSE事件数据接口
interface SSEEvent {
	id?: string;
	event?: string;
	data: string;
	retry?: number;
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
			role: "assistant";
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
			role?: "assistant";
			content?: string;
		};
		finish_reason?: string;
	}>;
}

// 默认配置
const DEFAULT_CONFIG: Required<SSEConfig> = {
	url: "/api/chat/stream", // 默认API端点，可根据实际情况修改
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Accept: "text/event-stream",
		"Cache-Control": "no-cache",
	},
	timeout: 600000, // 30秒超时
};

/**
 * SSE流式请求封装函数
 * @param data 请求参数对象（支持任意结构）
 * @param config 可选配置
 * @returns 异步迭代器，可用于 await for 循环
 */
// @ts-ignore
export async function* SSE<T = any>(
	url: string,
	data: Record<string, any>,
	config: Partial<SSEConfig> = {},
): AsyncGenerator<SSEEvent, void, unknown> {
	const finalConfig = {
		...DEFAULT_CONFIG,
		...config,
		url,
	};

	const baseURL = import.meta.env.VITE_APP_BASE_API || "";
	url = baseURL + finalConfig.url;

	// 创建AbortController用于超时控制
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

	try {
		const { userToken } = userStore.getState();

		// 发送请求
		const response = await fetch(url, {
			method: "POST",
			headers: {
				...finalConfig.headers,
				Authorization: `Bearer ${userToken.accessToken}`, // 用户身份验证
			},
			body: JSON.stringify(data),
			signal: controller.signal,
		});

		// 如果401，则提示请先登录
		if (response.status === 401) {
			// 跳转到登录页面，清空token
			window.location.href = "/login";
			return;
		}

		// 检查响应状态
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// 检查是否为SSE流
		const contentType = response.headers.get("content-type");
		if (!contentType?.includes("text/event-stream")) {
			// 检查是否为JSON响应，如果是则尝试解析错误信息
			if (contentType?.includes("application/json")) {
				const errorData = await response.json();
				const errorMessage = errorData.message || errorData.error || "未知错误";
				throw new Error(errorMessage);
			}
			throw new Error("响应不是有效的SSE流");
		}

		// 获取可读流
		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("无法获取响应流");
		}

		const decoder = new TextDecoder();
		let buffer = "";

		try {
			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				// 解码数据并添加到缓冲区
				buffer += decoder.decode(value, { stream: true });

				// 按行分割处理
				const lines = buffer.split("\n");
				buffer = lines.pop() || ""; // 保留最后一个不完整的行

				let currentEvent: Partial<SSEEvent> = {};

				for (const line of lines) {
					const trimmedLine = line.trim();

					// 空行表示事件结束
					if (trimmedLine === "") {
						if (currentEvent.data !== undefined) {
							yield currentEvent as SSEEvent;
							currentEvent = {};
						}
						continue;
					}

					// 注释行（以:开头）
					if (trimmedLine.startsWith(":")) {
						continue;
					}

					// 解析字段
					const colonIndex = trimmedLine.indexOf(":");
					if (colonIndex === -1) {
						// 没有冒号的行作为字段名，值为空字符串
						currentEvent[trimmedLine as keyof SSEEvent] = "" as any;
					} else {
						const field = trimmedLine.slice(0, colonIndex).trim();
						const value = trimmedLine.slice(colonIndex + 1).trim();

						switch (field) {
							case "id":
								currentEvent.id = value;
								break;
							case "event":
								currentEvent.event = value;
								break;
							case "data":
								// data字段可能有多行，需要累加
								currentEvent.data = currentEvent.data ? currentEvent.data + "\n" + value : value;
								break;
							case "retry":
								currentEvent.retry = parseInt(value, 10);
								break;
						}
					}
				}

				// 处理最后一个事件（如果缓冲区为空且有未完成的事件）
				if (buffer === "" && currentEvent.data !== undefined) {
					yield currentEvent as SSEEvent;
				}
			}
		} finally {
			reader.releaseLock();
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				throw new Error(`SSE请求超时 (${finalConfig.timeout}ms)`);
			}
			throw error;
		}
		throw new Error("SSE请求发生未知错误");
	} finally {
		clearTimeout(timeoutId);
	}
}

// 聊天服务类
export class ChatService {
	constructor() {}

	// 新的流式聊天完成方法 - 使用 SSE 异步迭代器
	async *createStreamingChatCompletionSSE(request: ChatCompletionRequest): AsyncGenerator<SSEEvent, void, unknown> {
		try {
			const streamRequest = {
				...request,
				stream: true,
			};

			// 使用 SSE 函数进行流式请求
			for await (const event of SSE("/chat/completions", streamRequest)) {
				yield event;
			}
		} catch (error) {
			console.error("SSE streaming chat completion error:", error);
			throw error instanceof Error ? error : new Error("Unknown SSE streaming error");
		}
	}
}

// 创建默认实例
export const chatService = new ChatService();

export default chatService;
