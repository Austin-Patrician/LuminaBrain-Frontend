// 广场项目类型定义
export type MarketplaceItemType = 'agent' | 'prompt' | 'application';

// 状态类型
export type MarketplaceItemStatus = 'active' | 'inactive' | 'pending' | 'rejected';

// 排序类型
export type SortType = 'latest' | 'popular' | 'rating' | 'downloads';

// Agent内容
export interface AgentContent {
  instructions: string;
  serviceId: string;
  serviceName?: string;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  maxTokens?: number;
  functionChoiceBehaviorId?: string;
  functionChoiceBehaviorName?: string;
}

// Prompt内容
export interface PromptContent {
  systemPrompt?: string;
  userPrompt: string;
  optimizationType: 'function-calling' | 'prompt-optimization';
  requirements?: string;
  modelRecommendations?: string[];
  enableDeepReasoning?: boolean;
}

// Application内容
export interface ApplicationContent {
  applicationTypeId: string;
  applicationTypeName?: string;
  chatModelId?: string;
  chatModelName?: string;
  promptWord?: string;
  description?: string;
  knowledgeIds?: string[];
  agentConfigs?: any[];
  temperature?: number;
  topP?: number;
  maxResponseTokens?: number;
  maxRequestTokens?: number;
}

// 内容联合类型
export type ItemContent = AgentContent | PromptContent | ApplicationContent;

// 广场项目主要实体
export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  type: MarketplaceItemType;
  category: string;
  tags: string[];
  
  // 内容数据
  content: ItemContent;
  
  // 元数据
  authorId: string;
  authorName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  
  // 互动数据
  likes: number;
  downloads: number;
  views: number;
  rating: number;
  ratingCount: number;
  
  // 状态管理
  status: MarketplaceItemStatus;
  isPublic: boolean;
  isFeatured: boolean;
}

// 搜索参数
export interface SearchParams {
  keyword?: string;
  type?: MarketplaceItemType | 'all';
  category?: string;
  tags?: string[];
  sortBy: SortType;
  author?: string;
  dateRange?: [string, string];
  minRating?: number;
  pageNumber: number;
  pageSize: number;
}

// 分享项目DTO
export interface ShareItemDto {
  title: string;
  description: string;
  type: MarketplaceItemType;
  category: string;
  tags: string[];
  content: ItemContent;
  isPublic: boolean;
  sourceId?: string; // 原始对象ID（Agent/Prompt/Application）
}

// 导入配置
export interface ImportConfig {
  targetName?: string;
  importDependencies: boolean;
  replaceExisting: boolean;
}

// 导入结果
export interface ImportResult {
  success: boolean;
  message: string;
  targetId?: string;
  conflictItems?: string[];
  createdItems?: string[];
}

// 依赖信息
export interface DependencyInfo {
  id: string;
  name: string;
  type: 'model' | 'knowledge' | 'agent' | 'other';
  required: boolean;
  available: boolean;
  description?: string;
}

// API响应类型
export interface MarketplaceListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    data: MarketplaceItem[];
  };
}

// 用户互动记录
export interface UserInteraction {
  itemId: string;
  userId: string;
  liked: boolean;
  rating?: number;
  viewedAt: string;
  downloadedAt?: string;
}

// 分类定义
export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  count?: number;
}

// 标签定义
export interface Tag {
  name: string;
  count: number;
  color?: string;
}

// 筛选状态
export interface FilterState {
  types: MarketplaceItemType[];
  categories: string[];
  tags: string[];
  ratingRange: [number, number];
  dateRange?: [string, string];
  authors: string[];
}
