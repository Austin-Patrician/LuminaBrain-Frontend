import apiClient from "@/api/apiClient";
import type { CreateApiKeyDto, UpdateApiKeyDto, ApiKey, ApiKeyListResponse } from "#/dto/apiKey";
import type { Result } from "#/api";

// API Key相关的API端点枚举
export enum ApiKeyApi {
  CreateApiKey = "/apikey/create",
  GetApiKeyList = "/apikey/list",
  UpdateApiKey = "/apikey/update",
  DeleteApiKey = "/apikey/delete"
}

/**
 * API Key Service - 处理所有与API Key相关的API请求
 */
const apiKeyService = {
  /**
   * 获取API Key列表
   */
  getApiKeyList: () => {
    return apiClient.get<ApiKeyListResponse>({
      url: ApiKeyApi.GetApiKeyList,
    });
  },

  /**
   * 创建新的API Key
   */
  createApiKey: (data: CreateApiKeyDto) => {
    return apiClient.post<Result<ApiKey>>({
      url: ApiKeyApi.CreateApiKey,
      data,
    });
  },

  /**
   * 更新API Key
   */
  updateApiKey: (data: UpdateApiKeyDto) => {
    return apiClient.put<Result<ApiKey>>({
      url: ApiKeyApi.UpdateApiKey,
      data,
    });
  },

  /**
   * 删除API Key
   */
  deleteApiKey: (apiKeyId: string) => {
    return apiClient.delete<Result<void>>({
      url: `${ApiKeyApi.DeleteApiKey}/${apiKeyId}`,
    });
  },
};

export default apiKeyService;