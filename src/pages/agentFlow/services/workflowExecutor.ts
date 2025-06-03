import { Node, Edge } from '@xyflow/react';

// 执行上下文接口
export interface ExecutionContext {
  variables: Record<string, any>;
  nodeResults: Record<string, any>;
  userInput?: string;
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
}

// 节点执行器基类
abstract class NodeExecutor {
  abstract execute(input: any, context: ExecutionContext): Promise<any>;
  
  protected logExecution(nodeId: string, input: any, context: ExecutionContext): void {
    // 避免未使用参数的警告，同时保持接口一致性
    console.log(`Executing node ${nodeId}`, { input, context });
  }
}

// AI对话节点执行器
class AIConversationExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('ai-conversation', input, context);
    
    // 模拟AI对话处理
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const messages = input?.messages || [{ role: 'user', content: '你好' }];
    const lastMessage = messages[messages.length - 1];
    
    return {
      response: `AI回复: 收到您的消息 "${lastMessage.content}"，这是我的回复。`,
      markdownOutput: `**AI助手回复:**\n\n收到您的消息："${lastMessage.content}"\n\n这是一个模拟的AI回复，包含了对您输入的处理结果。`
    };
  }
}

// 用户输入节点执行器
class UserInputExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('user-input', input, context);
    
    // 用户输入节点需要等待用户输入
    if (!context.userInput) {
      throw new Error('WAITING_FOR_USER_INPUT');
    }
    
    return {
      userInput: context.userInput,
      markdownOutput: `**用户输入:**\n\n${context.userInput}`
    };
  }
}

// 条件判断节点执行器
class ConditionExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('condition', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const condition = input?.condition || 'true';
    const result = this.evaluateCondition(condition, context);
    
    return {
      result,
      condition,
      markdownOutput: `**条件判断:**\n\n条件: \`${condition}\`\n结果: ${result ? '✅ 通过' : '❌ 未通过'}`
    };
  }
  
  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    // 简单的条件评估逻辑
    try {
      // 这里可以实现更复杂的条件评估逻辑
      if (condition === 'true') return true;
      if (condition === 'false') return false;
      
      // 可以基于context中的变量进行判断
      const variables = context.variables || {};
      const nodeResults = context.nodeResults || {};
      
      // 简单示例：检查是否有用户输入
      if (condition === 'has_user_input') {
        return !!context.userInput;
      }
      
      return Math.random() > 0.5; // 随机结果作为示例
    } catch (error) {
      console.error('条件评估错误:', error);
      return false;
    }
  }
}

