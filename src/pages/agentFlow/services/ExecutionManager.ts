import { Node, Edge } from '@xyflow/react';
import { 
  ExecutionContext, 
  DebugExecutionState, 
  DebugNodeResult,
  DebugNodeInput,
  ExecutionStats,
  NodePerformanceStats,
  UserInputRequest,
  UserInputResponse,
  ExecutionPlan,
  ExecutionStep
} from './types';
import { NodeExecutorFactory } from './executors/NodeExecutorFactory';
import { ExecutionStateManager } from './state/ExecutionStateManager';
import { ExecutionStatsCollector } from './stats/ExecutionStatsCollector';
import { UserInputHandler } from './input/UserInputHandler';
import ExecutionPlanGenerator from './executionPlanGenerator';
import { requiresUserInput } from '../constants/inputSource';

/**
 * 主要的执行管理器
 * 整合所有拆分的组件，提供统一的工作流执行接口
 */
export class ExecutionManager {
  private nodeExecutorFactory: NodeExecutorFactory;
  private stateManager: ExecutionStateManager;
  private statsCollector: ExecutionStatsCollector;
  private userInputHandler: UserInputHandler;
  private executionPlanGenerator: ExecutionPlanGenerator;
  private abortController?: AbortController;

  constructor() {
    this.nodeExecutorFactory = new NodeExecutorFactory();
    this.stateManager = new ExecutionStateManager();
    this.statsCollector = new ExecutionStatsCollector();
    this.userInputHandler = new UserInputHandler();
    this.executionPlanGenerator = new ExecutionPlanGenerator();
  }

  // ===== 状态管理相关方法 =====

  /**
   * 获取当前调试状态
   */
  getDebugState(): DebugExecutionState {
    return this.stateManager.getDebugState();
  }

  /**
   * 监听执行状态变化
   */
  onExecutionStateChange(callback: (state: DebugExecutionState) => void): void {
    this.stateManager.onExecutionStateChange(callback);
  }

  /**
   * 移除执行状态监听器
   */
  removeExecutionStateChangeListener(callback: (state: DebugExecutionState) => void): void {
    this.stateManager.removeExecutionStateChangeListener(callback);
  }

  // ===== 统计数据相关方法 =====

  /**
   * 获取执行统计信息
   */
  getExecutionStats(): ExecutionStats {
    return this.statsCollector.getExecutionStats();
  }

