// aimodelService.ts
import apiClient from "@/api/apiClient";
import type { AIModel, AIProvider, AiModelsAndKnowledgesResponse, UpdateProviderModel } from "#/entity";

// 定义API端点
enum AIModelApi {
	GetModels = "/provider/all",
	UpdateProvider = "/provider/update",
	UpdateModel = "/aimodel/update",
	ShareModel = "/aimodel/share",

	GetAiModelsAndKnowledges = "aiModel/aiModelsAndKnowledges",
}

// 服务定义
export const aimodelService = {
	updateModel: (model: UpdateProviderModel) => {
		return apiClient.put<{
			success: boolean;
			data: AIModel;
		}>({
			url: AIModelApi.UpdateModel,
			data: model,
		});
	},

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
	updateProvider: (model: UpdateProviderModel) => {
		return apiClient.post<{
			success: boolean;
			data: AIModel;
		}>({
			url: AIModelApi.UpdateProvider,
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
						shareUrl: `https://lumina-brain.app/share/model/${modelId}?token=mock-token-${Date.now()}`,
					},
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

	// 获取AI模型和知识库列表
	getAiModelsAndKnowledges: () => {
		return apiClient.get<AiModelsAndKnowledgesResponse>({
			url: AIModelApi.GetAiModelsAndKnowledges,
		});
	},
};