// 数据处理节点执行器
class DataProcessExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('data-process', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const processType = input?.processType || 'transform';
    const data = input?.data || context.nodeResults;
    
    const result = this.processData(data, processType);
    
    return {
      processedData: result,
      processType,
      markdownOutput: `**数据处理:**\n\n处理类型: ${processType}\n\n处理结果:\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
    };
  }
  
  private processData(data: any, processType: string): any {
    switch (processType) {
      case 'transform':
        return { ...data, transformed: true, timestamp: Date.now() };
      case 'filter':
        return Object.keys(data).reduce((acc, key) => {
          if (typeof data[key] !== 'undefined') {
            acc[key] = data[key];
          }
          return acc;
        }, {} as any);
      case 'aggregate':
        return {
          count: Object.keys(data).length,
          summary: `处理了${Object.keys(data).length}个数据项`
        };
      default:
        return data;
    }
  }
}

// 开始节点执行器
class StartNodeExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('start-node', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      timestamp: Date.now(),
      triggerType: input?.triggerType || 'manual',
      markdownOutput: `**工作流开始**\n\n触发类型: ${input?.triggerType || 'manual'}\n开始时间: ${new Date().toLocaleString()}`
    };
  }
}

// 结束节点执行器
class EndNodeExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('end-node', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const completedNodes = Object.keys(context.nodeResults || {}).length;
    
    return {
      timestamp: Date.now(),
      outputFormat: input?.outputFormat || 'json',
      returnCode: input?.returnCode || 0,
      summary: `工作流执行完成，共处理了 ${completedNodes} 个节点`,
      markdownOutput: `**工作流结束**\n\n执行状态: ✅ 成功完成\n结束时间: ${new Date().toLocaleString()}\n处理节点数: ${completedNodes}\n返回码: ${input?.returnCode || 0}`
    };
  }
}

// AI对话节点执行器
class AIDialogNodeExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('ai-dialog-node', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    const model = input?.model || 'gpt-3.5-turbo';
    const systemPrompt = input?.systemPrompt || '你是一个有用的AI助手';
    const userMessage = input?.userMessage || '你好';
    
    const response = this.generateAIResponse(systemPrompt, userMessage, model);
    
    return {
      model,
      systemPrompt,
      userMessage,
      response,
      temperature: input?.temperature || 0.7,
      maxTokens: input?.maxTokens || 1000,
      markdownOutput: `**AI对话节点**\n\n**模型:** ${model}\n\n**系统提示词:**\n${systemPrompt}\n\n**用户消息:**\n${userMessage}\n\n**AI回复:**\n${response}`
    };
  }
  
  private generateAIResponse(systemPrompt: string, userMessage: string, model: string): string {
    // 模拟AI回复生成
    const responses = [
      `基于您的问题"${userMessage}"，我理解您需要相关信息。让我为您详细解答...`,
      `根据系统设定"${systemPrompt.slice(0, 20)}..."，我会认真回答您的问题"${userMessage}"。`,
      `使用${model}模型处理您的请求："${userMessage}"。这是一个模拟的智能回复。`,
      `您好！我已经收到您的消息："${userMessage}"。作为AI助手，我很乐意为您提供帮助。`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// 数据库节点执行器
class DatabaseNodeExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('database-node', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    const dbType = input?.dbType || 'mysql';
    const query = input?.query || 'SELECT * FROM users LIMIT 10';
    const timeout = input?.timeout || 30;
    
    // 模拟数据库查询结果
    const mockResults = this.generateMockDatabaseResults(query);
    
    return {
      dbType,
      query,
      timeout,
      results: mockResults,
      rowCount: mockResults.length,
      executionTime: Math.floor(Math.random() * 500) + 100,
      markdownOutput: `**数据库查询**\n\n**数据库类型:** ${dbType}\n\n**查询语句:**\n\`\`\`sql\n${query}\n\`\`\`\n\n**查询结果:**\n- 返回行数: ${mockResults.length}\n- 执行时间: ${Math.floor(Math.random() * 500) + 100}ms\n\n**示例数据:**\n\`\`\`json\n${JSON.stringify(mockResults.slice(0, 3), null, 2)}\n\`\`\``
    };
  }
  
  private generateMockDatabaseResults(query: string): any[] {
    // 根据查询生成模拟数据
    if (query.toLowerCase().includes('user')) {
      return [
        { id: 1, name: 'Alice', email: 'alice@example.com', created_at: '2023-01-01' },
        { id: 2, name: 'Bob', email: 'bob@example.com', created_at: '2023-01-02' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com', created_at: '2023-01-03' }
      ];
    } else if (query.toLowerCase().includes('order')) {
      return [
        { order_id: 1001, user_id: 1, amount: 99.99, status: 'completed' },
        { order_id: 1002, user_id: 2, amount: 149.99, status: 'pending' }
      ];
    } else {
      return [
        { id: 1, data: 'Sample data 1' },
        { id: 2, data: 'Sample data 2' }
      ];
    }
  }
}

