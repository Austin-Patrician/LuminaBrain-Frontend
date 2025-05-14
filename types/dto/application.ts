
export interface CreateApplicationDto {
  name: string;
  applicationTypeId: string;
  chatModelId: string;
  imageModelID: string | null;
  description: string | null;
  icon: string | null;
  maxResponseTokens: number;
  maxRequestTokens: number;
  knowledgeIds: string[];
  matchCount: number;
  embeddingModelId: string | null;
  needModelSupport: boolean | null;
  rerankModelID: string | null;
  promptWord: string;
  relevance: number;
  isSummary: boolean;
  isRerank: boolean;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}