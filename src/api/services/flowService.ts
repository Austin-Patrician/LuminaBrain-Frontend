import apiClient from '../apiClient';
import type {AiModelListResponse } from "#/entity";

// 流程数据接口定义 - 后端实体对应
export interface FlowData {
  id?: string;
  name: string;
  description: string;
  nodes: string;  // 序列化的JSON字符串
  edges: string;  // 序列化的JSON字符串
  viewport?: string;  // 序列化的JSON字符串，包含 {x, y, zoom}
  nodeCount?: number;
  connectionCount?: number;
  status?: 'draft' | 'published' | 'archived';
  tags?: string;  // 序列化的JSON字符串数组
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// 前端使用的流程数据接口（原始对象格式）
export interface FlowDataRaw {
  id?: string;
  name: string;
  description: string;
  nodes: any[];  // 原始节点数组
  edges: any[];  // 原始边数组
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
  nodeCount?: number;
  connectionCount?: number;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];  // 原始标签数组
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// 流程列表查询参数
export interface FlowListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  tags?: string[];
}

// 生成UUID的工具函数
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 数据转换工具函数：将前端原始数据转换为后端实体格式
const convertToBackendFormat = (rawData: FlowDataRaw): FlowData => {
  return {
    ...rawData,
    nodes: JSON.stringify(rawData.nodes || []),
    edges: JSON.stringify(rawData.edges || []),
    viewport: rawData.viewport ? JSON.stringify(rawData.viewport) : undefined,
    tags: rawData.tags ? JSON.stringify(rawData.tags) : undefined,
  };
};

// 数据转换工具函数：将后端实体格式转换为前端原始数据
const convertToFrontendFormat = (backendData: FlowData): FlowDataRaw => {
  try {
    return {
      ...backendData,
      nodes: JSON.parse(backendData.nodes || '[]'),
      edges: JSON.parse(backendData.edges || '[]'),
      viewport: backendData.viewport ? JSON.parse(backendData.viewport) : undefined,
      tags: backendData.tags ? JSON.parse(backendData.tags) : undefined,
    };
  } catch (error) {
    console.error('Failed to parse backend data:', error);
    throw new Error('Invalid backend data format');
  }
};

// 批量转换函数
const convertListToFrontendFormat = (backendList: FlowData[]): FlowDataRaw[] => {
  return backendList.map(convertToFrontendFormat);
};

// 流程API服务
export const flowService = {
  // 获取流程列表
  getFlows: async (params?: FlowListParams): Promise<FlowDataRaw[]> => {
    const response = await apiClient.get({ url: '/flows/page', params });
    // 假设后端返回的是FlowData[]格式
    return convertListToFrontendFormat(response.data);
  },

  // 根据ID获取流程详情
  getFlowById: async (id: string): Promise<FlowDataRaw> => {
    const response = await apiClient.get({ url: `/flows/${id}` });
    // 假设后端返回的是FlowData格式
    return convertToFrontendFormat(response);
  },

  // 创建新流程 - 发送实体格式
  createFlow: async (flowData: Omit<FlowDataRaw, 'id'>): Promise<FlowDataRaw> => {
    // 前端生成唯一ID
    const flowId = generateUUID();
    
    const rawDataWithId = {
      id: flowId,
      ...flowData,
      nodeCount: flowData.nodes.length,
      connectionCount: flowData.edges.length,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 转换为后端实体格式
    const backendData = convertToBackendFormat(rawDataWithId);
    
    console.log('Creating flow with data:', backendData);

    // 将ID拼接在路由中：POST /flows/{flowId}，发送实体格式
    const response = await apiClient.post({
      url: `/flows/${flowId}`,
      data: backendData
    });
    
    // 后端返回的是FlowData格式，转换为前端格式
    return response;
  },

  // 更新流程 - 发送实体格式
  updateFlow: async (id: string, flowData: Partial<FlowDataRaw>): Promise<FlowDataRaw> => {
    const rawDataWithMeta = {
      id,
      ...flowData,
      nodeCount: flowData.nodes ? flowData.nodes.length : undefined,
      connectionCount: flowData.edges ? flowData.edges.length : undefined,
      updatedAt: new Date().toISOString()
    };

    // 转换为后端实体格式（只转换有值的字段）
    const backendData: Partial<FlowData> = { ...rawDataWithMeta };
    if (rawDataWithMeta.nodes) {
      backendData.nodes = JSON.stringify(rawDataWithMeta.nodes);
    }
    if (rawDataWithMeta.edges) {
      backendData.edges = JSON.stringify(rawDataWithMeta.edges);
    }
    if (rawDataWithMeta.viewport) {
      backendData.viewport = JSON.stringify(rawDataWithMeta.viewport);
    }
    if (rawDataWithMeta.tags) {
      backendData.tags = JSON.stringify(rawDataWithMeta.tags);
    }
    
    // PUT /flows/{id} - 发送实体格式
    const response = await apiClient.put({
      url: `/flows/${id}`,
      data: backendData
    });
    
    // 后端返回的是FlowData格式，转换为前端格式
    return convertToFrontendFormat(response);
  },

  // 删除流程
  deleteFlow: async (id: string) => {
    return await apiClient.delete({ url: `/flows/${id}` });
  },

  // 复制流程
  copyFlow: async (id: string, newName?: string): Promise<FlowDataRaw> => {
    // 先获取原流程数据
    const originalFlow = await flowService.getFlowById(id);
    
    // 生成新的流程ID
    const newFlowId = generateUUID();
    
    // 创建复制的流程数据
    const copiedFlowData: FlowDataRaw = {
      ...originalFlow,
      id: newFlowId,
      name: newName || `${originalFlow.name} - 副本`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 转换为后端格式并发送
    const backendData = convertToBackendFormat(copiedFlowData);
    
    const response = await apiClient.post({
      url: `/flows/${newFlowId}`,
      data: backendData
    });
    
    return convertToFrontendFormat(response);
  },

  // 发布流程
  publishFlow: async (id: string): Promise<FlowDataRaw> => {
    const response = await apiClient.put({
      url: `/flows/${id}/publish`,
      data: {}
    });
    
    return convertToFrontendFormat(response);
  },

/**
   * 根据AI模型类型ID获取AI模型集合
   */
  getAiModelsByTypeId: () => {
    return apiClient.get<AiModelListResponse>({
      url:   "/aiModel/getByTypeId/0D826A41-45CE-4870-8893-A8D4FAECD3A4",
    });
  },

  // 归档流程
  archiveFlow: async (id: string): Promise<FlowDataRaw> => {
    const response = await apiClient.put({
      url: `/flows/${id}/archive`,
      data: {}
    });
    
    return convertToFrontendFormat(response);
  },

  // 运行流程
  runFlow: async (id: string, inputs?: any) => {
    const inputsData = inputs ? { inputs: JSON.stringify(inputs) } : {};
    
    return await apiClient.post({
      url: `/flows/${id}/run`,
      data: inputsData
    });
  },

  // 验证流程配置
  validateFlow: async (flowData: FlowDataRaw) => {
    const backendData = convertToBackendFormat(flowData);
    
    return await apiClient.post({
      url: '/flows/validate',
      data: backendData
    });
  }
};

// 导出转换函数和UUID生成函数供其他地方使用
export { 
  convertToBackendFormat, 
  convertToFrontendFormat, 
  convertListToFrontendFormat, 
  generateUUID,
  type FlowDataRaw  // 导出前端使用的原始数据类型
};