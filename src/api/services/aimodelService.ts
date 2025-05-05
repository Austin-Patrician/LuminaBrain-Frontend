// aimodelService.ts
import apiClient from "@/api/apiClient";
import type { AIModel } from "#/entity";

// 定义API端点
enum AIModelApi {
	GetModels = "/aimodel/all",
	UpdateModel = "/aimodel/update",
	ShareModel = "/aimodel/share",
}

const initialConfiguredModels: AIModel[] = [
	{
		id: "1",
		provider: "OpenAI",
		aiTypeId: "D977F982-F0FC-4AD9-9E53-34B4875009DB",
		aiModelTypeName: "Chat",
		aiModelTypeId: "0D826A41-45CE-4870-8893-A8D4FAECD3A4",
		isConfigured: true,
		endPoint: "https://api.openai.com/v1/chat/completions",
		modelName: "GPT-4o",
		modelKey: "********",
		modelDescription: "最新的GPT-4模型，支持多模态输入",
		creationTime: "2025-05-01T12:34:23.625977",
	},
	{
		id: "2",
		provider: "OpenAI",
		aiTypeId: "D977F982-F0FC-4AD9-9E53-34B4875009DB",
		aiModelTypeName: "Embedding",
		aiModelTypeId: "F37AF2F3-37A1-418B-8EEE-3675A5A36784",
		isConfigured: true,
		endPoint: "https://api.openai.com/v1/embeddings",
		modelName: "text-embedding-3-small",
		modelKey: "123456",
		modelDescription: "OpenAI最新的文本嵌入模型",
		creationTime: "2025-05-01T12:31:00.06377",
	},
	{
		id: "3",
		provider: "OpenAI",
		aiTypeId: "D977F982-F0FC-4AD9-9E53-34B4875009DB",
		aiModelTypeName: "Image",
		aiModelTypeId: "IMAGE_TYPE_ID",
		isConfigured: true,
		endPoint: "https://api.openai.com/v1/images/generations",
		modelName: "DALL-E 3",
		modelKey: "********",
		modelDescription: "OpenAI的图像生成模型",
		creationTime: "2025-04-01T12:34:23.625977",
	},
	{
		id: "4",
		provider: "Anthropic",
		aiTypeId: "ANTHROPIC_TYPE_ID",
		aiModelTypeName: "Chat",
		aiModelTypeId: "0D826A41-45CE-4870-8893-A8D4FAECD3A4",
		isConfigured: false,
		endPoint: "",
		modelName: "Claude Opus",
		modelKey: "",
		modelDescription: "Anthropic的旗舰级LLM",
		creationTime: "2025-04-15T10:34:23.625977",
	},
	{
		id: "6",
		provider: "Cohere",
		aiTypeId: "COHERE_TYPE_ID",
		aiModelTypeName: "Rerank",
		aiModelTypeId: "RERANK_TYPE_ID",
		isConfigured: false,
		endPoint: "",
		modelName: "Cohere Rerank",
		modelKey: "",
		modelDescription: "专业的文本重排序模型",
		creationTime: "2025-03-01T12:34:23.625977",
	},
];

// 服务定义
export const aimodelService = {
	// 获取所有模型
	getModels: () => {
		// return new Promise<{
		//   success: boolean;
		//   data: AIModel[];
		// }>((resolve) => {
		//   setTimeout(() => {
		//     resolve({
		//       success: true,
		//       data: initialConfiguredModels
		//     });
		//   }, 500); // 添加500ms延迟模拟网络请求
		// });
		return apiClient.get<AIModel[]>({
			url: AIModelApi.GetModels,
		});
	},

	// 更新模型配置
	updateModel: (model: AIModel) => {
		return apiClient.post<{
			success: boolean;
			data: AIModel;
		}>({
			url: AIModelApi.UpdateModel,
			data: model,
		});
	},

	// 分享模型
	shareModel: (modelId: string) => {
		// Mock data for testing the invitation UI
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					success: true,
					data: {
						shareUrl: `https://lumina-brain.app/share/model/${modelId}?token=mock-token-${Date.now()}`
					}
				});
			}, 300); // Small delay to simulate API call
		});
		
		// Uncomment below and comment out the mock above when ready to use the real API
		// return apiClient.post<{
		//	success: boolean;
		//	data: { shareUrl: string };
		// }>({
		//	url: AIModelApi.ShareModel,
		//	data: { modelId },
		// });
	},
};
