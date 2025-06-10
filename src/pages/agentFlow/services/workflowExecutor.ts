import { Node, Edge } from '@xyflow/react';
import { ExecutionPlan, ExecutionStep, UserInputRequest, UserInputResponse } from '@/types/executionPlan';
import ExecutionPlanGenerator from './executionPlanGenerator';
import { requiresUserInput } from '../constants/inputSource';
import { 
  flowService, 
  type OptimizedNodeExecutionRequest,
  type NodeConfig
} from '@/api/services/flowService';

// 执行上下文接口
export interface ExecutionContext {
  variables: Record<string, any>;
  nodeResults: Record<string, any>;
  userInput?: string;
  executionPlan?: ExecutionPlan;
  currentStep?: ExecutionStep;
  usingExecutionPlan?: boolean; // 是否正在使用执行计划模式
}

// 调试节点结果接口
export interface DebugNodeResult {
  nodeId: string;
  nodeType: string;
  status: 'running' | 'completed' | 'failed' | 'waiting_input';
  startTime?: number;
  endTime?: number;
  duration: number;
  input?: any;
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

// 节点执行器基类
abstract class NodeExecutor {
  // ===== 新版本：使用优化后的扁平化接口 =====
  async executeOptimized(input: any, context: ExecutionContext): Promise<any> {
    const nodeType = this.getNodeType();
    const nodeId = context.currentStep?.nodeId || input.nodeId || 'unknown';
    
    // 构建优化后的扁平化请求
    const optimizedRequest: OptimizedNodeExecutionRequest = {
      // 节点标识（扁平化）
      nodeId,
      nodeType,
      label: input.label,
      description: input.description,
      
      // 执行环境（扁平化）
      executionId: context.executionPlan?.id || '',
      stepId: context.currentStep?.id || '',
      workflowId: context.executionPlan?.workflowId || '',
      
      // 节点配置（强类型）
      config: this.buildOptimizedNodeConfig(input, nodeType),
      
      // 运行时数据（扁平化，统一管理）
      variables: {
        ...context.variables,
        ...(context.userInput ? { userInput: context.userInput } : {})
      },
      nodeResults: this.limitNodeResults(context.nodeResults || {}, 5), // 限制历史结果数量
      userInput: context.userInput,
      userMessage: input.userMessage,
      inputData: input.data,
      previousResult: this.getMinimalPreviousResult(context.nodeResults || {}),
      
      // 执行选项（扁平化）
      timeout: this.getNodeTimeout(nodeType),
      retryCount: this.getNodeRetryCount(nodeType),
      async: false,
      enableLogging: true,
      enableMetrics: true
    };

    try {
      const response = await flowService.executeNode(optimizedRequest);
      
      if (!response.success) {
        throw new Error(response.error || 'Node execution failed');
      }

      return this.normalizeOutput(response.output, response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Node execution failed');
    }
  }

  // ===== 主要执行方法：直接使用优化接口 =====
  async execute(input: any, context: ExecutionContext): Promise<any> {
    // 直接使用优化接口，不再回退到旧接口
    return await this.executeOptimized(input, context);
  }

  // ===== 新增：构建优化后的强类型节点配置 =====
  protected buildOptimizedNodeConfig(input: any, nodeType: string): NodeConfig {
    // 优先从 input.config 中读取配置，如果不存在则从 input 的根级别读取（向后兼容）
    const config = input.config || input;
    
    switch (nodeType) {
      case 'aiDialogNode':
        return {
          nodeType: 'aiDialogNode',
          model: config.model || config.selectedModel || '',
          systemPrompt: config.systemPrompt,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 1000,
          stream: config.stream ?? false
        };
      
      case 'databaseNode':
        return {
          nodeType: 'databaseNode',
          dbType: config.dbType || '',
          connectionString: config.connectionString || '',
          query: config.query || '',
          parameters: config.parameters
        };
      
      case 'knowledgeBaseNode':
        return {
          nodeType: 'knowledgeBaseNode',
          knowledgeBaseId: config.knowledgeBaseId || '',
          searchQuery: config.searchQuery,
          topK: config.topK ?? 5,
          similarityThreshold: config.similarityThreshold ?? 0.7,
          searchType: config.searchType ?? 'semantic'
        };
      
      case 'httpNode':
        return {
          nodeType: 'httpNode',
          url: config.url || '',
          method: config.method || 'GET',
          headers: config.headers,
          body: config.body
        };
      
      case 'conditionNode':
        return {
          nodeType: 'conditionNode',
          condition: config.condition || '',
          conditionType: config.conditionType ?? 'expression'
        };
      
      case 'dataProcessNode':
        return {
          nodeType: 'dataProcessNode',
          processType: config.processType || 'transform',
          transformScript: config.transformScript,
          filterCondition: config.filterCondition,
          aggregateFields: config.aggregateFields,
          sortBy: config.sortBy,
          sortOrder: config.sortOrder ?? 'asc',
          groupBy: config.groupBy
        };
      
      case 'startNode':
        return {
          nodeType: 'startNode',
          triggerType: config.triggerType ?? 'manual',
          initialData: config.initialData
        };
      
      case 'endNode':
        return {
          nodeType: 'endNode',
          outputFormat: config.outputFormat ?? 'json',
          returnCode: config.returnCode ?? 0,
          finalMessage: config.finalMessage
        };
      
      case 'userInputNode':
        return {
          nodeType: 'userInputNode',
          userInputType: config.userInputType || 'text',
          placeholder: config.placeholder,
          defaultValue: config.defaultValue,
          validation: config.validation,
          options: config.options
        };
      
      case 'responseNode':
        return {
          nodeType: 'responseNode',
          responseTemplate: config.responseTemplate || '',
          responseFormat: config.responseFormat ?? 'text',
          statusCode: config.statusCode ?? 200
        };
      
      default:
        // 兼容其他节点类型
        return {
          nodeType: nodeType as any,
          ...input
        } as NodeConfig;
    }
  }

  // ===== 新增：辅助方法 =====
  
  // 限制节点结果数量，减少payload大小
  protected limitNodeResults(nodeResults: Record<string, any>, limit: number = 5): Record<string, any> {
    const entries = Object.entries(nodeResults);
    if (entries.length <= limit) {
      return nodeResults;
    }
    
    // 保留最近的结果
    const recentEntries = entries
      .sort(([, a], [, b]) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit);
    
    return Object.fromEntries(recentEntries);
  }

  // 创建结果摘要，减少数据传输
  protected createResultSummary(result: any): any {
    if (typeof result === 'string') {
      return {
        type: 'string',
        preview: result.substring(0, 200),
        size: result.length
      };
    }
    
    if (Array.isArray(result)) {
      return {
        type: 'array',
        length: result.length,
        preview: result.slice(0, 3)
      };
    }
    
    if (typeof result === 'object' && result !== null) {
      return {
        type: 'object',
        keys: Object.keys(result),
        preview: Object.fromEntries(
          Object.entries(result).slice(0, 3)
        )
      };
    }
    
    return result;
  }

  // 估算对象大小
  protected estimateSize(obj: any): number {
    return JSON.stringify(obj).length;
  }

  // 获取内存使用情况
  protected getEstimatedMemoryUsage(): number {
    // 浏览器环境下的内存估算
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  // 标准化节点数据
  protected normalizeNodeData(input: any): any {
    // 过滤掉不需要的调试信息和临时数据
    const { context, ...nodeData } = input || {};
    return nodeData;
  }

  // 标准化输入数据
  protected normalizeInput(input: any, context: ExecutionContext): any {
    return {
      ...input,
      inputSource: input?.inputSource,
      userInput: context.userInput,
      previousResult: this.getMinimalPreviousResult(context.nodeResults || {}),
      hasContext: !!Object.keys(context.nodeResults || {}).length
    };
  }

  // 标准化输出数据
  protected normalizeOutput(output: string | any, response: any): any {
    // 如果 output 是字符串（markdown），则将其包装在标准输出格式中
    if (typeof output === 'string') {
      return {
        markdownOutput: output,
        result: output,
        executionTime: response.executionTime,
        timestamp: response.timestamp,
        metadata: response.metadata
      };
    }

    // 如果 output 是对象，则直接合并
    return {
      ...output,
      executionTime: response.executionTime,
      timestamp: response.timestamp,
      metadata: response.metadata
    };
  }

  // 获取节点超时时间（毫秒）
  protected getNodeTimeout(nodeType: string): number {
    // 根据节点类型返回不同的超时时间
    const timeouts: Record<string, number> = {
      'aiDialogNode': 30000,
      'aiSummaryNode': 45000,
      'aiExtractNode': 30000,
      'aiJsonNode': 30000,
      'databaseNode': 15000,
      'knowledgeBaseNode': 20000,
      'httpNode': 10000,
      'startNode': 1000,
      'endNode': 1000,
      'userInputNode': 1000,
      'dataProcessNode': 5000,
      'conditionNode': 3000,
      'responseNode': 2000
    };
    return timeouts[nodeType] || 10000; // 默认10秒
  }

  // 获取节点重试次数
  protected getNodeRetryCount(nodeType: string): number {
    // 根据节点类型返回不同的重试次数
    const retryCounts: Record<string, number> = {
      'aiDialogNode': 2,
      'aiSummaryNode': 2,
      'aiExtractNode': 2,
      'aiJsonNode': 2,
      'databaseNode': 1,
      'knowledgeBaseNode': 1,
      'httpNode': 3,
      'startNode': 0,
      'endNode': 0,
      'userInputNode': 0,
      'dataProcessNode': 1,
      'conditionNode': 0,
      'responseNode': 0
    };
    return retryCounts[nodeType] || 1; // 默认重试1次
  }

  // 子类需要实现的方法：返回节点类型，默认实现通过构造函数名推导
  protected getNodeType(): string {
    // 从类名推导节点类型，例如 AIDialogNodeExecutor -> aiDialogNode
    const className = this.constructor.name;
    if (className.endsWith('Executor')) {
      const nodeTypeName = className.slice(0, -8); // 移除 'Executor' 后缀
      // 将驼峰命名转换为首字母小写：AIDialogNode -> aiDialogNode
      return nodeTypeName.charAt(0).toLowerCase() + nodeTypeName.slice(1);
    }
    return 'unknown';
  }

  // 获取最小化的前一个节点结果
  protected getMinimalPreviousResult(nodeResults: Record<string, any>): any {
    if (!nodeResults || Object.keys(nodeResults).length === 0) {
      return undefined;
    }
    
    // 获取最后一个执行完成的节点结果
    const results = Object.values(nodeResults);
    const lastResult = results[results.length - 1];
    
    if (!lastResult) return undefined;
    
    // 只保留输出相关的核心字段
    return {
      output: lastResult.output,
      response: lastResult.response,
      result: lastResult.result,
      data: lastResult.data
    };
  }

  protected logExecution(_nodeId: string, _input: any, _context: ExecutionContext): void {
    // 执行日志记录 - 已移除控制台输出
  }

  // 构建节点配置（简化版本，用于兼容）
  protected buildNodeConfig(input: any, _nodeType: string): any {
    // 简单地返回输入中的所有非标准字段作为配置
    const config: any = {};
    
    if (input && typeof input === 'object') {
      // 排除标准的节点字段，其余的都作为配置
      const standardFields = ['nodeId', 'nodeType', 'label', 'description', 'inputSource', 'runtimeData'];
      
      for (const [key, value] of Object.entries(input)) {
        if (!standardFields.includes(key) && value !== undefined) {
          config[key] = value;
        }
      }
    }
    
    return config;
  }

}

// AI对话节点执行器
class AIConversationExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'aiConversationNode';
  }
}

// 用户输入节点执行器
class UserInputExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'userInputNode';
  }
}

