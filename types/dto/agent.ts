import type { Agent } from "../entity";

export interface CreateAgentDto {
	name: string;
	description?: string;
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
}

export interface UpdateAgentDto extends CreateAgentDto {
	id: string;
}

export interface AgentSearchParams {
	name?: string;
	statusId?: string;
	serviceId?: string;
	pageNumber?: number;
	pageSize?: number;
}

export interface AgentListResponse {
	data: Agent[];
	total: number;
}
