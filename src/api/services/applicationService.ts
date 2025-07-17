import apiClient from "@/api/apiClient";
import type { Application, AiModelItem, AiModelListResponse } from "#/entity";
import type { CreateApplicationDto } from "#/dto/application";

// 知识库项定义
interface KnowledgeItem {
  knowledgeId: string;
  knowledgeName: string;
}

// 知识库列表响应定义
interface KnowledgeListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: KnowledgeItem[];
}

interface ApplicationSearchParams {
	name?: string;
	statusId?: string;
	applicationType?: string; // 新增的应用类型过滤条件
	pageNumber?: number; // 添加分页参数
	pageSize?: number; // 添加分页参数
}

// 修正响应类型定义以匹配实际API返回结构
export interface ApplicationListResponse {
	success: boolean; // 注意：之前拼写错误为"sucess"
	statusCode: number;
	message: string;
	data: {
		total: number;
		data: Application[];
	};
}

export enum ApplicationApi {
	AddApplication = "/application/add",
	QueryApplicationList = "/application/paged",
	QueryApplicationById = "/application",
	DeleteApplication = "/application",
	UpdateApplication = "/application/update",
	ShareApplication = "/application/share",
	GetAiModelsByTypeId = "/aiModel/getByTypeId/{id}" , // 根据类型ID获取AI模型列表
	GetKnowledgeList = "/knowledge/dropdown",
}

/**
 * Application Service - handles all API requests related to applications
 */
const applicationService = {
	/**
	 * Get list of applications with optional search parameters and pagination
	 */
	getApplicationList: (params?: ApplicationSearchParams) => {
		console.log("params", params);
		return apiClient.post<ApplicationListResponse>({
			url: ApplicationApi.QueryApplicationList,
			data: params, // 将 params 改为 data: params
		});
	},

	/**
	 * Get application by ID
	 */
	getApplicationById: (id: string) => {
		return apiClient.get<Application>({
			url: `${ApplicationApi.QueryApplicationById}/${id}`,
		});
	},

	getAiModelsByTypeId: (id: string) => {
    return apiClient.get<AiModelListResponse>({
      url: ApplicationApi.GetAiModelsByTypeId.replace('{id}', id),
    });
  },

	GetKnowledgeList: () => {
    return apiClient.get<KnowledgeListResponse>({
      url: ApplicationApi.GetKnowledgeList,
    });
  },

	/**
	 * Create a new application
	 */
	createApplication: (data: CreateApplicationDto) => {
		return apiClient.post<Application>({
			url: ApplicationApi.AddApplication,
			data,
		});
	},

	/**
	 * Update an existing application
	 */
	updateApplication: (data: Application) => {
		return apiClient.put<Application>({
			url: `${ApplicationApi.UpdateApplication}`,
			data,
		});
	},

	/**
	 * Delete an application by ID
	 */
	deleteApplication: (id: string) => {
		return apiClient.delete<void>({
			url: `${ApplicationApi.DeleteApplication}/${id}`,
		});
	},
};

export default applicationService;
