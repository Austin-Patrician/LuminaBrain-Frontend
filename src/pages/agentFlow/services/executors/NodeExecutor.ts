import { ExecutionContext } from '../types';
import { 
  flowService, 
  type OptimizedNodeExecutionRequest,
  type NodeConfig
} from '@/api/services/flowService';

/**
 * 节点执行器基类
 * 定义了所有节点执行器的通用行为和接口
 */
export abstract class NodeExecutor {
  /**
   * 执行节点的主要方法
   * @param input 输入数据
   * @param context 执行上下文
   * @returns 执行结果
   */
  async execute(input: any, context: ExecutionContext): Promise<any> {
    return await this.executeOptimized(input, context);
  }

  /**
   * 使用优化后的API执行节点
   * @param input 输入数据
   * @param context 执行上下文
   * @returns 执行结果
   */
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
      userInput: context.userInput || context.variables?.userInput,
      userMessage: input.userMessage,
      inputData: input.data,
      previousdata: this.getPreviousDataAsString(context.nodeResults || {})
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

  /**
   * 构建优化后的强类型节点配置
   * @param input 输入数据
   * @param nodeType 节点类型
   * @returns 节点配置
   */
  protected buildOptimizedNodeConfig(input: any, nodeType: string): NodeConfig {
    const config = input.config || input;
    
    switch (nodeType) {
      case 'aiDialogNode':
        return {
          nodeType: 'aiDialogNode',
          model: config.model || config.selectedModel || '',
          systemPrompt: config.systemPrompt,
          userMessage: config.userMessage,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 1000,
          stream: config.stream ?? false
        };
      
      case 'aiSummaryNode':
        return {
          nodeType: 'aiSummaryNode',
          model: config.model || config.selectedModel || '',
          systemPrompt: config.systemPrompt,
          userMessage: config.userMessage,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 1000,
          stream: config.stream ?? false,
          summaryStyle: config.summaryStyle || 'paragraph',
          summaryLength: config.summaryLength || 'medium',
          maxSummaryLength: config.maxSummaryLength || 300,
          language: config.language || 'zh-CN',
          includeKeyPoints: config.includeKeyPoints || false,
          extractKeywords: config.extractKeywords || false
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
        return {
          nodeType: nodeType as any,
          ...input
        } as NodeConfig;
    }
  }

  /**
   * 获取上一节点结果的字符串格式
   * @param nodeResults 节点结果集合
   * @returns 字符串形式的结果
   */
  protected getPreviousDataAsString(nodeResults: Record<string, any>): string {
    if (!nodeResults || Object.keys(nodeResults).length === 0) {
      return '';
    }
    
    const results = Object.entries(nodeResults)
      .filter(([nodeId, result]) => {
        return result && typeof result === 'object' && 
               !result.message?.includes('工作流已开始') &&
               !nodeId.includes('start');
      })
      .map(([_, result]) => result);
    
    if (results.length === 0) {
      return '';
    }
    
    const lastResult = results[results.length - 1];
    if (!lastResult) return '';
    
    try {
      let outputContent = '';
      
      if (lastResult.output !== undefined) {
        outputContent = typeof lastResult.output === 'string' 
          ? lastResult.output 
          : JSON.stringify(lastResult.output, null, 2);
      } else if (lastResult.result !== undefined) {
        outputContent = typeof lastResult.result === 'string' 
          ? lastResult.result 
          : JSON.stringify(lastResult.result, null, 2);
      } else if (lastResult.response !== undefined) {
        outputContent = typeof lastResult.response === 'string' 
          ? lastResult.response 
          : JSON.stringify(lastResult.response, null, 2);
      } else {
        const { timestamp, duration, startTime, endTime, message, ...cleanResult } = lastResult;
        outputContent = JSON.stringify(cleanResult, null, 2);
      }
      
      return outputContent;
    } catch (error) {
      console.error('Failed to serialize previous node result:', error);
      return '';
    }
  }

  /**
   * 标准化输出数据
   * @param output 输出数据
   * @param response 响应数据
   * @returns 标准化后的输出
   */
  protected normalizeOutput(output: string | any, response: any): any {
    if (typeof output === 'string') {
      return {
        markdownOutput: output,
        result: output,
        executionTime: response.executionTime,
        timestamp: response.timestamp,
        metadata: response.metadata
      };
    }

    return {
      ...output,
      executionTime: response.executionTime,
      timestamp: response.timestamp,
      metadata: response.metadata
    };
  }

  /**
   * 获取节点类型
   * 子类需要实现此方法
   */
  protected abstract getNodeType(): string;
}
