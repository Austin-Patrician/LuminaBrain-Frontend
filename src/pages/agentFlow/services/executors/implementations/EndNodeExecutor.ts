import { NodeExecutor } from '../NodeExecutor';
import { ExecutionContext } from '../../types';

/**
 * 结束节点执行器
 * 负责处理工作流结束节点的执行逻辑
 */
export class EndNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'endNode';
  }

  /**
   * 重写执行方法，跳过后端API调用，进行本地处理
   * @param input 输入数据
   * @param context 执行上下文
   * @returns 执行结果
   */
  async execute(input: any, context: ExecutionContext): Promise<any> {
    const nodeType = this.getNodeType();
    
    // 获取上一个节点的结果
    const previousResults = Object.values(context.nodeResults);
    const lastResult = previousResults[previousResults.length - 1];
    
    // 构建结束节点的输出
    const output = {
      message: '工作流已完成',
      previousResult: lastResult,
      finalOutput: lastResult?.output || lastResult?.result || lastResult,
      outputFormat: input.config?.outputFormat || 'json',
      returnCode: input.config?.returnCode || 0,
      timestamp: Date.now()
    };

    // 生成Markdown输出
    const markdownParts = [
      '### 工作流完成',
      '',
      `- **完成时间**: ${new Date().toLocaleString()}`,
      `- **返回码**: ${input.config?.returnCode || 0}`,
      `- **输出格式**: ${input.config?.outputFormat || 'json'}`,
      ''
    ];

    if (lastResult) {
      markdownParts.push('#### 最终结果', '');
      
      if (lastResult.markdownOutput) {
        markdownParts.push(lastResult.markdownOutput);
      } else if (lastResult.output) {
        markdownParts.push('```json', JSON.stringify(lastResult.output, null, 2), '```');
      } else if (lastResult.result) {
        markdownParts.push('```json', JSON.stringify(lastResult.result, null, 2), '```');
      } else {
        markdownParts.push('```json', JSON.stringify(lastResult, null, 2), '```');
      }
    } else {
      markdownParts.push('#### 最终结果', '', '无前置节点结果');
    }

    if (input.config?.finalMessage) {
      markdownParts.push('', '#### 结束消息', '', input.config.finalMessage);
    }

    const markdownOutput = markdownParts.join('\n');
    
    return this.normalizeOutput(output, {
      success: true,
      output: markdownOutput,
      nodeId: input.nodeId,
      nodeType,
      timestamp: Date.now()
    });
  }
}
