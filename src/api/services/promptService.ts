import type { GeneratePromptInput, PromptHistory, PromptHistoryQuery } from "@/pages/prompt/types";
import userStore from "@/store/userStore";

import apiClient from "@/api/apiClient";

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

// 默认配置
const DEFAULT_CONFIG: Required<SSEConfig> = {
	url: "/api/chat/stream", // 默认API端点，可根据实际情况修改
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		Accept: "text/event-stream",
		"Cache-Control": "no-cache",
	},
	timeout: 6000000, // 30秒超时
};

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
				Accept: "text/event-stream",
				"Cache-Control": "no-cache",
				Authorization: `Bearer ${userToken.accessToken}`,
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
				Authorization: `Bearer ${userToken.accessToken}`,
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
								currentEvent.retry = Number.parseInt(value, 10);
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

/**
 * 封装 /v1/prompt/generate 接口的SSE请求
 * @param data 请求参数对象（支持任意结构）
 * @param config 可选配置
 * @returns 异步迭代器，可用于 await for 循环
 */
export async function* generatePrompt(
	data: Record<string, any>,
	config: Partial<SSEConfig> = {},
): AsyncGenerator<SSEEvent, void, unknown> {
	const url = "/prompt/generate-prompt";
	// 默认配置，专门为这个接口优化
	const defaultConfig: Partial<SSEConfig> = {
		headers: {
			"Content-Type": "application/json",
		},
		timeout: 600000, // 60秒超时，适合生成任务
	};

	// 合并配置
	const finalConfig = { ...defaultConfig, ...config };

	// 使用基础SSE函数
	for await (const event of SSE(url, data, finalConfig)) {
		yield event;
	}
}

/**
 * /v1/prompt/optimize-function-calling
 * 优化function calling提示词
 */
export async function* generateFunctionCallingPrompt(
	data: Record<string, any>,
	config: Partial<SSEConfig> = {},
): AsyncGenerator<SSEEvent, void, unknown> {
	const url = "/v1/prompt/optimize-function-calling";
	// 默认配置，专门为这个接口优化
	const defaultConfig: Partial<SSEConfig> = {
		headers: {
			"Content-Type": "application/json",
		},
		timeout: 600000, // 60秒超时，适合生成任务
	};

	// 合并配置
	const finalConfig = { ...defaultConfig, ...config };

	// 使用基础SSE函数
	for await (const event of SSE(url, data, finalConfig)) {
		yield event;
	}
}

/**
 * 封装 /v1/prompt/generate 接口的SSE请求
 * @param data 请求参数对象（支持任意结构）
 * @param config 可选配置
 * @returns 异步迭代器，可用于 await for 循环
 */
export async function* generateImagePrompt(
	data: Record<string, any>,
	config: Partial<SSEConfig> = {},
): AsyncGenerator<SSEEvent, void, unknown> {
	const url = "/v1/prompt/optimizeimageprompt";
	// 默认配置，专门为这个接口优化
	const defaultConfig: Partial<SSEConfig> = {
		headers: {
			"Content-Type": "application/json",
		},
		timeout: 600000, // 60秒超时，适合生成任务
	};

	// 合并配置
	const finalConfig = { ...defaultConfig, ...config };

	// 使用基础SSE函数
	for await (const event of SSE(url, data, finalConfig)) {
		yield event;
	}
}

// 提示词历史相关API
export const getPromptHistory = (params: PromptHistoryQuery) => {
	return apiClient.post({ url: "/prompt/history", data: params });
};

export const deletePromptHistory = (id: string): Promise<void> => {
	return apiClient.delete({ url: `/prompt/history/${id}` });
};

export const deletePromptHistoryBatch = (ids: string[]): Promise<void> => {
	return apiClient.delete({ url: "/prompt/history/batch", data: { ids } });
};

export const getPromptHistoryDetail = (id: string): Promise<PromptHistory> => {
	return apiClient.get({ url: `/prompt/history/${id}` });
};

// 创建默认实例
export const promptService = new PromptService();

export default promptService;