// 条件判断节点执行器
class ConditionExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'conditionNode';
  }
}

// 数据处理节点执行器
class DataProcessExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'dataProcessNode';
  }
}

// 开始节点执行器
class StartNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'startNode';
  }

  // 重写执行方法，跳过后端API调用，进行本地处理
  async execute(input: any, context: ExecutionContext): Promise<any> {
    const nodeType = this.getNodeType();
    
    // 开始节点只需要进行本地初始化，不调用后端API
    // 设置初始数据到上下文变量中
    if (input.config?.initialData) {
      context.variables = { ...context.variables, ...input.config.initialData };
    }
    
    // 如果有用户输入，将其添加到上下文中
    if (context.userInput || input.runtimeData?.userInput) {
      context.variables = { 
        ...context.variables, 
        userInput: context.userInput || input.runtimeData.userInput 
      };
    }
    
    // 返回标准化的开始节点输出
    const output = {
      message: '工作流已开始',
      initialData: input.config?.initialData || {},
      userInput: context.userInput || input.runtimeData?.userInput,
      timestamp: Date.now()
    };
    
    return this.normalizeOutput(output, {
      success: true,
      output: `### 工作流开始\n\n- **触发类型**: ${input.config?.triggerType || 'manual'}\n- **开始时间**: ${new Date().toLocaleString()}\n- **初始数据**: ${JSON.stringify(input.config?.initialData || {}, null, 2)}\n- **用户输入**: ${context.userInput || input.runtimeData?.userInput || '无'}`,
      nodeId: input.nodeId,
      nodeType,
      timestamp: Date.now()
    });
  }
}

