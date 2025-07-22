import apiClient from "@/api/apiClient";
import type {
  MarketplaceItem,
  MarketplaceListResponse,
  SearchParams,
  ShareItemDto,
  ImportConfig,
  ImportResult,
  DependencyInfo,
  Category,
  Tag,
} from "@/pages/marketPlace/types/marketplace";

// 定义API端点
enum MarketplaceApi {
  GetMarketplaceItems = "/marketplace/paged",
  GetMarketplaceItemById = "/marketplace",
  ShareItem = "/marketplace/share",
  ImportToWorkspace = "/marketplace/import",
  LikeItem = "/marketplace/like",
  UnlikeItem = "/marketplace/unlike",
  RateItem = "/marketplace/rate",
  GetDependencies = "/marketplace/dependencies",
  GetCategories = "/marketplace/categories",
  GetTags = "/marketplace/tags",
  GetMySharedItems = "/marketplace/my-shared",
  GetMyLikedItems = "/marketplace/my-liked",
  UpdateSharedItem = "/marketplace/update",
  DeleteSharedItem = "/marketplace/delete",
  ToggleItemStatus = "/marketplace/toggle-status",
  ViewItem = "/marketplace/view", // 记录查看次数
  GetFilterCategory = "/dictionaryItem/dropdown/{id}", // 获取分类过滤
}

// 分类响应类型
interface CategoriesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Category[];
}

// 标签响应类型
interface TagsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Tag[];
}

// 依赖信息响应类型
interface DependenciesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DependencyInfo[];
}

// 导入结果响应类型
interface ImportResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ImportResult;
}

// 用户互动响应类型
interface InteractionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}

const marketplaceService = {

  // 获取广场内容列表
  getFilterCategory: (params: string) => {
    return apiClient.post<MarketplaceListResponse>({
      url: MarketplaceApi.GetMarketplaceItems.replace("{id}", params),
    });
  },

  // 获取广场内容列表
  getMarketplaceItems: (params: SearchParams) => {
    return apiClient.post<MarketplaceListResponse>({
      url: MarketplaceApi.GetMarketplaceItems,
      data: params,
    });
  },

  // 根据ID获取广场项目详情
  getMarketplaceItemById: (id: string) => {
    return apiClient.get<MarketplaceItem>({
      url: `${MarketplaceApi.GetMarketplaceItemById}/${id}`,
    });
  },

  // 分享内容到广场
  shareItem: (data: ShareItemDto) => {
    return apiClient.post<MarketplaceItem>({
      url: MarketplaceApi.ShareItem,
      data,
    });
  },

  // 导入内容到工作区
  importToWorkspace: (itemId: string, config: ImportConfig) => {
    return apiClient.post<ImportResponse>({
      url: `${MarketplaceApi.ImportToWorkspace}/${itemId}`,
      data: config,
    });
  },

  // 点赞
  likeItem: (itemId: string) => {
    return apiClient.post<InteractionResponse>({
      url: `${MarketplaceApi.LikeItem}/${itemId}`,
    });
  },

  // 取消点赞
  unlikeItem: (itemId: string) => {
    return apiClient.post<InteractionResponse>({
      url: `${MarketplaceApi.UnlikeItem}/${itemId}`,
    });
  },

  // 评分
  rateItem: (itemId: string, rating: number) => {
    return apiClient.post<InteractionResponse>({
      url: `${MarketplaceApi.RateItem}/${itemId}`,
      data: { rating },
    });
  },

  // 记录查看
  viewItem: (itemId: string) => {
    return apiClient.post<InteractionResponse>({
      url: `${MarketplaceApi.ViewItem}/${itemId}`,
    });
  },

  // 获取依赖信息
  getDependencies: (itemId: string) => {
    return apiClient.get<DependenciesResponse>({
      url: `${MarketplaceApi.GetDependencies}/${itemId}`,
    });
  },

  // 获取分类列表
  getCategories: () => {
    return apiClient.get<CategoriesResponse>({
      url: MarketplaceApi.GetCategories,
    });
  },

  // 获取标签列表
  getTags: () => {
    return apiClient.get<TagsResponse>({
      url: MarketplaceApi.GetTags,
    });
  },

  // 获取我分享的内容
  getMySharedItems: (params: Pick<SearchParams, 'pageNumber' | 'pageSize' | 'sortBy'>) => {
    return apiClient.post<MarketplaceListResponse>({
      url: MarketplaceApi.GetMySharedItems,
      data: params,
    });
  },

  // 获取我点赞的内容
  getMyLikedItems: (params: Pick<SearchParams, 'pageNumber' | 'pageSize' | 'sortBy'>) => {
    return apiClient.post<MarketplaceListResponse>({
      url: MarketplaceApi.GetMyLikedItems,
      data: params,
    });
  },

  // 更新分享的内容
  updateSharedItem: (itemId: string, data: Partial<ShareItemDto>) => {
    return apiClient.put<MarketplaceItem>({
      url: `${MarketplaceApi.UpdateSharedItem}/${itemId}`,
      data,
    });
  },

  // 删除分享的内容
  deleteSharedItem: (itemId: string) => {
    return apiClient.delete<void>({
      url: `${MarketplaceApi.DeleteSharedItem}/${itemId}`,
    });
  },

  // 切换内容状态（激活/停用）
  toggleItemStatus: (itemId: string) => {
    return apiClient.post<MarketplaceItem>({
      url: `${MarketplaceApi.ToggleItemStatus}/${itemId}`,
    });
  },
};

export default marketplaceService;
