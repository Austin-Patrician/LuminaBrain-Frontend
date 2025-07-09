import { NodeExecutor } from '../NodeExecutor';

/**
 * AI摘要节点执行器
 */
export class AISummaryNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'aiSummaryNode';
  }
}

/**
 * 数据库节点执行器
 */
export class DatabaseNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'databaseNode';
  }
}

/**
 * 知识库节点执行器
 */
export class KnowledgeBaseNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'knowledgeBaseNode';
  }
}

/**
 * 响应节点执行器
 */
export class ResponseNodeExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'responseNode';
  }
}

/**
 * 条件判断节点执行器
 */
export class ConditionExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'conditionNode';
  }
}

/**
 * 数据处理节点执行器
 */
export class DataProcessExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'dataProcessNode';
  }
}

/**
 * AI对话节点执行器（兼容旧版本）
 */
export class AIConversationExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'aiConversationNode';
  }
}

/**
 * 用户输入节点执行器
 */
export class UserInputExecutor extends NodeExecutor {
  protected getNodeType(): string {
    return 'userInputNode';
  }
}
