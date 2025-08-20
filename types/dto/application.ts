// Agent配置接口
export interface AgentConfig {
	agentId: string;
	agentName: string;
	functionChoiceBehavior: string;
	order: number;
}

export interface CreateApplicationDto {
	// 通用基础参数
	name: string;
	applicationTypeId: string;
	description: string | null;
	icon: string | null;
	promptWord: string;

	// Chat相关参数
	chatModelId: string | null;
	imageModelID: string | null;
	maxResponseTokens: number;
	maxRequestTokens: number;
	temperature: number;
	topP: number;
	frequencyPenalty: number;
	presencePenalty: number;
	isSummary: boolean;

	// Knowledge相关参数
	knowledgeIds: string[];
	embeddingModelId: string | null;
	rerankModelID: string | null;
	matchCount: number;
	relevance: number;
	isRerank: boolean;
	needModelSupport: boolean | null;

	// Agent相关参数
	agentConfigs: AgentConfig[];
	kernelFunctionTerminationStrategy: string;
	kernelFunctionSelectionStrategy: string;
	maximumIterations: number;
	isInLine: boolean; // 新增：是否按序执行

	AgentModeId: string;
	IsOutputAll: boolean;
}
