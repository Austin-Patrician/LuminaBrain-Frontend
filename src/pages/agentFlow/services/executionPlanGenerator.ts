import { Node, Edge } from '@xyflow/react';
import { ExecutionPlan, ExecutionStep, UserInputConfig } from '@/types/executionPlan';
import { enhancedNodeConfigs } from '../config/nodeDefinitions';
import { requiresUserInput } from '../constants/inputSource';

export class ExecutionPlanGenerator {
  /**
   * 生成执行计划
   */
  generateExecutionPlan(nodes: Node[], edges: Edge[], workflowId: string): ExecutionPlan {
    const steps = this.analyzeWorkflow(nodes, edges);
    const totalEstimatedDuration = steps.reduce((sum, step) => sum + (step.estimatedDuration || 0), 0);
    const userInputSteps = steps.filter(step => step.requiresUserInput);

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `执行计划 - ${new Date().toLocaleDateString()}`,
      description: `包含 ${steps.length} 个步骤的工作流执行计划`,
      workflowId,
      steps,
      totalSteps: steps.length,
      estimatedTotalDuration: totalEstimatedDuration,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'draft',
      version: '1.0.0',
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        hasUserInteraction: steps.some(step => step.requiresUserInput)
      }
    };
  }

  /**
   * 分析工作流并生成执行步骤
   */
  private analyzeWorkflow(nodes: Node[], edges: Edge[]): ExecutionStep[] {
    const steps: ExecutionStep[] = [];
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const edgeMap = this.buildEdgeMap(edges);
    
    // 找到起始节点
    const startNode = nodes.find(node => node.type === 'startNode');
    if (!startNode) {
      throw new Error('未找到开始节点');
    }

    // 使用拓扑排序确定执行顺序
    const executionOrder = this.topologicalSort(nodes, edges);
    
    // 为每个节点创建执行步骤
    executionOrder.forEach((nodeId, index) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const dependencies = this.getNodeDependencies(nodeId, edgeMap);

      const userInputConfig = this.analyzeUserInputRequirements(node);
      
      const step: ExecutionStep = {
        id: `step_${index + 1}_${nodeId}`,
        nodeId: node.id,
        nodeType: node.type || 'unknown',
        label: (node.data?.label as string) || `步骤 ${index + 1}`,
        description: (node.data?.description as string) || this.getNodeTypeDescription(node.type || ''),
        dependencies,
        estimatedDuration: this.estimateNodeExecutionTime(node.type || ''),
        requiresUserInput: !!userInputConfig,
        userInputConfig,
        status: 'pending'
      };

      steps.push(step);
    });

    return steps;
  }

  /**
   * 拓扑排序确定节点执行顺序
   */
  private topologicalSort(nodes: Node[], edges: Edge[]): string[] {
    const inDegree = new Map<string, number>();
    const adjacencyList = new Map<string, string[]>();
    
    // 初始化
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjacencyList.set(node.id, []);
    });
    
    // 构建图和计算入度
    edges.forEach(edge => {
      const source = edge.source;
      const target = edge.target;
      
      adjacencyList.get(source)?.push(target);
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });
    
    // 找到所有入度为0的节点
    const queue: string[] = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });
    
    const result: string[] = [];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      
      // 处理当前节点的所有邻居
      const neighbors = adjacencyList.get(current) || [];
      neighbors.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        
        if (newDegree === 0) {
          queue.push(neighbor);
        }
      });
    }
    
    return result;
  }

  /**
   * 构建边映射表
   */
  private buildEdgeMap(edges: Edge[]): Map<string, string[]> {
    const edgeMap = new Map<string, string[]>();
    
    edges.forEach(edge => {
      if (!edgeMap.has(edge.target)) {
        edgeMap.set(edge.target, []);
      }
      edgeMap.get(edge.target)!.push(edge.source);
    });
    
    return edgeMap;
  }

  /**
   * 获取节点依赖关系
   */
  private getNodeDependencies(nodeId: string, edgeMap: Map<string, string[]>): string[] {
    return edgeMap.get(nodeId) || [];
  }  /**
   * 分析节点的用户输入需求
   */
  private analyzeUserInputRequirements(node: Node): UserInputConfig | undefined {
    const nodeData = node.data || {};
    const nodeType = node.type || '';
    
    // 开始节点始终需要用户输入，因为它是工作流的入口点
    if (nodeType === 'startNode') {
      return this.createUserInputConfig(nodeType, nodeData);
    }
    
    // 优先检查节点配置中的 inputSource 设置
    if ('inputSource' in nodeData) {
      // 使用全局常量检查节点配置中是否指定了输入来源为用户输入
      if (requiresUserInput(nodeData.inputSource as string)) {
        return this.createUserInputConfig(nodeType, nodeData);
      } else {
        return undefined;
      }
    }
    
    // 如果没有明确配置 inputSource，则检查特定节点类型是否需要用户输入（为了向后兼容）
    const userInputNodeTypes = ['userInputNode', 'formNode'];
    if (userInputNodeTypes.includes(nodeType)) {
      return this.createUserInputConfig(nodeType, nodeData);
    }

    // 检查节点是否配置了用户输入字段（为了向后兼容）
    if (nodeData.requiresUserInput || nodeData.userInputType) {
      return this.createUserInputConfig(nodeType, nodeData);
    }
    
    return undefined;
  }

  /**
   * 创建用户输入配置
   */
  private createUserInputConfig(nodeType: string, nodeData: any): UserInputConfig {
    const baseConfig: UserInputConfig = {
      type: 'text',
      label: '请输入内容',
      description: '此节点需要用户输入',
      placeholder: '请输入...',
      required: true,
      showPreviousData: true
    };

    // 根据节点类型定制用户输入配置
    switch (nodeType) {
      case 'startNode':
        return {
          ...baseConfig,
          label: '初始输入',
          description: '请输入工作流的初始数据或查询内容',
          placeholder: '输入您的问题或数据...'
        };
      
      case 'aiDialogNode':
      case 'aiSummaryNode':
      case 'aiExtractNode':
      case 'aiJsonNode':
        return {
          ...baseConfig,
          label: '用户消息',
          description: '请输入要发送给AI的消息',
          placeholder: '输入您想问AI的问题...'
        };
      
      case 'conditionNode':
      case 'decisionNode':
        return {
          ...baseConfig,
          type: 'select',
          label: '条件选择',
          description: '请选择条件判断结果',
          options: [
            { label: '是/通过', value: 'true' },
            { label: '否/不通过', value: 'false' }
          ]
        };
      
      case 'databaseNode':
        return {
          ...baseConfig,
          label: '查询参数',
          description: '请输入数据库查询的参数或SQL语句',
          placeholder: '输入查询条件或SQL语句...'
        };
      
      case 'knowledgeBaseNode':
      case 'bingNode':
        return {
          ...baseConfig,
          label: '搜索查询',
          description: '请输入要搜索的内容',
          placeholder: '输入搜索关键词...'
        };
      
      case 'httpNode':
        return {
          ...baseConfig,
          type: 'json',
          label: 'HTTP请求数据',
          description: '请输入HTTP请求的数据',
          placeholder: '{"key": "value"}'
        };
      
      case 'jsonExtractor':
        return {
          ...baseConfig,
          type: 'json',
          label: 'JSON数据',
          description: '请输入要处理的JSON数据',
          placeholder: '{"key": "value"}'
        };
      
      case 'formNode':
        return {
          ...baseConfig,
          type: 'json',
          label: '表单数据',
          description: '请填写表单数据',
          placeholder: '{"key": "value"}'
        };
        
      case 'basicNode':
      case 'processNode':
      case 'customNode':
        return {
          ...baseConfig,
          label: '处理数据',
          description: '请输入要处理的数据',
          placeholder: '输入数据内容...'
        };
    }

    // 从节点数据中提取配置
    if (nodeData.userInputConfig) {
      return { ...baseConfig, ...nodeData.userInputConfig };
    }

    return baseConfig;
  }

  /**
   * 估算节点执行时间（毫秒）
   */
  private estimateNodeExecutionTime(nodeType: string): number {
    const estimationMap: Record<string, number> = {
      'startNode': 100,
      'endNode': 100,
      'aiDialogNode': 3000,
      'aiSummaryNode': 2500,
      'aiExtractNode': 2000,
      'databaseNode': 1500,
      'knowledgeBaseNode': 2000,
      'httpNode': 1000,
      'conditionNode': 300,
      'responseNode': 200,
      'basicNode': 500
    };

    return estimationMap[nodeType] || 1000;
  }

  /**
   * 获取节点类型描述
   */
  private getNodeTypeDescription(nodeType: string): string {
    const config = enhancedNodeConfigs[nodeType as keyof typeof enhancedNodeConfigs];
    return config?.description || `${nodeType} 节点`;
  }

  /**
   * 更新执行计划状态
   */
  updateExecutionPlan(plan: ExecutionPlan, stepId: string, updates: Partial<ExecutionStep>): ExecutionPlan {
    const updatedSteps = plan.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );

    const updatedPlan: ExecutionPlan = {
      ...plan,
      steps: updatedSteps,
      updatedAt: Date.now()
    };

    // 更新整体状态
    if (updatedSteps.every(step => step.status === 'completed')) {
      updatedPlan.status = 'completed';
    } else if (updatedSteps.some(step => step.status === 'failed')) {
      updatedPlan.status = 'failed';
    } else if (updatedSteps.some(step => step.status === 'running' || step.status === 'waiting_input')) {
      updatedPlan.status = 'running';
    }

    return updatedPlan;
  }

  /**
   * 获取下一个可执行的步骤
   */
  getNextExecutableStep(plan: ExecutionPlan): ExecutionStep | null {
    const stepMap = new Map(plan.steps.map(step => [step.nodeId, step]));
    
    for (const step of plan.steps) {
      if (step.status !== 'pending') continue;
      
      // 检查所有依赖是否已完成
      const allDependenciesCompleted = step.dependencies.every(depNodeId => {
        const depStep = stepMap.get(depNodeId);
        return depStep?.status === 'completed';
      });
      
      if (allDependenciesCompleted) {
        return step;
      }
    }
    
    return null;
  }
}

export default ExecutionPlanGenerator;
