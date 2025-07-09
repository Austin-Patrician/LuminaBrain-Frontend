import { ExecutionPlan, ExecutionStep, UserInputRequest, UserInputResponse } from '@/types/executionPlan';

// 执行上下文接口
export interface ExecutionContext {
  variables: Record<string, any>;
  nodeResults: Record<string, any>;
  userInput?: string;
  executionPlan?: ExecutionPlan;
  currentStep?: ExecutionStep;
  usingExecutionPlan?: boolean; // 是否正在使用执行计划模式
}

// 优化的调试输入数据接口
export interface DebugNodeInput {
  // 节点基本信息
  nodeInfo: {
    nodeId: string;
    nodeType: string;
    label?: string;
    description?: string;
    inputSource?: string;
  };
  
  // 节点核心配置（分类显示）
  nodeConfig: Record<string, any>;
  
  // 运行时上下文数据（分类显示）
  contextData: {
    userInput?: string;           // 用户输入（单独显示）
    previousNodeResults?: Record<string, {
      output?: any;
      result?: any;
      markdownOutput?: string;
    }>;                          // 前置节点结果（精简版）
    systemVariables?: Record<string, any>;  // 系统变量
  };
  
  // 执行环境信息
  executionMeta: {
    executionId?: string;
    stepId?: string;
    workflowId?: string;
    timestamp: number;
  };
}

// 调试节点结果接口
export interface DebugNodeResult {
  nodeId: string;
  nodeType: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_input';
  startTime?: number;
  endTime?: number;
  duration: number;
  input?: DebugNodeInput;    // 使用优化的输入数据结构
  output?: any;
  markdownOutput?: string;
  error?: string;
  timestamp: number;
}

// 调试执行状态接口
export interface DebugExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped' | 'waiting_input';
  currentNode?: string;
  completedNodes: string[];
  totalNodes: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  results?: Record<string, DebugNodeResult>;
  executionPlan?: ExecutionPlan;
  currentUserInputRequest?: UserInputRequest;
}

// 执行统计接口
export interface ExecutionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  nodeExecutionCounts: Record<string, number>;
  nodeAverageExecutionTimes: Record<string, number>;
  lastExecutionTime?: number;
  peakMemoryUsage: number;
  currentMemoryUsage: number;
}

// 节点性能统计接口
export interface NodePerformanceStats {
  nodeId: string;
  nodeType: string;
  executionCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  successCount: number;
  failureCount: number;
  lastExecutionTime?: number;
}

// 重新导出用于兼容性
export type { UserInputRequest, UserInputResponse, ExecutionPlan, ExecutionStep };