  /**
   * 获取节点性能统计
   */
  getNodePerformanceStats(): NodePerformanceStats[] {
    return this.statsCollector.getNodePerformanceStats();
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(): Array<{
    id: string;
    startTime: number;
    endTime?: number;
    status: string;
    nodeCount: number;
    duration?: number;
  }> {
    return this.statsCollector.getExecutionHistory();
  }

  /**
   * 重置统计数据
   */
  resetStats(): void {
    this.statsCollector.resetStats();
  }

  // ===== 用户输入相关方法 =====

  /**
   * 提交用户输入
   */
  async submitUserInput(response: UserInputResponse): Promise<void> {
    if (this.stateManager.getDebugState().status === 'waiting_input') {
      this.stateManager.updateDebugState({
        status: 'running',
        currentUserInputRequest: undefined
      });
      this.userInputHandler.submitUserInput(response);
    }
  }

  // ===== 执行控制相关方法 =====

  /**
   * 开始调试执行（带执行计划生成）
   */
  async startDebugExecution(nodes: Node[], edges: Edge[]): Promise<void> {
    this.abortController = new AbortController();
    
    try {
      // 生成执行计划
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const executionPlan = this.executionPlanGenerator.generateExecutionPlan(nodes, edges, workflowId);
      
      this.stateManager.updateDebugState({
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
      
      this.stateManager.setCompletedState();
    } catch (error) {
      this.stateManager.setFailedState(
        error instanceof Error ? error.message : '执行失败'
      );
    }
  }

  /**
   * 停止执行
   */
  async stopExecution(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.userInputHandler.cancelUserInput();
    this.stateManager.setStoppedState();
  }

  /**
   * 重置状态
   */
  resetState(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.userInputHandler.cancelUserInput();
    this.stateManager.resetState();
  }

  // ===== 内部执行逻辑 =====

  /**
   * 执行工作流（带执行计划）
   */
  private async executeWorkflowWithPlan(nodes: Node[], _edges: Edge[], executionPlan: ExecutionPlan): Promise<void> {
    const startTime = Date.now();
    let success = false;
    
    try {
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
          
          this.stateManager.setWaitingInputState(userInputRequest);
          const userResponse = await this.userInputHandler.requestUserInput(userInputRequest);
          
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
        this.stateManager.addCompletedNode(node.id);
      }

      success = true;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      // 更新执行统计
      const duration = Date.now() - startTime;
      this.statsCollector.updateExecutionStats(success, duration, nodes.length);
    }
  }

  /**
   * 执行步骤节点
   */
  private async executeStepNode(node: Node, context: ExecutionContext): Promise<void> {
    this.stateManager.setCurrentNode(node.id);

    try {
      const nodeType = node.type || 'unknown';
      const startTime = Date.now();

      // 创建运行中的调试结果
      const runningResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType,
        status: 'running',
        startTime,
        duration: 0,
        timestamp: startTime
      };

      this.stateManager.updateNodeResult(node.id, runningResult);

      // 获取节点执行器并执行
      const executor = this.nodeExecutorFactory.getExecutorForNode(node);
      const input = this.prepareNodeInput(node, context);
      const result = await executor.execute(input, context);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // 创建完成的调试结果
      const completedResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType,
        status: 'completed',
        startTime,
        endTime,
        duration,
        input: this.buildDebugNodeInput(node, context),
        output: result,
        markdownOutput: result?.markdownOutput,
        timestamp: startTime
      };

      this.stateManager.updateNodeResult(node.id, completedResult);
      this.statsCollector.updateNodePerformanceStats(node.id, nodeType, duration, true);

      // 记录节点执行结果到上下文
      context.nodeResults[node.id] = result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - (Date.now() - 1000); // 估算开始时间

      // 处理特殊错误（等待用户输入）
      if (error instanceof Error && error.message === 'WAITING_FOR_USER_INPUT') {
        const waitingResult: DebugNodeResult = {
          nodeId: node.id,
          nodeType: node.type || 'unknown',
          status: 'waiting_input',
          startTime: endTime - duration,
          duration,
          timestamp: endTime - duration
        };

        this.stateManager.updateNodeResult(node.id, waitingResult);
        
        // 重新执行节点
        return this.executeStepNode(node, context);
      }

      // 记录执行失败
      const failedResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType: node.type || 'unknown',
        status: 'failed',
        startTime: endTime - duration,
        endTime,
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: endTime - duration
      };

      this.stateManager.updateNodeResult(node.id, failedResult);
      this.statsCollector.updateNodePerformanceStats(node.id, node.type || 'unknown', duration, false);

      throw error;
    }
  }

  /**
   * 准备节点输入数据
   */
  private prepareNodeInput(node: Node, context: ExecutionContext): any {
    const nodeData = node.data || {};
    const nodeType = node.type || 'unknown';
    
    const inputSource = typeof nodeData.inputSource === 'string' ? nodeData.inputSource : undefined;
    const needsUserInput = requiresUserInput(inputSource);
    
    const filteredNodeData = this.filterNodeDataForInput(nodeData);
    
    return {
      nodeId: node.id,
      nodeType,
      label: nodeData.label || filteredNodeData.label,
      description: nodeData.description || filteredNodeData.description,
      inputSource: inputSource,
      config: filteredNodeData,
      runtimeData: {
        userMessage: needsUserInput && context.variables?.userInput ? context.variables.userInput : filteredNodeData.userMessage,
        data: filteredNodeData.data
      }
    };
  }

  /**
   * 构建优化的调试输入数据
   */
  private buildDebugNodeInput(node: Node, context: ExecutionContext): DebugNodeInput {
    const nodeData = node.data || {};
    const nodeType = node.type || 'unknown';
    const inputSource = typeof nodeData.inputSource === 'string' ? nodeData.inputSource : undefined;
    
    const filteredNodeData = this.filterNodeDataForInput(nodeData);
    
    const previousNodeResults: Record<string, any> = {};
    if (context.nodeResults && Object.keys(context.nodeResults).length > 0) {
      Object.entries(context.nodeResults).forEach(([nodeId, result]) => {
        if (result && typeof result === 'object') {
          previousNodeResults[nodeId] = {
            output: result.output,
            result: result.result,
            markdownOutput: result.markdownOutput
          };
        }
      });
    }
    
    const systemVariables: Record<string, any> = {};
    if (context.variables) {
      const { userInput, ...otherVars } = context.variables;
      if (Object.keys(otherVars).length > 0) {
        Object.assign(systemVariables, otherVars);
      }
    }
    
    return {
      nodeInfo: {
        nodeId: node.id,
        nodeType,
        label: typeof nodeData.label === 'string' ? nodeData.label : undefined,
        description: typeof nodeData.description === 'string' ? nodeData.description : undefined,
        inputSource
      },
      nodeConfig: filteredNodeData,
      contextData: {
        ...(context.userInput ? { userInput: context.userInput } : {}),
        ...(Object.keys(previousNodeResults).length > 0 ? { previousNodeResults } : {}),
        ...(Object.keys(systemVariables).length > 0 ? { systemVariables } : {})
      },
      executionMeta: {
        executionId: context.executionPlan?.id,
        stepId: context.currentStep?.id,
        workflowId: context.executionPlan?.workflowId,
        timestamp: Date.now()
      }
    };
  }

  /**
   * 过滤节点数据，只保留配置相关的字段
   */
  private filterNodeDataForInput(nodeData: any): any {
    if (!nodeData || typeof nodeData !== 'object') return nodeData;
    
    const allowedFields = [
      // 基础字段
      'label', 'description', 'inputSource',
      
      // AI节点通用字段
      'model', 'systemPrompt', 'temperature', 'maxTokens', 'stream', 'userMessage',
      
      // AI摘要节点专属字段
      'summaryStyle', 'summaryLength', 'maxSummaryLength', 'language', 
      'includeKeyPoints', 'extractKeywords',
      
      // AI提取节点专属字段
      'extractType', 'extractPrompt',
      
      // 数据库节点字段
      'dbType', 'connectionString', 'query', 'parameters', 'operation',
      
      // 知识库节点字段
      'knowledgeBaseId', 'searchQuery', 'topK', 'threshold', 'similarityThreshold', 'searchType',
      
      // HTTP节点字段
      'url', 'method', 'headers', 'body', 'timeout', 'retryCount',
      
      // 条件判断节点字段
      'condition', 'conditionType', 'trueBranch', 'falseBranch',
      
      // 数据处理节点字段
      'processType', 'transformScript', 'filterCondition', 'aggregateFields', 
      'sortBy', 'sortOrder', 'groupBy', 'jsonPath', 'extractMode',
      
      // 开始节点字段
      'triggerType', 'initialData',
      
      // 结束节点字段
      'outputFormat', 'returnCode', 'finalMessage', 'saveResult', 'resultFormat',
      
      // 用户输入节点字段
      'userInputType', 'placeholder', 'defaultValue', 'validation', 'options',
      
      // 响应节点字段
      'responseTemplate', 'responseFormat', 'statusCode',
      
      // 通用字段
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

  /**
   * 获取前置步骤数据
   */
  private getPreviousStepData(currentStep: ExecutionStep, context: ExecutionContext): Record<string, any> {
    const previousData: Record<string, any> = {};
    
    if (currentStep.dependencies && currentStep.dependencies.length > 0) {
      currentStep.dependencies.forEach(depNodeId => {
        if (context.nodeResults[depNodeId]) {
          previousData[depNodeId] = context.nodeResults[depNodeId];
        }
      });
    }
    
    if (context.userInput) {
      previousData.userInput = context.userInput;
    }
    
    if (context.variables) {
      const { userInput, ...otherVariables } = context.variables;
      if (Object.keys(otherVariables).length > 0) {
        previousData._variables = otherVariables;
      }
    }
    
    return previousData;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.resetState();
    this.stateManager.dispose();
    this.userInputHandler.dispose();
  }
}

export default ExecutionManager;
