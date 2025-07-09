import { NodeExecutor } from '../NodeExecutor';

/**
 * AI对话节点执行器
 * 负责处理AI对话节点的执行逻辑
 */
export class AIDialogNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'aiDialogNode';
  }
}
