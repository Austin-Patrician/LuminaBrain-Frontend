import apiClient from "@/api/apiClient";
import type { Application } from "#/entity";

interface ApplicationSearchParams {
	name?: string;
	statusId?: string;
	applicationType?: string; // 新增的应用类型过滤条件
	pageNumber?: number; // 添加分页参数
	pageSize?: number; // 添加分页参数
}

// 修正响应类型定义以匹配实际API返回结构
interface ApplicationListResponse {
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
	DeleteApplication = "/application/delete",
	UpdateApplication = "/application/update",
	ShareApplication = "/application/share",
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

	/**
	 * Create a new application
	 */
	createApplication: (data: Omit<Application, "id">) => {
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
			url: `${ApplicationApi.UpdateApplication}/${data.id}`,
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
