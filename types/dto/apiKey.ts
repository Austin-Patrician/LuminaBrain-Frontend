// API Key相关的DTO定义

// 创建API Key的DTO
export interface CreateApiKeyDto {
  apiKeyName: string;
  validDays: number; // 30, 90, 120, 180, -1(永不过期)
}

// 更新API Key的DTO
export interface UpdateApiKeyDto {
  apiKeyId: string;
  apiKeyName: string;
}

// API Key实体接口
export interface ApiKey {
  apiKeyId: string;
  apiKeyName: string;
  apiKeyValue: string;
  expirationTimeStamp: string;
}

// API Key列表响应接口
export interface ApiKeyListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ApiKey[];
}

// ValidDays选项定义
export const VALID_DAYS_OPTIONS = [
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
  { label: '120天', value: 120 },
  { label: '180天', value: 180 },
  { label: '永不过期', value: -1 }
] as const;

// ValidDays类型
export type ValidDaysType = typeof VALID_DAYS_OPTIONS[number]['value'];