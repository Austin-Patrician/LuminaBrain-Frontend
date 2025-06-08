import apiClient from '../apiClient';
import type { 
  NodeExecutionRequest, 
  NodeExecutionResponse 
} from './flowService';

// 重新导出接口以保持向后兼容性
export type { NodeExecutionRequest, NodeExecutionResponse };

export const nodeExecutionService = {
  // Execute a single node
  executeNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post({
        url: '/api/workflow/execute-node',
        data: request
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Node execution failed');
    }
  },

  // Execute AI dialog node
  executeAIDialogNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post({
        url: '/api/workflow/execute-ai-dialog',
        data: request
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'AI dialog execution failed');
    }
  },

  // Execute database node
  executeDatabaseNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post({
        url: '/api/workflow/execute-database',
        data: request
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Database execution failed');
    }
  },

  // Execute knowledge base node
  executeKnowledgeBaseNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post({
        url: '/api/workflow/execute-knowledge-base',
        data: request
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Knowledge base execution failed');
    }
  },

  // Validate workflow before execution
  validateWorkflow: async (nodes: any[], edges: any[]): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await apiClient.post({
        url: '/api/workflow/validate',
        data: { nodes, edges }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Workflow validation failed');
    }
  }
};