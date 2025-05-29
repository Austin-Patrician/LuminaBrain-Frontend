import { Node, Edge } from '@xyflow/react';

export interface ExecutionContext {
  variables: Record<string, any>;
  history: ExecutionStep[];
  currentStep?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  input: any;
  output: any;
  timestamp: number;
  duration: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

export interface NodeExecutor {
  execute(node: Node, context: ExecutionContext): Promise<any>;
}

class WorkflowExecutor {
  private nodeExecutors: Map<string, NodeExecutor> = new Map();
  private isRunning = false;
  private currentExecution?: ExecutionContext;

  constructor() {
    this.registerDefaultExecutors();
  }

  private registerDefaultExecutors() {
    // Register LLM node executor
    this.nodeExecutors.set('llmNode', {
      execute: async (node: Node, context: ExecutionContext) => {
        const { prompt, model, temperature } = node.data;
        // Simulate LLM execution
        await this.delay(2000);
        return {
          response: `LLM response for: ${prompt}`,
          model,
          tokens: Math.floor(Math.random() * 1000) + 100
        };
      }
    });

    // Register HTTP node executor
    this.nodeExecutors.set('httpNode', {
      execute: async (node: Node, context: ExecutionContext) => {
        const { url, method, headers, body } = node.data;
        try {
          const response = await fetch(url, {
            method: method || 'GET',
            headers: headers || {},
            body: method === 'POST' ? JSON.stringify(body) : undefined
          });
          return await response.json();
        } catch (error) {
          throw new Error(`HTTP request failed: ${error}`);
        }
      }
    });

    // Register condition node executor
    this.nodeExecutors.set('conditionNode', {
      execute: async (node: Node, context: ExecutionContext) => {
        const { condition, leftValue, operator, rightValue } = node.data;
        let result = false;
        
        switch (operator) {
          case 'equals':
            result = leftValue === rightValue;
            break;
          case 'not_equals':
            result = leftValue !== rightValue;
            break;
          case 'greater_than':
            result = Number(leftValue) > Number(rightValue);
            break;
          case 'less_than':
            result = Number(leftValue) < Number(rightValue);
            break;
          default:
            result = Boolean(leftValue);
        }
        
        return { condition: result, path: result ? 'true' : 'false' };
      }
    });

    // Register start node executor
    this.nodeExecutors.set('startNode', {
      execute: async (node: Node, context: ExecutionContext) => {
        return { message: 'Workflow started', timestamp: Date.now() };
      }
    });

    // Register end node executor
    this.nodeExecutors.set('endNode', {
      execute: async (node: Node, context: ExecutionContext) => {
        return { message: 'Workflow completed', timestamp: Date.now() };
      }
    });
  }

  public registerNodeExecutor(nodeType: string, executor: NodeExecutor) {
    this.nodeExecutors.set(nodeType, executor);
  }

  public async executeWorkflow(
    nodes: Node[], 
    edges: Edge[], 
    onStepComplete?: (step: ExecutionStep) => void,
    onProgress?: (progress: number) => void
  ): Promise<ExecutionContext> {
    if (this.isRunning) {
      throw new Error('Workflow is already running');
    }

    this.isRunning = true;
    this.currentExecution = {
      variables: {},
      history: [],
      currentStep: undefined
    };

    try {
      const startNode = nodes.find(node => node.type === 'startNode');
      if (!startNode) {
        throw new Error('No start node found');
      }

      const totalNodes = nodes.length;
      let completedNodes = 0;

      await this.executeNodeRecursively(
        startNode, 
        nodes, 
        edges, 
        this.currentExecution,
        (step) => {
          completedNodes++;
          onStepComplete?.(step);
          onProgress?.(completedNodes / totalNodes);
        }
      );

      return this.currentExecution;
    } finally {
      this.isRunning = false;
    }
  }

  private async executeNodeRecursively(
    node: Node,
    allNodes: Node[],
    allEdges: Edge[],
    context: ExecutionContext,
    onStepComplete?: (step: ExecutionStep) => void
  ): Promise<any> {
    const startTime = Date.now();
    context.currentStep = node.id;

    const step: ExecutionStep = {
      nodeId: node.id,
      nodeType: node.type || 'unknown',
      input: context.variables,
      output: null,
      timestamp: startTime,
      duration: 0,
      status: 'running'
    };

    try {
      const executor = this.nodeExecutors.get(node.type || '');
      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      step.output = await executor.execute(node, context);
      step.status = 'completed';
      step.duration = Date.now() - startTime;

      // Update context variables with node output
      context.variables[node.id] = step.output;
      context.history.push(step);

      onStepComplete?.(step);

      // Find next nodes
      const nextEdges = allEdges.filter(edge => edge.source === node.id);
      
      for (const edge of nextEdges) {
        const nextNode = allNodes.find(n => n.id === edge.target);
        if (nextNode) {
          // Handle conditional execution for condition nodes
          if (node.type === 'conditionNode' && step.output?.path) {
            if (edge.sourceHandle === step.output.path || !edge.sourceHandle) {
              await this.executeNodeRecursively(nextNode, allNodes, allEdges, context, onStepComplete);
            }
          } else {
            await this.executeNodeRecursively(nextNode, allNodes, allEdges, context, onStepComplete);
          }
        }
      }

      return step.output;
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : String(error);
      step.duration = Date.now() - startTime;
      context.history.push(step);
      onStepComplete?.(step);
      throw error;
    }
  }

  public stopExecution() {
    this.isRunning = false;
  }

  public isExecutionRunning(): boolean {
    return this.isRunning;
  }

  public getCurrentExecution(): ExecutionContext | undefined {
    return this.currentExecution;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default WorkflowExecutor;