// 结束节点执行器
class EndNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'endNode';
  }

  // 重写执行方法，跳过后端API调用，进行本地处理
  async execute(input: any, context: ExecutionContext): Promise<any> {
    const nodeType = this.getNodeType();
    
    // 结束节点只需要进行本地处理，不调用后端API
    // 获取上一个节点的结果
    const previousResults = Object.values(context.nodeResults);
    const lastResult = previousResults[previousResults.length - 1];
    
    // 构建结束节点的输出，展示上一节点的结果
    const output = {
      message: '工作流已完成',
      previousResult: lastResult,
      finalOutput: lastResult?.output || lastResult?.result || lastResult,
      outputFormat: input.config?.outputFormat || 'json',
      returnCode: input.config?.returnCode || 0,
      timestamp: Date.now()
    };

    // 生成Markdown输出
    let markdownOutput = '### 工作流完成\n\n';
    markdownOutput += `- **完成时间**: ${new Date().toLocaleString()}\n`;
    markdownOutput += `- **返回码**: ${input.config?.returnCode || 0}\n`;
    markdownOutput += `- **输出格式**: ${input.config?.outputFormat || 'json'}\n\n`;
    
    if (lastResult) {
      markdownOutput += '#### 最终结果\n\n';
      if (lastResult.markdownOutput) {
        markdownOutput += lastResult.markdownOutput;
      } else if (lastResult.output) {
        markdownOutput += '```json\n' + JSON.stringify(lastResult.output, null, 2) + '\n```';
      } else if (lastResult.result) {
        markdownOutput += '```json\n' + JSON.stringify(lastResult.result, null, 2) + '\n```';
      } else {
        markdownOutput += '```json\n' + JSON.stringify(lastResult, null, 2) + '\n```';
      }
    } else {
      markdownOutput += '#### 最终结果\n\n无前置节点结果';
    }

    if (input.config?.finalMessage) {
      markdownOutput += `\n\n#### 结束消息\n\n${input.config.finalMessage}`;
    }
    
    return this.normalizeOutput(output, {
      success: true,
      output: markdownOutput,
      nodeId: input.nodeId,
      nodeType,
      timestamp: Date.now()
    });
  }
}

// AI对话节点执行器
class AIDialogNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'aiDialogNode';
  }
}

// 数据库节点执行器
class DatabaseNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'databaseNode';
  }
}

// 知识库节点执行器
class KnowledgeBaseNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'knowledgeBaseNode';
  }
}

// 响应节点执行器
class ResponseNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'responseNode';
  }
}

// 工作流执行器类
class WorkflowExecutor {
  private debugState: DebugExecutionState = {
    status: 'idle',
    completedNodes: [],
    totalNodes: 0
  };
  
  private nodeExecutors: Map<string, NodeExecutor> = new Map();
  private listeners: ((state: DebugExecutionState) => void)[] = [];
  private abortController?: AbortController;
  
  // 新增：执行计划生成器和用户交互支持
  private executionPlanGenerator: ExecutionPlanGenerator;
  private userInputResolver?: (response: UserInputResponse) => void;
  
