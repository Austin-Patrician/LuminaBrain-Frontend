import type { BasicStatus, PermissionType } from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface UserInfo {
	id: string;
	email: string;
	username: string;
	password?: string;
	avatar?: string;
	role?: Role;
	status?: BasicStatus;
	permissions?: Permission[];
}

export interface Organization {
	id: string;
	name: string;
	status: "enable" | "disable";
	desc?: string;
	order?: number;
	children?: Organization[];
}

export interface Application {
	id: string;
	name: string;
	description?: string;
	applicationTypeId?: string;
	ChatModelId: string;
	ChatModelName: string;
	imageModelID?: string | null;
	Icon?: string;
	embeddingModelID: string;
	embeddingModelName: string;
	rerankModelID?: string | null;
	rerankModelName?: string;
	imageModelName?: string;
	status: string;
	statusId: string;
	type: string;
	Creator: string;
	creationTime: Date;
	modifier: string;
	modificationTime: Date;
	relevance: number;
	prompt?: string;
	maxResponseTokens?: number;
	maxRequestTokens?: number;
	knowledgeIds?: string[];
	matchCount?: number;
	needModelSupport?: boolean | null;
	promptWord?: string;
	isSummary?: boolean;
	isRerank?: boolean;
	temperature?: number;
	topP?: number;
	frequencyPenalty?: number;
	presencePenalty?: number;
}

export interface AIProvider {
	id: string;
	providerName: string;
	logo: string;
	status: string;
	tag: string;
	isConfigured: boolean;
	aiModels: AIModel[];
	aIModelKey?: string;
	endPoint?: string;
}

export interface UpdateProviderModel {
	id: string;
	endpoint?: string;
	modelKey?: string;
}

export interface AIModel {
	id: string;
	provider: string;
	aiProviderId: string;
	aiModelTypeName: string;
	aiModelTypeId: string;
	isConfigured: boolean;
	modelName: string;
	modelDescription?: string;
	creationTime: string;
	endPoint?: string;
	modelKey?: string;
}

export interface Permission {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission[];
}

export interface Role {
	id: string;
	name: string;
	label: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission[];
}

export interface KnowledgeItem {
	id: string;
	knowledgeId: string;
	data: string;
	fileId: string;
	dataCount: number;
	importType: string;
	knowledgeItemStatus: string;
	statusId: string;
	creationTime: string;
	enable: boolean;
	isQA: boolean;
}

export interface Knowledge {
	id: string;
	name: string;
	description?: string;
	pointStructCount: number;
	fileCount: number;
	sliceCount: number;
	avatar: string;
	statusId: string;
	creationTime: string;
	totalTextCount: number;
	chatModelID: string;
	chatModel: string;
	embeddingModelID: string;
	embeddingModel: string;
	maxTokensPerParagraph: number;
	maxTokensPerLine: number;
	overlappingTokens: number;
	isOCR: boolean;
	knowledgeItems?: KnowledgeItem[];
}

export interface Agent {
  id: string;
  name: string;
  instructions: string;
  serviceId: string;
  statusId: string;
  extensionData?: string;
  temperature?: number | null;
  topP?: number | null;
  frequencyPenalty?: number | null;
  presencePenalty?: number | null;
  maxTokens?: number | null;
  functionChoiceBehavior?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 单个AI模型数据结构
export interface AiModelItem {
  aiModelId: string;
  aiModelName: string;
}

// AI模型列表响应类型
export interface AiModelListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: AiModelItem[];
}

// 数据字典基础实体
export interface AuditEntity {
  id: string;
  creationTime?: Date;
  creator?: string;
  modificationTime?: Date;
  modifier?: string;
}

// 字典实体
export interface Dictionary extends AuditEntity {
  name: string;
  description?: string;
  sort: number;
  enabled: boolean;
}

// 字典项实体
export interface DictionaryItem extends AuditEntity {
  dictionaryId: string;
  value: string;
  label: string;
  description?: string;
  sort: number;
  enabled: boolean;
  parentId?: string;
  // 辅助字段
  dictionaryName?: string;
  children?: DictionaryItem[];
}

// 字典列表响应类型
export interface DictionaryListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    data: Dictionary[];
  };
}

// 字典项列表响应类型
export interface DictionaryItemListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    data: DictionaryItem[];
  };
}
