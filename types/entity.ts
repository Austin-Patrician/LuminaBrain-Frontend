import { ex } from "node_modules/@fullcalendar/core/internal-common";
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
	ChatModelId: string;
	ChatModelName: string;
	Icon?: string;
	embeddingModelID: string;
	embeddingModelName: string;
	rerankModelID?: string;
	rerankModelName?: string;
	status: string;
	statusId: string;
	type: string;
	Creator: string;
	creationTime: Date;
	modifier: string;
	modificationTime: Date;
	relevance: number;
	prompt?: string;
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
}
