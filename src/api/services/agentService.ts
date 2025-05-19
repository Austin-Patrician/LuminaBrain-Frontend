// aimodelService.ts
import apiClient from "@/api/apiClient";
import type { Agent,AiModelListResponse } from "#/entity";
import type { CreateAgentDto, UpdateAgentDto, AgentSearchParams } from "#/dto/agent";
// 定义API端点
enum AgentApi {
  GetAgentList = "/agent/paged",
  GetAgentById = "/agent",
  AddAgent = "/agent/add",
  UpdateAgent = "/agent/update",
  DeleteAgent = "/agent/delete",
  GetAiModelsByTypeId = "/aiModel/getByTypeId{id}" , // 根据类型ID获取AI模型列表
}


interface AgentListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    total: number;
    data: Agent[];
  };
}

const agentService = {
  // 获取Agent列表
  getAgentList: (params?: AgentSearchParams) => {
    return apiClient.post<AgentListResponse>({
      url: AgentApi.GetAgentList,
      data: params,
    });
  },
  getAiModelsByTypeId: (id: string) => {
    return apiClient.get<AiModelListResponse>({
      url: AgentApi.GetAiModelsByTypeId.replace('{id}', id),
    });
  },

  // 根据ID获取Agent
  getAgentById: (id: string) => {
    return apiClient.get<Agent>({
      url: `${AgentApi.GetAgentById}/${id}`,
    });
  },

  // 创建新Agent
  createAgent: (data: CreateAgentDto) => {
    return apiClient.post<Agent>({
      url: AgentApi.AddAgent,
      data,
    });
  },

  // 更新Agent
  updateAgent: (data: UpdateAgentDto) => {
    return apiClient.put<Agent>({
      url: AgentApi.UpdateAgent,
      data,
    });
  },

  // 删除Agent
  deleteAgent: (id: string) => {
    return apiClient.delete<void>({
      url: `${AgentApi.DeleteAgent}/${id}`,
    });
  },
};

export default agentService;
