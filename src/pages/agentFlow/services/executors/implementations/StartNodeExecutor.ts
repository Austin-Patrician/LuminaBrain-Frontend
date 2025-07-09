import { NodeExecutor } from '../NodeExecutor';
import { ExecutionContext } from '../../types';

/**
 * 开始节点执行器
 * 负责处理工作流开始节点的执行逻辑
 */
export class StartNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'startNode';
  }

  /**
   * 重写执行方法，跳过后端API调用，进行本地处理
   * @param input 输入数据
   * @param context 执行上下文
   * @returns 执行结果
   */
  async execute(input: any, context: ExecutionContext): Promise<any> {
    const nodeType = this.getNodeType();
    
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
    
    const markdownOutput = [
      '### 工作流开始',
      '',
      `- **触发类型**: ${input.config?.triggerType || 'manual'}`,
      `- **开始时间**: ${new Date().toLocaleString()}`,
      `- **初始数据**: ${JSON.stringify(input.config?.initialData || {}, null, 2)}`,
      `- **用户输入**: ${context.userInput || input.runtimeData?.userInput || '无'}`
    ].join('\n');
    
    return this.normalizeOutput(output, {
      success: true,
      output: markdownOutput,
      nodeId: input.nodeId,
      nodeType,
      timestamp: Date.now()
    });
  }
}
