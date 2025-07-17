// aimodelService.ts
import apiClient from "@/api/apiClient";
import type { Knowledge, AiModelItem, AiModelListResponse } from "#/entity";

interface KnowledgeQueryParams {
	name?: string;
	statusId?: string;
	isOCR?: boolean; // 添加 isOCR 参数
	pageNumber?: number;
	pageSize?: number;
}

// 新增创建知识库的DTO
interface CreateKnowledgeDto {
name: string;
description: string;
chatModelID: string | null;
embeddingModelID: string | null;
rerankModelID: string | null;
maxTokensPerParagraph: number;
avatar: string;
maxTokensPerLine: number;
overlappingTokens: number;
isOCR: boolean;
}

// 定义响应类型
interface KnowledgeListResponse {
	success: boolean;
	statusCode: number;
	message: string;
	data: {
		total: number;
		data: Knowledge[];
	};
}

// 新增单个知识库响应类型
interface KnowledgeResponse {
	success: boolean;
	statusCode: number;
	message: string;
	data: Knowledge;
}

// 定义API端点
export enum KnowledgeApi {
	PagedKnowledge = "/knowledge/paged",
	UpdateModel = "/knowledge/update",
	ShareModel = "/knowledge/share",
	getKnowledge = "/knowledge/{id}",
	Create = "/knowledge/create", // 新增创建知识库端点
	GetAiModelsByTypeId = "/aiModel/getByTypeId/{id}", // 根据类型ID获取AI模型列表
	GetAntiforgerytoken = "/file/antiforgery/token",
	UploadFile = "/file/upload/{knowledgeId}",
	ReprocessKnowledgeItem = "/knowledge/item/{id}/reprocess", // 重新执行知识项
	GetKnowledgeItem = "/knowledge/item/{id}", // 获取知识项详情
	GetKnowledgeItemPoint = "/knowledge/{itemid}/knowledgeItemPoint/{id}", // 获取知识项详情
}

/**
 * Knowledge Service - 处理所有与知识库相关的API请求
 */
const knowledgeService = {
	/**
	 * 获取知识库列表，支持可选的搜索参数和分页
	 */
	getKnowledgeList: (params: KnowledgeQueryParams) => {
		return apiClient.post<KnowledgeListResponse>({
			// 改为 post 请求
			url: KnowledgeApi.PagedKnowledge,
			data: params, // 使用 data 而不是 params
		});
	},

	/**
	 * 创建新的知识库
	 */
	createKnowledge: (data: CreateKnowledgeDto) => {
		return apiClient.post<Knowledge>({
			url: KnowledgeApi.Create,
			data,
		});
	},

	/**
	 * 更新现有知识库
	 */
	updateKnowledge: (data: Partial<Knowledge>) => {
		return apiClient.put<Knowledge>({
			url: KnowledgeApi.UpdateModel,
			data,
		});
	},

	/**
	 * 通过ID删除知识库
	 */
	deleteKnowledge: (id: string) => {
		return apiClient.delete<void>({
			url: `${KnowledgeApi.PagedKnowledge}/${id}`,
		});
	},

	/**
	 * 共享知识库
	 */
	shareKnowledge: (id: string) => {
		return apiClient.post<void>({
			url: `${KnowledgeApi.ShareModel}/${id}`,
		});
	},

	/**
	 * 获取单个知识库详情
	 */
	getKnowledge: (id: string) => {
		return apiClient.get<KnowledgeResponse>({
			url: KnowledgeApi.getKnowledge.replace("{id}", id),
		});
	},

	/**
	 * 根据AI模型类型ID获取AI模型集合
	 */
	getAiModelsByTypeId: (id: string) => {
		return apiClient.get<AiModelListResponse>({
			url: KnowledgeApi.GetAiModelsByTypeId.replace("{id}", id),
		});
	},

	/**
	 * 获取CSRF令牌
	 */
	getAntiforgerytoken: () => {
		return apiClient.get<string>({
			url: KnowledgeApi.GetAntiforgerytoken,
		});
	},

	/**
	 * 获取CSRF令牌
	 */
	getKnowledgeItemPoint: (pointId: string, itemId: string) => {
		return apiClient.get<string>({
			url: KnowledgeApi.GetKnowledgeItemPoint.replace("{itemid}", itemId).replace("{id}", pointId),
		});
	},

	/**
	 * 上传文件到知识库
	 */
	uploadFile: (knowledgeId: string, formData: FormData, headers: Record<string, string>) => {
		// 确保URL路径中包含knowledgeId，而不是在FormData中
		return apiClient.post({
			url: KnowledgeApi.UploadFile.replace("{knowledgeId}", knowledgeId),
			data: formData,
			headers,
			// 不要设置withCredentials为false，否则可能无法正确发送cookies
			withCredentials: false,
		});
	},

	/**
	 * 重新执行知识项
	 */
	reprocessKnowledgeItem: (id: string) => {
		return apiClient.post<void>({
			url: KnowledgeApi.ReprocessKnowledgeItem.replace("{id}", id),
		});
	},

	/**
	 * 获取知识项详情
	 */
	getKnowledgeItem: (id: string) => {
		return apiClient.get<KnowledgeResponse>({
			url: KnowledgeApi.GetKnowledgeItem.replace("{id}", id),
		});
	},
};

export default knowledgeService;
