// aimodelService.ts
import apiClient from "@/api/apiClient";
import type { AIModel, AIProvider } from "#/entity";

// 定义API端点
enum AIModelApi {
	GetModels = "/aimodel/allAiProvider",
	UpdateModel = "/aimodel/update",
	ShareModel = "/aimodel/share",
}

// 服务定义
export const aimodelService = {
	// 获取所有模型
	getModels: () => {
		return apiClient.get<{
			success: boolean;
			statusCode: number;
			message: string;
			data: AIProvider[];
		}>({
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