// 知识库节点执行器
class KnowledgeBaseNodeExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('knowledge-base-node', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
    
    const knowledgeBaseId = input?.knowledgeBaseId || 'default-kb';
    const searchQuery = input?.searchQuery || '默认查询';
    const topK = input?.topK || 5;
    const similarityThreshold = input?.similarityThreshold || 0.7;
    
    const searchResults = this.generateMockKnowledgeResults(searchQuery, topK);
    
    return {
      knowledgeBaseId,
      searchQuery,
      topK,
      similarityThreshold,
      results: searchResults,
      totalResults: searchResults.length,
      markdownOutput: `**知识库检索**\n\n**知识库ID:** ${knowledgeBaseId}\n**搜索查询:** ${searchQuery}\n**返回条数:** ${topK}\n**相似度阈值:** ${similarityThreshold}\n\n**检索结果:**\n${searchResults.map((result, index) => `\n**${index + 1}. ${result.title}** (相似度: ${result.similarity})\n${result.content}\n`).join('')}`
    };
  }
  
  private generateMockKnowledgeResults(query: string, topK: number): any[] {
    const mockDocs = [
      { title: '用户指南', content: '这是关于如何使用系统的详细指南...', similarity: 0.95 },
      { title: 'API文档', content: '系统API的使用说明和示例...', similarity: 0.88 },
      { title: '常见问题', content: '用户经常遇到的问题和解决方案...', similarity: 0.82 },
      { title: '最佳实践', content: '使用系统的最佳实践建议...', similarity: 0.76 },
      { title: '故障排除', content: '常见故障的诊断和解决方法...', similarity: 0.71 }
    ];
    
    return mockDocs
      .filter(doc => doc.title.includes(query) || doc.content.includes(query) || Math.random() > 0.3)
      .slice(0, topK)
      .map(doc => ({
        ...doc,
        content: `${doc.content} (匹配查询: "${query}")`
      }));
  }
}

// 响应节点执行器
class ResponseNodeExecutor extends NodeExecutor {
  async execute(input: any, context: ExecutionContext): Promise<any> {
    this.logExecution('response-node', input, context);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const responseTemplate = input?.responseTemplate || '{{result}}';
    const responseFormat = input?.responseFormat || 'text';
    const statusCode = input?.statusCode || 200;
    
    // 处理模板变量
    const processedResponse = this.processTemplate(responseTemplate, context);
    
    return {
      responseTemplate,
      responseFormat,
      statusCode,
      processedResponse,
      timestamp: Date.now(),
      markdownOutput: `**响应输出**\n\n**响应格式:** ${responseFormat}\n**状态码:** ${statusCode}\n\n**响应内容:**\n\`\`\`\n${processedResponse}\n\`\`\`\n\n**处理时间:** ${new Date().toLocaleString()}`
    };
  }
  
