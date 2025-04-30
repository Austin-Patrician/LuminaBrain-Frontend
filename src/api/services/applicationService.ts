import apiClient from "@/api/apiClient";
import type { Organization } from "#/entity";


interface ApplicationSearchParams {
  name?: string;
  status?: string;
}

export enum ApplicationApi {
	AddApplication = "/application/add",
	QueryApplication = "/application/get",
	DeleteApplication = "/application/delete",
	UpdateApplication = "/application/update",
	ShareApplicaiton = "/application/share",
}

/**
 * Application Service - handles all API requests related to applications
 */
const applicationService = {
  /**
   * Get list of applications with optional search parameters
   */
  getApplicationList: (params?: ApplicationSearchParams) => {
    return apiClient.get<Organization[]>({
      url: ApplicationApi.QueryApplication,
      params,
    });
  },

  /**
   * Get application by ID
   */
  getApplicationById: (id: string) => {
    return apiClient.get<Organization>({
      url: `${ApplicationApi.QueryApplication}/${id}`,
    });
  },

  /**
   * Create a new application
   */
  createApplication: (data: Omit<Organization, "id">) => {
    return apiClient.post<Organization>({
      url: ApplicationApi.AddApplication,
      data,
    });
  },

  /**
   * Update an existing application
   */
  updateApplication: (data: Organization) => {
    return apiClient.put<Organization>({
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
