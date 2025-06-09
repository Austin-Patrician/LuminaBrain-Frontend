import apiClient from "@/api/apiClient";
import type { 
  Dictionary, 
  DictionaryItem, 
  DictionaryListResponse, 
  DictionaryItemListResponse 
} from "#/entity";

// 字典查询参数
interface DictionarySearchParams {
  name?: string;
  enabled?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

// 字典项查询参数
interface DictionaryItemSearchParams {
  dictionaryId?: string;
  value?: string;
  label?: string;
  enabled?: boolean;
  parentId?: string;
  pageNumber?: number;
  pageSize?: number;
}

// 字典创建DTO
interface CreateDictionaryDto {
  name: string;
  description?: string;
  sort: number;
  enabled: boolean;
}

// 字典项创建DTO
interface CreateDictionaryItemDto {
  dictionaryId: string;
  value: string;
  label: string;
  description?: string;
  sort: number;
  enabled: boolean;
  parentId?: string;
}

export enum DictionaryApi {
  // 字典API
  QueryDictionaryList = "/dictionary/paged",
  QueryDictionaryById = "/dictionary",
  AddDictionary = "/dictionary/add",
  UpdateDictionary = "/dictionary/update",
  DeleteDictionary = "/dictionary/delete",
  GetDictionaryDropdown = "/dictionary/dropdown",
  
  // 字典项API
  QueryDictionaryItemList = "/dictionaryItem/paged",
  QueryDictionaryItemById = "/dictionaryItem",
  AddDictionaryItem = "/dictionaryItem/add",
  UpdateDictionaryItem = "/dictionaryItem/update",
  DeleteDictionaryItem = "/dictionaryItem/delete",
  GetDictionaryItemsByDictionaryId = "/dictionaryItem/byDictionary",
  GetDictionaryItemTree = "/dictionaryItem/tree",
}

/**
 * Dictionary Service - handles all API requests related to dictionaries
 */
const dictionaryService = {
  // ===== 字典相关API =====
  
  /**
   * 获取字典列表（分页）
   */
  getDictionaryList: (params?: DictionarySearchParams) => {
    return apiClient.post<DictionaryListResponse>({
      url: DictionaryApi.QueryDictionaryList,
      data: params,
    });
  },

  /**
   * 根据ID获取字典详情
   */
  getDictionaryById: (id: string) => {
    return apiClient.get<Dictionary>({
      url: `${DictionaryApi.QueryDictionaryById}/${id}`,
    });
  },

  /**
   * 创建新字典
   */
  createDictionary: (data: CreateDictionaryDto) => {
    return apiClient.post<Dictionary>({
      url: DictionaryApi.AddDictionary,
      data,
    });
  },

  /**
   * 更新字典
   */
  updateDictionary: (data: Dictionary) => {
    return apiClient.put<Dictionary>({
      url: `${DictionaryApi.UpdateDictionary}/${data.id}`,
      data,
    });
  },

  /**
   * 删除字典
   */
  deleteDictionary: (id: string) => {
    return apiClient.delete<void>({
      url: `${DictionaryApi.DeleteDictionary}/${id}`,
    });
  },

  /**
   * 获取字典下拉选项
   */
  getDictionaryDropdown: () => {
    return apiClient.get<{success: boolean; data: Array<{value: string; label: string}>}>({
      url: DictionaryApi.GetDictionaryDropdown,
    });
  },

  // ===== 字典项相关API =====

  /**
   * 获取字典项列表（分页）
   */
  getDictionaryItemList: (params?: DictionaryItemSearchParams) => {
    return apiClient.post<DictionaryItemListResponse>({
      url: DictionaryApi.QueryDictionaryItemList,
      data: params,
    });
  },

  /**
   * 根据ID获取字典项详情
   */
  getDictionaryItemById: (id: string) => {
    return apiClient.get<DictionaryItem>({
      url: `${DictionaryApi.QueryDictionaryItemById}/${id}`,
    });
  },

  /**
   * 根据字典ID获取字典项列表
   */
  getDictionaryItemsByDictionaryId: (dictionaryId: string) => {
    return apiClient.get<{success: boolean; data: DictionaryItem[]}>({
      url: `${DictionaryApi.GetDictionaryItemsByDictionaryId}/${dictionaryId}`,
    });
  },

  /**
   * 获取字典项树形结构
   */
  getDictionaryItemTree: (dictionaryId: string) => {
    return apiClient.get<{success: boolean; data: DictionaryItem[]}>({
      url: `${DictionaryApi.GetDictionaryItemTree}/${dictionaryId}`,
    });
  },

  /**
   * 创建新字典项
   */
  createDictionaryItem: (data: CreateDictionaryItemDto) => {
    return apiClient.post<DictionaryItem>({
      url: DictionaryApi.AddDictionaryItem,
      data,
    });
  },

  /**
   * 更新字典项
   */
  updateDictionaryItem: (data: DictionaryItem) => {
    return apiClient.put<DictionaryItem>({
      url: `${DictionaryApi.UpdateDictionaryItem}/${data.id}`,
      data,
    });
  },

  /**
   * 删除字典项
   */
  deleteDictionaryItem: (id: string) => {
    return apiClient.delete<void>({
      url: `${DictionaryApi.DeleteDictionaryItem}/${id}`,
    });
  },
};

export default dictionaryService;
export type { 
  DictionarySearchParams, 
  DictionaryItemSearchParams, 
  CreateDictionaryDto, 
  CreateDictionaryItemDto 
};