  private processTemplate(template: string, context: ExecutionContext): string {
    let processed = template;
    
    // 替换常见变量
    processed = processed.replace(/{{result}}/g, JSON.stringify(context.nodeResults, null, 2));
    processed = processed.replace(/{{timestamp}}/g, new Date().toISOString());
    
    // 替换节点结果变量
    Object.keys(context.nodeResults || {}).forEach(nodeId => {
      const nodeResult = context.nodeResults![nodeId];
      processed = processed.replace(new RegExp(`{{${nodeId}}}`, 'g'), JSON.stringify(nodeResult));
    });
    
    return processed;
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
  private userInputResolvers: ((input: string) => void)[] = [];
  private abortController?: AbortController;
  
  constructor() {
    // 注册节点执行器 - 映射节点类型到对应的执行器
    this.nodeExecutors.set('startNode', new StartNodeExecutor());
    this.nodeExecutors.set('endNode', new EndNodeExecutor());
    this.nodeExecutors.set('aiDialogNode', new AIDialogNodeExecutor());
    this.nodeExecutors.set('aiSummaryNode', new AIDialogNodeExecutor()); // 复用AI对话执行器
    this.nodeExecutors.set('aiExtractNode', new AIDialogNodeExecutor()); // 复用AI对话执行器
    this.nodeExecutors.set('aiJsonNode', new AIDialogNodeExecutor()); // 复用AI对话执行器
    this.nodeExecutors.set('databaseNode', new DatabaseNodeExecutor());
    this.nodeExecutors.set('knowledgeBaseNode', new KnowledgeBaseNodeExecutor());
    this.nodeExecutors.set('bingNode', new KnowledgeBaseNodeExecutor()); // 复用知识库执行器，模拟搜索
    this.nodeExecutors.set('responseNode', new ResponseNodeExecutor());
    this.nodeExecutors.set('conditionNode', new ConditionExecutor());
    this.nodeExecutors.set('decisionNode', new ConditionExecutor()); // 复用条件执行器
    this.nodeExecutors.set('jsonExtractor', new DataProcessExecutor()); // 复用数据处理执行器
    this.nodeExecutors.set('basicNode', new DataProcessExecutor()); // 复用数据处理执行器
    this.nodeExecutors.set('processNode', new DataProcessExecutor());
    this.nodeExecutors.set('customNode', new DataProcessExecutor()); // 复用数据处理执行器
    
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
    console.log('WorkflowExecutor: Notifying state change:', state);
    this.listeners.forEach(listener => listener(state));
  }
  
  // 更新调试状态
  private updateDebugState(updates: Partial<DebugExecutionState>): void {
    this.debugState = { ...this.debugState, ...updates };
    this.notifyStateChange();
  }
  
  // 开始调试执行
  async startDebugExecution(nodes: Node[], edges: Edge[]): Promise<void> {
    console.log('WorkflowExecutor: Starting debug execution', { nodes, edges });
    
    this.abortController = new AbortController();
    
    this.updateDebugState({
      status: 'running',
      currentNode: undefined,
      completedNodes: [],
      totalNodes: nodes.length,
      startTime: Date.now(),
      endTime: undefined,
      error: undefined,
      results: {}
    });
    
    try {
      await this.executeWorkflow(nodes, edges);
      
      this.updateDebugState({
        status: 'completed',
        endTime: Date.now(),
        currentNode: undefined
      });
    } catch (error) {
      console.error('WorkflowExecutor: Execution failed:', error);
      
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
    console.log('WorkflowExecutor: Stopping execution');
    
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // 清理用户输入等待
    this.userInputResolvers.forEach(resolver => resolver(''));
    this.userInputResolvers.length = 0;
    
    this.updateDebugState({
      status: 'stopped',
      endTime: Date.now(),
      currentNode: undefined
    });
  }
  
  // 重置状态
  resetState(): void {
    console.log('WorkflowExecutor: Resetting state');
    
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.userInputResolvers.forEach(resolver => resolver(''));
    this.userInputResolvers.length = 0;
    
    this.debugState = {
      status: 'idle',
      completedNodes: [],
      totalNodes: 0
    };
    
    this.notifyStateChange();
  }
  
  // 提交用户输入
  async submitUserInput(nodeId: string, input: string): Promise<void> {
    console.log('WorkflowExecutor: Submitting user input:', { nodeId, input });
    
    if (this.debugState.currentNode === nodeId && this.debugState.status === 'waiting_input') {
      this.userInputResolvers.forEach(resolver => resolver(input));
      this.userInputResolvers.length = 0;
    }
  }
  
  // 执行工作流
  private async executeWorkflow(nodes: Node[], edges: Edge[]): Promise<void> {
    const context: ExecutionContext = {
      variables: {},
      nodeResults: {}
    };
    
    // 找到起始节点（没有入边的节点）
    const startNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    if (startNodes.length === 0) {
      throw new Error('没有找到起始节点');
    }
    
    // 从起始节点开始执行
    for (const startNode of startNodes) {
      await this.executeNode(startNode, nodes, edges, context);
    }
  }
  
  // 执行单个节点
  private async executeNode(
    node: Node, 
    allNodes: Node[], 
    allEdges: Edge[], 
    context: ExecutionContext
  ): Promise<any> {
    if (this.abortController?.signal.aborted) {
      throw new Error('执行已被中止');
    }
    
    console.log('WorkflowExecutor: Executing node:', node.id, 'type:', node.type);
    console.log('WorkflowExecutor: Available executors:', Array.from(this.nodeExecutors.keys()));
    
    const startTime = Date.now();
    
    this.updateDebugState({
      currentNode: node.id
    });
    
    try {
      // 获取节点类型，如果没有类型则使用默认值
      const nodeType = node.type || 'startNode';
      console.log('WorkflowExecutor: Looking for executor for type:', nodeType);
      
      let executor = this.nodeExecutors.get(nodeType);
      
      // 如果找不到执行器，尝试使用默认的开始节点执行器
      if (!executor) {
        console.warn(`WorkflowExecutor: No executor found for type ${nodeType}, using StartNodeExecutor as fallback`);
        executor = new StartNodeExecutor();
        // 动态注册这个类型的执行器
        this.nodeExecutors.set(nodeType, executor);
      }
      
      // 准备输入数据
      const input = this.prepareNodeInput(node, context);
      
      let result;
      try {
        result = await executor.execute(input, context);
      } catch (error) {
        if (error instanceof Error && error.message === 'WAITING_FOR_USER_INPUT') {
          // 等待用户输入
          this.updateDebugState({ status: 'waiting_input' });
          
          const userInput = await new Promise<string>((resolve) => {
            this.userInputResolvers.push(resolve);
          });
          
          if (this.abortController?.signal.aborted) {
            throw new Error('执行已被中止');
          }
          
          // 更新上下文并重新执行
          context.userInput = userInput;
          this.updateDebugState({ status: 'running' });
          result = await executor.execute(input, context);
        } else {
          throw error;
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 保存节点结果
      context.nodeResults[node.id] = result;
      
      // 更新调试结果
      const nodeResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType: node.type || 'ai-conversation',
        status: 'completed',
        startTime,
        endTime,
        duration,
        input,
        output: result,
        markdownOutput: result.markdownOutput
      };
      
      this.updateDebugState({
        completedNodes: [...this.debugState.completedNodes, node.id],
        results: {
          ...this.debugState.results,
          [node.id]: nodeResult
        }
      });
      
      // 执行后续节点
      const nextNodes = this.getNextNodes(node.id, allNodes, allEdges);
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode, allNodes, allEdges, context);
      }
      
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`节点 ${node.id} 执行失败:`, error);
      
      const nodeResult: DebugNodeResult = {
        nodeId: node.id,
        nodeType: node.type || 'ai-conversation',
        status: 'failed',
        startTime,
        endTime,
        duration,
        error: error instanceof Error ? error.message : '执行失败'
      };
      
      this.updateDebugState({
        results: {
          ...this.debugState.results,
          [node.id]: nodeResult
        }
      });
      
      throw error;
    }
  }
  
