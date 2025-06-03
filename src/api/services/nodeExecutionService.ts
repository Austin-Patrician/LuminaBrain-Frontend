import { apiClient } from '../apiClient';

export interface NodeExecutionRequest {
  nodeType: string;
  nodeId: string;
  nodeData: any;
  input: any;
  context?: any;
}

export interface NodeExecutionResponse {
  success: boolean;
  output: any;
  markdownOutput: string;
  error?: string;
  duration: number;
}

export const nodeExecutionService = {
  // Execute a single node
  executeNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post('/api/workflow/execute-node', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Node execution failed');
    }
  },

  // Execute AI dialog node
  executeAIDialogNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post('/api/workflow/execute-ai-dialog', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'AI dialog execution failed');
    }
  },

  // Execute database node
  executeDatabaseNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post('/api/workflow/execute-database', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Database execution failed');
    }
  },

  // Execute knowledge base node
  executeKnowledgeBaseNode: async (request: NodeExecutionRequest): Promise<NodeExecutionResponse> => {
    try {
      const response = await apiClient.post('/api/workflow/execute-knowledge-base', request);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Knowledge base execution failed');
    }
  },

  // Validate workflow before execution
  validateWorkflow: async (nodes: any[], edges: any[]): Promise<{ valid: boolean; errors: string[] }> => {
    try {
      const response = await apiClient.post('/api/workflow/validate', { nodes, edges });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Workflow validation failed');
    }
  }
};