  // 执行统计数据
  private executionStats: ExecutionStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    totalExecutionTime: 0,
    nodeExecutionCounts: {},
    nodeAverageExecutionTimes: {},
    peakMemoryUsage: 0,
    currentMemoryUsage: 0
  };
  
  // 节点性能统计
  private nodePerformanceStats: Map<string, NodePerformanceStats> = new Map();
  
  // 执行历史记录
  private executionHistory: Array<{
    id: string;
    startTime: number;
    endTime?: number;
    status: string;
    nodeCount: number;
    duration?: number;
  }> = [];

  constructor() {
    // 注册节点执行器
    this.initializeNodeExecutors();
    // 初始化执行计划生成器
    this.executionPlanGenerator = new ExecutionPlanGenerator();
  }

  private initializeNodeExecutors(): void {
    // 注册节点执行器 - 映射节点类型到对应的执行器
    this.nodeExecutors.set('startNode', new StartNodeExecutor());
    this.nodeExecutors.set('endNode', new EndNodeExecutor());
    this.nodeExecutors.set('aiDialogNode', new AIDialogNodeExecutor());
    this.nodeExecutors.set('aiSummaryNode', new AIDialogNodeExecutor());
    this.nodeExecutors.set('aiExtractNode', new AIDialogNodeExecutor());
    this.nodeExecutors.set('aiJsonNode', new AIDialogNodeExecutor());
    this.nodeExecutors.set('databaseNode', new DatabaseNodeExecutor());
    this.nodeExecutors.set('knowledgeBaseNode', new KnowledgeBaseNodeExecutor());
    this.nodeExecutors.set('bingNode', new KnowledgeBaseNodeExecutor());
    this.nodeExecutors.set('responseNode', new ResponseNodeExecutor());
    this.nodeExecutors.set('conditionNode', new ConditionExecutor());
    this.nodeExecutors.set('decisionNode', new ConditionExecutor());
    this.nodeExecutors.set('jsonExtractor', new DataProcessExecutor());
    this.nodeExecutors.set('basicNode', new DataProcessExecutor());
    this.nodeExecutors.set('processNode', new DataProcessExecutor());
    this.nodeExecutors.set('customNode', new DataProcessExecutor());
    
    // 兼容旧的命名方式
    this.nodeExecutors.set('ai-conversation', new AIConversationExecutor());
    this.nodeExecutors.set('user-input', new UserInputExecutor());
    this.nodeExecutors.set('condition', new ConditionExecutor());
    this.nodeExecutors.set('data-process', new DataProcessExecutor());
    this.nodeExecutors.set('start-node', new StartNodeExecutor());
    this.nodeExecutors.set('end-node', new EndNodeExecutor());
    this.nodeExecutors.set('ai-dialog-node', new AIDialogNodeExecutor());
    this.nodeExecutors.set('database-node', new DatabaseNodeExecutor());
    this.nodeExecutors.set('knowledge-base-node', new KnowledgeBaseNodeExecutor());
    this.nodeExecutors.set('response-node', new ResponseNodeExecutor());
  }
  
  // 获取当前调试状态
  getDebugState(): DebugExecutionState {
    return { ...this.debugState };
  }
  
  // 监听执行状态变化
  onExecutionStateChange(callback: (state: DebugExecutionState) => void): void {
    this.listeners.push(callback);
  }
  
  // 移除执行状态监听器
  removeExecutionStateChangeListener(callback: (state: DebugExecutionState) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  // 通知状态变化
  private notifyStateChange(): void {
    const state = this.getDebugState();
    this.listeners.forEach(listener => listener(state));
  }
  
  // 更新调试状态
  private updateDebugState(updates: Partial<DebugExecutionState>): void {
    this.debugState = { ...this.debugState, ...updates };
    this.notifyStateChange();
  }
  
  // 获取执行统计信息
  getExecutionStats(): ExecutionStats {
    return { ...this.executionStats };
  }

  // 获取节点性能统计
  getNodePerformanceStats(): NodePerformanceStats[] {
    return Array.from(this.nodePerformanceStats.values());
  }

  // 获取执行历史
  getExecutionHistory(): Array<{
    id: string;
    startTime: number;
    endTime?: number;
    status: string;
    nodeCount: number;
    duration?: number;
  }> {
    return [...this.executionHistory];
  }

  // 重置统计数据
  resetStats(): void {
    this.executionStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
      nodeExecutionCounts: {},
      nodeAverageExecutionTimes: {},
      peakMemoryUsage: 0,
      currentMemoryUsage: 0
    };
    this.nodePerformanceStats.clear();
    this.executionHistory.length = 0;
  }

  // 执行单个节点
  private async executeNode(
    node: Node,
    allNodes: Node[],
    allEdges: Edge[],
    context: ExecutionContext
  ): Promise<any> {
    const startTime = Date.now();
    const nodeType = node.type || 'unknown';
    
    try {
      // 更新调试状态 - 节点开始执行
      const debugResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType,
        status: 'running',
        startTime,
        duration: 0,
        timestamp: startTime
      };

      // 更新调试状态中的节点结果
      this.updateDebugState({
        results: {
          ...this.debugState.results,
          [node.id]: debugResult
        }
      });

      // 获取节点执行器
      const executor = this.nodeExecutors.get(nodeType);
      if (!executor) {
        throw new Error(`Unknown node type: ${nodeType}`);
      }

      // 准备输入数据
      const input = this.prepareNodeInput(node, context);

      // 执行节点
      const output = await executor.execute(input, context);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 更新节点执行结果 - 创建输入数据的深拷贝以避免后续修改影响调试日志
      const completedResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType,
        status: 'completed',
        startTime,
        endTime,
        duration,
        input: JSON.parse(JSON.stringify(input)), // 深拷贝输入数据
        output,
        markdownOutput: output?.markdownOutput,
        timestamp: startTime
      };

      // 更新调试状态
      this.updateDebugState({
        results: {
          ...this.debugState.results,
          [node.id]: completedResult
        }
      });

      // 更新节点性能统计
      this.updateNodePerformanceStats(node.id, nodeType, duration, true);

      return output;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 处理特殊错误（等待用户输入）
      if (error instanceof Error && error.message === 'WAITING_FOR_USER_INPUT') {
        const waitingResult: DebugNodeResult = {
          nodeId: node.id,
          nodeType,
          status: 'waiting_input',
          startTime,
          duration,
          timestamp: startTime
        };

        this.updateDebugState({
          status: 'waiting_input',
          currentNode: node.id,
          results: {
            ...this.debugState.results,
            [node.id]: waitingResult
          }
        });

        // 等待用户输入 - 使用新的用户输入处理机制
        const userResponse = await this.requestUserInput({
          stepId: `${node.id}-${Date.now()}`,
          nodeId: node.id,
          nodeType,
          nodeName: (node.data?.label as string) || 'Unknown Node',
          inputConfig: {
            type: 'text',
            label: '用户输入',
            placeholder: '请输入内容...',
            required: true
          },
          previousData: {},
          timestamp: Date.now()
        });

        // 将用户输入合并到上下文中
        if (userResponse.value) {
          if (typeof userResponse.value === 'object') {
            context.variables = { ...context.variables, ...userResponse.value };
            // 如果对象中有 userInput 字段，也设置到 context.userInput
            if ('userInput' in userResponse.value) {
              context.userInput = String(userResponse.value.userInput);
            }
          } else {
            context.userInput = String(userResponse.value);
            context.variables = { ...context.variables, userInput: String(userResponse.value) };
          }
        }

        // 重新执行节点
        return this.executeNode(node, allNodes, allEdges, context);
      }

      // 记录执行失败
      const failedResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType,
        status: 'failed',
        startTime,
        endTime,
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: startTime
      };

      this.updateDebugState({
        results: {
          ...this.debugState.results,
          [node.id]: failedResult
        }
      });

      // 更新节点性能统计
      this.updateNodePerformanceStats(node.id, nodeType, duration, false);

      throw error;
    }
  }

  // 准备节点输入数据
  private prepareNodeInput(node: Node, context: ExecutionContext): any {
    // 合并节点配置数据和上下文数据
    const nodeData = node.data || {};
    const nodeType = node.type || 'unknown';
    
    // 使用全局常量检查节点是否配置为使用用户输入
    const inputSource = typeof nodeData.inputSource === 'string' ? nodeData.inputSource : undefined;
    const needsUserInput = requiresUserInput(inputSource);
    
    // 过滤节点数据，只保留配置相关的字段，排除可能包含历史执行信息的字段
    const filteredNodeData = this.filterNodeDataForInput(nodeData);
    
    // 构建符合 NodeExecutionInput 接口的数据结构
    const nodeInput = {
      nodeId: node.id,
      nodeType,
      label: nodeData.label || filteredNodeData.label,
      description: nodeData.description || filteredNodeData.description,
      inputSource: inputSource,
      
      // 根据节点类型构建相应的配置
      config: this.buildNodeConfig(filteredNodeData, nodeType),
      
      // 优化后的运行时数据 - 移除重复字段，统一由 context 管理
      runtimeData: {
        userMessage: needsUserInput && context.variables?.userInput ? context.variables.userInput : filteredNodeData.userMessage,
        data: filteredNodeData.data
        // 移除 variables 和 userInput，避免重复，统一在 context 中处理
      }
    };

    return nodeInput;
  }

  // 过滤节点数据，只保留配置相关的字段
  private filterNodeDataForInput(nodeData: any): any {
    if (!nodeData || typeof nodeData !== 'object') return nodeData;
    
    // 定义允许的字段白名单，包含所有节点类型的配置字段
    const allowedFields = [
      // 基础字段
      'label', 'description', 'inputSource',
      
      // AI节点配置
      'model', 'systemPrompt', 'temperature', 'maxTokens', 'stream', 'userMessage',
      
      // 数据库节点配置
      'dbType', 'connectionString', 'query', 'parameters', 'operation',
      
      // 知识库节点配置
      'knowledgeBaseId', 'searchQuery', 'topK', 'threshold', 'similarityThreshold', 'searchType',
      
      // HTTP节点配置
      'url', 'method', 'headers', 'body', 'timeout', 'retryCount',
      
      // 条件判断节点配置
      'condition', 'conditionType',
      
      // 数据处理节点配置
      'processType', 'transformScript', 'filterCondition', 'aggregateFields', 
      'sortBy', 'sortOrder', 'groupBy', 'jsonPath', 'extractMode',
      
      // 开始节点配置
      'triggerType', 'initialData',
      
      // 结束节点配置
      'outputFormat', 'returnCode', 'finalMessage', 'saveResult', 'resultFormat',
      
      // 用户输入节点配置
      'userInputType', 'placeholder', 'defaultValue', 'validation', 'options',
      
      // 响应节点配置
      'responseTemplate', 'responseFormat', 'statusCode',
      
      // 其他通用配置字段
      'required', 'disabled', 'data'
    ];
    
    const filtered: any = {};
    allowedFields.forEach(field => {
      if (field in nodeData) {
        filtered[field] = nodeData[field];
      }
    });
    
    return filtered;
  }

  // 开始调试执行（带执行计划生成）
  async startDebugExecution(nodes: Node[], edges: Edge[]): Promise<void> {
    this.abortController = new AbortController();
    
    try {
      // 生成执行计划
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const executionPlan = this.executionPlanGenerator.generateExecutionPlan(nodes, edges, workflowId);
      
      this.updateDebugState({
        status: 'running',
        currentNode: undefined,
        completedNodes: [],
        totalNodes: nodes.length,
        startTime: Date.now(),
        endTime: undefined,
        error: undefined,
        results: {},
        executionPlan
      });
      
      await this.executeWorkflowWithPlan(nodes, edges, executionPlan);
      
      this.updateDebugState({
        status: 'completed',
        endTime: Date.now(),
        currentNode: undefined
      });
    } catch (error) {
      this.updateDebugState({
        status: 'failed',
        endTime: Date.now(),
        currentNode: undefined,
        error: error instanceof Error ? error.message : '执行失败'
      });
    }
  }
  
  // 停止执行
  async stopExecution(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // 清理用户输入等待
    if (this.userInputResolver) {
      this.userInputResolver({
        stepId: '',
        value: '',
        timestamp: Date.now()
      });
      this.userInputResolver = undefined;
    }
    
    this.updateDebugState({
      status: 'stopped',
      endTime: Date.now(),
      currentNode: undefined
    });
  }
  
  // 重置状态
  resetState(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // 清理用户输入等待
    if (this.userInputResolver) {
      this.userInputResolver({
        stepId: '',
        value: '',
        timestamp: Date.now()
      });
      this.userInputResolver = undefined;
    }
    
    this.debugState = {
      status: 'idle',
      completedNodes: [],
      totalNodes: 0
    };
    
    this.notifyStateChange();
  }
  
  // 提交用户输入
  async submitUserInput(response: UserInputResponse): Promise<void> {
    if (this.debugState.status === 'waiting_input' && this.userInputResolver) {
      // 清除当前的用户输入请求状态
      this.updateDebugState({
        status: 'running',
        currentUserInputRequest: undefined
      });
      
      // 解析用户输入
      this.userInputResolver(response);
      this.userInputResolver = undefined;
    }
  }
  
  // 请求用户输入
  private async requestUserInput(request: UserInputRequest): Promise<UserInputResponse> {
    // 更新状态为等待用户输入
    this.updateDebugState({
      status: 'waiting_input',
      currentUserInputRequest: request
    });
    
    // 返回Promise，等待用户响应
    return new Promise<UserInputResponse>((resolve) => {
      this.userInputResolver = resolve;
    });
  }
  
  // 执行工作流（带执行计划）
  private async executeWorkflowWithPlan(nodes: Node[], _edges: Edge[], executionPlan: ExecutionPlan): Promise<void> {
    const startTime = Date.now();
    let success = false;
    
    try {
      this.updateDebugState({
        status: 'running',
        startTime,
        totalNodes: nodes.length,
        error: undefined
      });

      const context: ExecutionContext = {
        variables: {},
        nodeResults: {},
        executionPlan,
        currentStep: undefined,
        usingExecutionPlan: true
      };

      // 按执行计划顺序执行节点
      for (const step of executionPlan.steps) {
        // 检查是否被中断
        if (this.abortController?.signal.aborted) {
          throw new Error('执行被用户中断');
        }
        
        const node = nodes.find(n => n.id === step.nodeId);
        if (!node) {
          throw new Error(`找不到节点: ${step.nodeId}`);
        }
        
        context.currentStep = step;
        
        // 如果步骤需要用户输入，先处理用户输入
        if (step.requiresUserInput && step.userInputConfig) {
          const userInputRequest: UserInputRequest = {
            stepId: step.id,
            nodeId: step.nodeId,
            nodeType: step.nodeType,
            nodeName: step.label,
            inputConfig: step.userInputConfig,
            previousData: this.getPreviousStepData(step, context),
            timestamp: Date.now()
          };
          
          const userResponse = await this.requestUserInput(userInputRequest);
          
          // 将用户输入合并到上下文中
          if (userResponse.value) {
            if (typeof userResponse.value === 'object') {
              context.variables = { ...context.variables, ...userResponse.value };
            } else {
              context.variables = { ...context.variables, userInput: userResponse.value };
            }
          }
        }
        
        // 执行节点
        await this.executeStepNode(node, context);
        
        // 更新完成的节点列表
        const newCompletedNodes = [...this.debugState.completedNodes];
        if (!newCompletedNodes.includes(node.id)) {
          newCompletedNodes.push(node.id);
        }
        
        this.updateDebugState({
          completedNodes: newCompletedNodes
        });
      }

      // 执行完成
      success = true;
      this.updateDebugState({
        status: 'completed',
        endTime: Date.now()
      });

    } catch (error) {
      success = false;
      this.updateDebugState({
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        endTime: Date.now()
      });
    } finally {
      // 更新执行统计
      const duration = Date.now() - startTime;
      this.updateExecutionStats(success, duration, nodes.length);
    }
  }
  
  // 执行步骤节点
  private async executeStepNode(node: Node, context: ExecutionContext): Promise<void> {
    // 更新当前执行节点
    this.updateDebugState({
      currentNode: node.id
    });

    try {
      const nodeType = node.type || 'unknown';
      let result: any;

      // 开始节点和结束节点不需要执行executeNode，进行特殊处理
      if (nodeType === 'startNode') {
        // 开始节点：设置初始数据到上下文中
        const startTime = Date.now();
        
        const debugResult: DebugNodeResult = {
          nodeId: node.id,
          nodeType,
          status: 'running',
          startTime,
          duration: 0,
          timestamp: startTime
        };

        this.updateDebugState({
          results: {
            ...this.debugState.results,
            [node.id]: debugResult
          }
        });

        // 设置初始数据
        if (node.data?.initialData) {
          context.variables = { ...context.variables, ...node.data.initialData };
        }
        
        // 如果有用户输入，将其添加到上下文中
        if (context.userInput) {
          context.variables = { 
            ...context.variables, 
            userInput: context.userInput 
          };
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        result = {
          message: '工作流已开始',
          initialData: node.data?.initialData || {},
          userInput: context.userInput,
          timestamp: endTime
        };

        // 更新执行结果
        const completedResult: DebugNodeResult = {
          nodeId: node.id,
          nodeType,
          status: 'completed',
          startTime,
          endTime,
          duration,
          input: { nodeType, label: node.data?.label },
          output: result,
          markdownOutput: `### 工作流开始\n\n- **触发类型**: ${node.data?.triggerType || 'manual'}\n- **开始时间**: ${new Date().toLocaleString()}\n- **初始数据**: ${JSON.stringify(node.data?.initialData || {}, null, 2)}\n- **用户输入**: ${context.userInput || '无'}`,
          timestamp: startTime
        };

        this.updateDebugState({
          results: {
            ...this.debugState.results,
            [node.id]: completedResult
          }
        });

      } else if (nodeType === 'endNode') {
        // 结束节点：展示上一节点的结果
        const startTime = Date.now();
        
        const debugResult: DebugNodeResult = {
          nodeId: node.id,
          nodeType,
          status: 'running',
          startTime,
          duration: 0,
          timestamp: startTime
        };

        this.updateDebugState({
          results: {
            ...this.debugState.results,
            [node.id]: debugResult
          }
        });

        // 获取上一个节点的结果
        const previousResults = Object.values(context.nodeResults);
        const lastResult = previousResults[previousResults.length - 1];
        
        const endTime = Date.now();
        const duration = endTime - startTime;

        // 构建结束节点的输出，展示上一节点的结果
        result = {
          message: '工作流已完成',
          previousResult: lastResult,
          finalOutput: lastResult?.output || lastResult?.result || lastResult,
          outputFormat: node.data?.outputFormat || 'json',
          returnCode: node.data?.returnCode || 0,
          timestamp: endTime
        };

        // 生成Markdown输出
        let markdownOutput = '### 工作流完成\n\n';
        markdownOutput += `- **完成时间**: ${new Date().toLocaleString()}\n`;
        markdownOutput += `- **返回码**: ${node.data?.returnCode || 0}\n`;
        markdownOutput += `- **输出格式**: ${node.data?.outputFormat || 'json'}\n\n`;
        
        if (lastResult) {
          markdownOutput += '#### 最终结果\n\n';
          if (lastResult.markdownOutput) {
            markdownOutput += lastResult.markdownOutput;
          } else if (lastResult.output) {
            markdownOutput += '```json\n' + JSON.stringify(lastResult.output, null, 2) + '\n```';
          } else if (lastResult.result) {
            markdownOutput += '```json\n' + JSON.stringify(lastResult.result, null, 2) + '\n```';
          } else {
            markdownOutput += '```json\n' + JSON.stringify(lastResult, null, 2) + '\n```';
          }
        } else {
          markdownOutput += '#### 最终结果\n\n无前置节点结果';
        }

        if (node.data?.finalMessage) {
          markdownOutput += `\n\n#### 结束消息\n\n${node.data.finalMessage}`;
        }

        // 更新执行结果
        const completedResult: DebugNodeResult = {
          nodeId: node.id,
          nodeType,
          status: 'completed',
          startTime,
          endTime,
          duration,
          input: { nodeType, label: node.data?.label, previousResult: lastResult },
          output: result,
          markdownOutput,
          timestamp: startTime
        };

        this.updateDebugState({
          results: {
            ...this.debugState.results,
            [node.id]: completedResult
          }
        });

      } else {
        // 其他节点正常执行
        result = await this.executeNode(node, [], [], context);
      }
      
      // 记录节点执行结果到上下文
      context.nodeResults[node.id] = result;
      
    } catch (error) {
      throw error;
    }
  }
  
  // 获取前置步骤数据
  private getPreviousStepData(currentStep: ExecutionStep, context: ExecutionContext): Record<string, any> {
    const previousData: Record<string, any> = {};
    
    // 收集依赖节点的输出数据
    if (currentStep.dependencies && currentStep.dependencies.length > 0) {
      currentStep.dependencies.forEach(depNodeId => {
        if (context.nodeResults[depNodeId]) {
          previousData[depNodeId] = context.nodeResults[depNodeId];
        }
      });
    }
    
    // 添加全局变量
    if (context.variables) {
      previousData._variables = context.variables;
    }
    
    return previousData;
  }
  
  // 更新执行统计
  private updateExecutionStats(success: boolean, duration: number, nodeCount: number): void {
    this.executionStats.totalExecutions++;
    this.executionStats.totalExecutionTime += duration;
    this.executionStats.averageExecutionTime = this.executionStats.totalExecutionTime / this.executionStats.totalExecutions;
    this.executionStats.lastExecutionTime = Date.now();

    if (success) {
      this.executionStats.successfulExecutions++;
    } else {
      this.executionStats.failedExecutions++;
    }

    // 更新内存使用情况（模拟）
    this.executionStats.currentMemoryUsage = Math.random() * 100;
    if (this.executionStats.currentMemoryUsage > this.executionStats.peakMemoryUsage) {
      this.executionStats.peakMemoryUsage = this.executionStats.currentMemoryUsage;
    }

    // 添加到执行历史
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.executionHistory.unshift({
      id: executionId,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      status: success ? 'completed' : 'failed',
      nodeCount,
      duration
    });

    // 保持历史记录不超过50条
    if (this.executionHistory.length > 50) {
      this.executionHistory = this.executionHistory.slice(0, 50);
    }
  }

  // 构建节点特定配置
  private buildNodeConfig(input: any, nodeType: string): any {
    const config: any = {};
    
    // 根据节点类型提取相应的配置字段
    switch (nodeType) {
      case 'aiDialogNode':
      case 'aiSummaryNode':
      case 'aiExtractNode':
      case 'aiJsonNode':
        // AI对话节点配置
        if (input.model) config.model = input.model;
        if (input.systemPrompt) config.systemPrompt = input.systemPrompt;
        if (input.temperature !== undefined) config.temperature = input.temperature;
        if (input.maxTokens !== undefined) config.maxTokens = input.maxTokens;
        if (input.stream !== undefined) config.stream = input.stream;
        break;
        
      case 'databaseNode':
        // 数据库节点配置
        if (input.dbType) config.dbType = input.dbType;
        if (input.connectionString) config.connectionString = input.connectionString;
        if (input.query) config.query = input.query;
        if (input.parameters) config.parameters = input.parameters;
        break;
        
      case 'knowledgeBaseNode':
      case 'bingNode':
        // 知识库节点配置
        if (input.knowledgeBaseId) config.knowledgeBaseId = input.knowledgeBaseId;
        if (input.searchQuery) config.searchQuery = input.searchQuery;
        if (input.topK !== undefined) config.topK = input.topK;
        if (input.similarityThreshold !== undefined) config.similarityThreshold = input.similarityThreshold;
        if (input.searchType) config.searchType = input.searchType;
        break;
        
      case 'httpNode':
        // HTTP节点配置
        if (input.url) config.url = input.url;
        if (input.method) config.method = input.method;
        if (input.headers) config.headers = input.headers;
        if (input.body) config.body = input.body;
        break;
        
      case 'conditionNode':
      case 'decisionNode':
        // 条件判断节点配置
        if (input.condition) config.condition = input.condition;
        if (input.conditionType) config.conditionType = input.conditionType;
        break;
        
      case 'dataProcessNode':
      case 'jsonExtractor':
      case 'basicNode':
      case 'processNode':
        // 数据处理节点配置
        if (input.processType) config.processType = input.processType;
        if (input.transformScript) config.transformScript = input.transformScript;
        if (input.filterCondition) config.filterCondition = input.filterCondition;
        if (input.aggregateFields) config.aggregateFields = input.aggregateFields;
        if (input.sortBy) config.sortBy = input.sortBy;
        if (input.sortOrder) config.sortOrder = input.sortOrder;
        if (input.groupBy) config.groupBy = input.groupBy;
        break;
        
      case 'startNode':
        // 开始节点配置
        if (input.triggerType) config.triggerType = input.triggerType;
        if (input.initialData) config.initialData = input.initialData;
        break;
        
      case 'endNode':
        // 结束节点配置
        if (input.outputFormat) config.outputFormat = input.outputFormat;
        if (input.returnCode !== undefined) config.returnCode = input.returnCode;
        if (input.finalMessage) config.finalMessage = input.finalMessage;
        break;
        
      case 'userInputNode':
        // 用户输入节点配置
        if (input.userInputType) config.userInputType = input.userInputType;
        if (input.placeholder) config.placeholder = input.placeholder;
        if (input.defaultValue !== undefined) config.defaultValue = input.defaultValue;
        if (input.validation) config.validation = input.validation;
        if (input.options) config.options = input.options;
        break;
        
      case 'responseNode':
        // 响应节点配置
        if (input.responseTemplate) config.responseTemplate = input.responseTemplate;
        if (input.responseFormat) config.responseFormat = input.responseFormat;
        if (input.statusCode !== undefined) config.statusCode = input.statusCode;
        break;
    }
    
    return config;
  }

  // 更新节点性能统计
  private updateNodePerformanceStats(nodeId: string, nodeType: string, duration: number, success: boolean): void {
    let stats = this.nodePerformanceStats.get(nodeId);
    
    if (!stats) {
      stats = {
        nodeId,
        nodeType,
        executionCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        minExecutionTime: Infinity,
        maxExecutionTime: 0,
        successCount: 0,
        failureCount: 0
      };
      this.nodePerformanceStats.set(nodeId, stats);
    }

    stats.executionCount++;
    stats.totalExecutionTime += duration;
    stats.averageExecutionTime = stats.totalExecutionTime / stats.executionCount;
    stats.minExecutionTime = Math.min(stats.minExecutionTime, duration);
    stats.maxExecutionTime = Math.max(stats.maxExecutionTime, duration);
    stats.lastExecutionTime = Date.now();

    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }

    // 更新全局节点统计
    this.executionStats.nodeExecutionCounts[nodeType] = (this.executionStats.nodeExecutionCounts[nodeType] || 0) + 1;
    
    const totalTime = this.executionStats.nodeAverageExecutionTimes[nodeType] || 0;
    const count = this.executionStats.nodeExecutionCounts[nodeType];
    this.executionStats.nodeAverageExecutionTimes[nodeType] = (totalTime * (count - 1) + duration) / count;
  }
}

// 导出单例实例
export const workflowExecutor = new WorkflowExecutor();

// 导出类作为默认导出，供需要创建新实例的地方使用
export default WorkflowExecutor;