  // 准备节点输入数据
  private prepareNodeInput(node: Node, context: ExecutionContext): any {
    const nodeData = node.data || {};
    
    // 合并节点配置数据和上下文数据
    return {
      ...nodeData,
      previousResults: context.nodeResults,
      variables: context.variables
    };
  }
  
  // 获取下一个要执行的节点
  private getNextNodes(currentNodeId: string, allNodes: Node[], allEdges: Edge[]): Node[] {
    const outgoingEdges = allEdges.filter(edge => edge.source === currentNodeId);
    
    return outgoingEdges
      .map(edge => allNodes.find(node => node.id === edge.target))
      .filter((node): node is Node => node !== undefined);
  }
  
  // 获取执行统计信息
  getExecutionStats() {
    const results = this.debugState.results || {};
    const completedResults = Object.values(results).filter(r => r.status === 'completed');
    
    const totalDuration = this.debugState.startTime && this.debugState.endTime
      ? this.debugState.endTime - this.debugState.startTime
      : undefined;
      
    const averageNodeDuration = completedResults.length > 0
      ? completedResults.reduce((sum, r) => sum + r.duration, 0) / completedResults.length
      : undefined;
    
    return {
      totalCount: this.debugState.totalNodes,
      completedCount: this.debugState.completedNodes.length,
      progressPercentage: this.debugState.totalNodes > 0 
        ? (this.debugState.completedNodes.length / this.debugState.totalNodes) * 100 
        : 0,
      totalDuration,
      averageNodeDuration
    };
  }
}

// 导出单例实例
export const workflowExecutor = new WorkflowExecutor();

// 导出类作为默认导出，供需要创建新实例的地方使用
export default WorkflowExecutor;