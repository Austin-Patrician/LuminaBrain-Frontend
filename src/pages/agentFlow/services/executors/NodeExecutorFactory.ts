import { Node } from '@xyflow/react';
import { NodeExecutor } from './NodeExecutor';
import { 
  AIDialogNodeExecutor,
  AISummaryNodeExecutor,
  StartNodeExecutor,
  EndNodeExecutor,
  DatabaseNodeExecutor,
  KnowledgeBaseNodeExecutor,
  ResponseNodeExecutor,
  ConditionExecutor,
  DataProcessExecutor,
  AIConversationExecutor,
  UserInputExecutor
} from './implementations';

/**
 * 节点执行器工厂
 * 负责创建和管理各种类型的节点执行器
 */
export class NodeExecutorFactory {
  private nodeExecutors: Map<string, NodeExecutor> = new Map();

  constructor() {
    this.initializeNodeExecutors();
  }

  /**
   * 初始化所有节点执行器
   */
  private initializeNodeExecutors(): void {
    // 注册节点执行器 - 映射节点类型到对应的执行器
    this.nodeExecutors.set('startNode', new StartNodeExecutor());
    this.nodeExecutors.set('endNode', new EndNodeExecutor());
    this.nodeExecutors.set('aiDialogNode', new AIDialogNodeExecutor());
    this.nodeExecutors.set('aiSummaryNode', new AISummaryNodeExecutor());
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

  /**
   * 获取节点执行器
   * @param nodeType 节点类型
   * @returns 节点执行器实例
   */
  getExecutor(nodeType: string): NodeExecutor {
    const executor = this.nodeExecutors.get(nodeType);
    if (!executor) {
      throw new Error(`Unknown node type: ${nodeType}`);
    }
    return executor;
  }

  /**
   * 获取节点执行器（通过节点对象）
   * @param node 节点对象
   * @returns 节点执行器实例
   */
  getExecutorForNode(node: Node): NodeExecutor {
    const nodeType = node.type || 'unknown';
    return this.getExecutor(nodeType);
  }

  /**
   * 注册新的节点执行器
   * @param nodeType 节点类型
   * @param executor 执行器实例
   */
  registerExecutor(nodeType: string, executor: NodeExecutor): void {
    this.nodeExecutors.set(nodeType, executor);
  }

  /**
   * 获取所有支持的节点类型
   * @returns 节点类型数组
   */
  getSupportedNodeTypes(): string[] {
    return Array.from(this.nodeExecutors.keys());
  }

  /**
   * 检查是否支持特定节点类型
   * @param nodeType 节点类型
   * @returns 是否支持
   */
  isSupported(nodeType: string): boolean {
    return this.nodeExecutors.has(nodeType);
  }
}

export default NodeExecutorFactory;
