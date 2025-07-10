import { NodeExecutor } from '../NodeExecutor';
import { ExecutionContext } from '../../types';

/**
 * JSON处理节点执行器
 * 负责处理JSON数据的各种操作：提取、转换、验证、合并、过滤、排序、聚合等
 */
export class JsonProcessNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'jsonProcessNode';
  }

  /**
   * 执行JSON处理节点
   * @param input 输入数据
   * @param context 执行上下文
   * @returns 处理结果
   */
  async execute(input: any, context: ExecutionContext): Promise<any> {
    // 直接调用优化后的执行方法
    return await this.executeOptimized(input, context);
  }

  /**
   * 构建优化后的节点配置
   * @param input 输入数据
   * @param nodeType 节点类型
   * @returns JSON处理节点配置
   */
  protected buildOptimizedNodeConfig(input: any, nodeType: string) {
    const config = input.config || input;
    
    return {
      nodeType: 'jsonProcessNode' as const,
      
      // 基础配置
      operation: config.operation || 'extract',
      inputFormat: config.inputFormat || 'auto',
      outputFormat: config.outputFormat || {
        format: 'json',
        pretty: true
      },
      
      // 数据提取配置
      extractConfig: config.extractConfig || {
        pathType: 'jsonpath',
        paths: ['$.*'],
        includeMetadata: false,
        flattenArrays: false
      },
      
      // 数据转换配置
      transformConfig: config.transformConfig,
      
      // 数据验证配置
      validateConfig: config.validateConfig,
      
      // 数据合并配置
      mergeConfig: config.mergeConfig,
      
      // 数据过滤配置
      filterConfig: config.filterConfig,
      
      // 排序配置
      sortConfig: config.sortConfig,
      
      // 聚合配置
      aggregateConfig: config.aggregateConfig,
      
      // 错误处理
      errorHandling: config.errorHandling || {
        onError: 'throw',
        continueOnError: false,
        logLevel: 'error'
      },
      
      // 性能配置
      performanceConfig: config.performanceConfig || {
        enableCache: false,
        timeout: 30000,
        memoryLimit: 100,
        batchSize: 1000
      },
      
      // 调试配置
      debugConfig: config.debugConfig || {
        enableLogging: false,
        logSteps: false,
        preserveIntermediate: false
      }
    };
  }

  /**
   * 标准化JSON处理节点的输出
   * @param output 原始输出
   * @param response 响应数据
   * @returns 标准化输出
   */
  protected normalizeOutput(output: string | any, response: any): any {
    if (typeof output === 'string') {
      // 尝试解析JSON字符串
      try {
        const parsedOutput = JSON.parse(output);
        return {
          result: parsedOutput,
          markdownOutput: this.formatMarkdownOutput(parsedOutput, response),
          executionTime: response.executionTime,
          timestamp: response.timestamp,
          metadata: {
            ...response.metadata,
            outputType: 'parsed_json',
            originalFormat: 'string'
          }
        };
      } catch (error) {
        // 如果不是JSON，直接返回字符串
        return {
          result: output,
          markdownOutput: this.formatMarkdownOutput(output, response),
          executionTime: response.executionTime,
          timestamp: response.timestamp,
          metadata: {
            ...response.metadata,
            outputType: 'string',
            parseError: error instanceof Error ? error.message : 'Unknown parse error'
          }
        };
      }
    }

    return {
      result: output,
      markdownOutput: this.formatMarkdownOutput(output, response),
      executionTime: response.executionTime,
      timestamp: response.timestamp,
      metadata: {
        ...response.metadata,
        outputType: 'object'
      }
    };
  }

  /**
   * 格式化为Markdown输出
   * @param data 处理结果数据
   * @param response 响应信息
   * @returns Markdown格式的输出
   */
  private formatMarkdownOutput(data: any, response: any): string {
    const config = response.metadata?.config || {};
    const operation = config.operation || 'unknown';
    
    let markdown = `# JSON处理结果\n\n`;
    markdown += `**操作类型**: ${this.getOperationLabel(operation)}\n`;
    markdown += `**执行时间**: ${response.executionTime || 0}ms\n`;
    markdown += `**处理时间**: ${new Date(response.timestamp || Date.now()).toLocaleString()}\n\n`;

    // 根据操作类型格式化输出
    switch (operation) {
      case 'extract':
        markdown += this.formatExtractResult(data, config);
        break;
      case 'transform':
        markdown += this.formatTransformResult(data, config);
        break;
      case 'validate':
        markdown += this.formatValidateResult(data, config);
        break;
      case 'filter':
        markdown += this.formatFilterResult(data, config);
        break;
      case 'sort':
        markdown += this.formatSortResult(data, config);
        break;
      case 'aggregate':
        markdown += this.formatAggregateResult(data, config);
        break;
      default:
        markdown += this.formatGenericResult(data);
    }

    return markdown;
  }

  /**
   * 获取操作类型的中文标签
   */
  private getOperationLabel(operation: string): string {
    const labels: Record<string, string> = {
      extract: '数据提取',
      transform: '数据转换',
      validate: '数据验证',
      merge: '数据合并',
      filter: '数据过滤',
      sort: '数据排序',
      aggregate: '数据聚合',
      format: '格式化输出',
      schema: 'Schema生成',
      compress: '数据压缩'
    };
    return labels[operation] || operation;
  }

  /**
   * 格式化数据提取结果
   */
  private formatExtractResult(data: any, config: any): string {
    let markdown = `## 数据提取结果\n\n`;
    
    if (config.extractConfig?.paths) {
      markdown += `**提取路径**: \n`;
      config.extractConfig.paths.forEach((path: string, index: number) => {
        markdown += `${index + 1}. \`${path}\`\n`;
      });
      markdown += '\n';
    }

    if (Array.isArray(data)) {
      markdown += `**提取到 ${data.length} 条记录**:\n\n`;
      data.slice(0, 5).forEach((item, index) => {
        markdown += `### 记录 ${index + 1}\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(item, null, 2);
        markdown += '\n```\n\n';
      });
      
      if (data.length > 5) {
        markdown += `*... 还有 ${data.length - 5} 条记录*\n\n`;
      }
    } else {
      markdown += `**提取结果**:\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(data, null, 2);
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  /**
   * 格式化数据转换结果
   */
  private formatTransformResult(data: any, config: any): string {
    let markdown = `## 数据转换结果\n\n`;
    
    if (config.transformConfig?.mappings) {
      markdown += `**字段映射**:\n`;
      config.transformConfig.mappings.forEach((mapping: any, index: number) => {
        markdown += `${index + 1}. \`${mapping.source}\` → \`${mapping.target}\` (${mapping.type})\n`;
      });
      markdown += '\n';
    }

    markdown += `**转换结果**:\n`;
    markdown += '```json\n';
    markdown += JSON.stringify(data, null, 2);
    markdown += '\n```\n\n';

    return markdown;
  }

  /**
   * 格式化数据验证结果
   */
  private formatValidateResult(data: any, config: any): string {
    let markdown = `## 数据验证结果\n\n`;
    
    if (data.valid !== undefined) {
      markdown += `**验证状态**: ${data.valid ? '✅ 通过' : '❌ 失败'}\n\n`;
    }

    if (data.errors && data.errors.length > 0) {
      markdown += `**验证错误** (${data.errors.length} 个):\n`;
      data.errors.forEach((error: any, index: number) => {
        markdown += `${index + 1}. **${error.field || 'unknown'}**: ${error.message || error}\n`;
      });
      markdown += '\n';
    }

    if (data.warnings && data.warnings.length > 0) {
      markdown += `**验证警告** (${data.warnings.length} 个):\n`;
      data.warnings.forEach((warning: any, index: number) => {
        markdown += `${index + 1}. **${warning.field || 'unknown'}**: ${warning.message || warning}\n`;
      });
      markdown += '\n';
    }

    if (data.summary) {
      markdown += `**验证摘要**: ${data.summary}\n\n`;
    }

    return markdown;
  }

  /**
   * 格式化数据过滤结果
   */
  private formatFilterResult(data: any, config: any): string {
    let markdown = `## 数据过滤结果\n\n`;
    
    if (config.filterConfig?.conditions) {
      markdown += `**过滤条件**:\n`;
      config.filterConfig.conditions.forEach((condition: any, index: number) => {
        markdown += `${index + 1}. \`${condition.path}\` ${condition.operator} \`${condition.value}\`\n`;
      });
      markdown += '\n';
    }

    if (Array.isArray(data)) {
      markdown += `**过滤结果**: 共 ${data.length} 条记录\n\n`;
      if (data.length > 0) {
        markdown += '```json\n';
        markdown += JSON.stringify(data.slice(0, 3), null, 2);
        markdown += '\n```\n\n';
        if (data.length > 3) {
          markdown += `*... 还有 ${data.length - 3} 条记录*\n\n`;
        }
      }
    } else {
      markdown += `**过滤结果**:\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(data, null, 2);
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  /**
   * 格式化排序结果
   */
  private formatSortResult(data: any, config: any): string {
    let markdown = `## 数据排序结果\n\n`;
    
    if (config.sortConfig?.sorts) {
      markdown += `**排序配置**:\n`;
      config.sortConfig.sorts.forEach((sort: any, index: number) => {
        markdown += `${index + 1}. 按 \`${sort.path}\` ${sort.order === 'asc' ? '升序' : '降序'} (${sort.type})\n`;
      });
      markdown += '\n';
    }

    if (Array.isArray(data)) {
      markdown += `**排序结果**: 共 ${data.length} 条记录\n\n`;
      if (data.length > 0) {
        markdown += '```json\n';
        markdown += JSON.stringify(data.slice(0, 5), null, 2);
        markdown += '\n```\n\n';
        if (data.length > 5) {
          markdown += `*... 还有 ${data.length - 5} 条记录*\n\n`;
        }
      }
    } else {
      markdown += `**排序结果**:\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(data, null, 2);
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  /**
   * 格式化聚合结果
   */
  private formatAggregateResult(data: any, config: any): string {
    let markdown = `## 数据聚合结果\n\n`;
    
    if (config.aggregateConfig) {
      const aggConfig = config.aggregateConfig;
      if (aggConfig.groupBy) {
        markdown += `**分组字段**: \`${aggConfig.groupBy}\`\n`;
      }
      if (aggConfig.operations) {
        markdown += `**聚合操作**:\n`;
        aggConfig.operations.forEach((op: any, index: number) => {
          markdown += `${index + 1}. ${op.operation}(\`${op.field}\`)`;
          if (op.alias) markdown += ` as \`${op.alias}\``;
          markdown += '\n';
        });
      }
      markdown += '\n';
    }

    if (Array.isArray(data)) {
      markdown += `**聚合结果**: 共 ${data.length} 个分组\n\n`;
      data.forEach((group: any, index: number) => {
        markdown += `### 分组 ${index + 1}\n`;
        markdown += '```json\n';
        markdown += JSON.stringify(group, null, 2);
        markdown += '\n```\n\n';
      });
    } else if (typeof data === 'object') {
      markdown += `**聚合结果**:\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(data, null, 2);
      markdown += '\n```\n\n';
    }

    return markdown;
  }

  /**
   * 格式化通用结果
   */
  private formatGenericResult(data: any): string {
    let markdown = `## 处理结果\n\n`;
    
    if (data !== null && data !== undefined) {
      markdown += '```json\n';
      markdown += JSON.stringify(data, null, 2);
      markdown += '\n```\n\n';
    } else {
      markdown += '*无结果数据*\n\n';
    }

    return markdown;
  }
}
