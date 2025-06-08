// 执行计划相关类型定义

export interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeType: string;
  label: string;
  description?: string;
  dependencies: string[];
  estimatedDuration?: number;
  requiresUserInput: boolean;
  userInputConfig?: UserInputConfig;
  status: 'pending' | 'ready' | 'running' | 'waiting_input' | 'completed' | 'failed' | 'skipped';
  actualDuration?: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export interface UserInputConfig {
  type: 'text' | 'textarea' | 'select' | 'json' | 'confirm';
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    message?: string;
  };
  defaultValue?: any;
  showPreviousData?: boolean;
  previousDataKeys?: string[];
}

export interface ExecutionPlan {
  id: string;
  name: string;
  description?: string;
  workflowId: string;
  steps: ExecutionStep[];
  totalSteps: number;
  estimatedTotalDuration?: number;
  createdAt: number;
  updatedAt: number;
  status: 'draft' | 'ready' | 'running' | 'completed' | 'failed' | 'cancelled';
  version: string;
  metadata?: Record<string, any>;
}

export interface UserInputRequest {
  stepId: string;
  nodeId: string;
  nodeType: string;
  nodeName: string;
  inputConfig: UserInputConfig;
  previousData: Record<string, any>;
  timestamp: number;
}

export interface UserInputResponse {
  stepId: string;
  value: any;
  timestamp: number;
  userAgent?: string;
}
