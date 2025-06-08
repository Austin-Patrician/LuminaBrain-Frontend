# Execute-Node 接口 Payload 数据结构分析与优化

## 当前问题分析

### 1. 数据重复问题

**重复的 `userInput` 字段：**
- `runtimeData.userInput` - 运行时用户输入
- `runtimeData.variables.userInput` - 变量中的用户输入  
- `context.variables.userInput` - 上下文变量中的用户输入
- `context.userInput` - 上下文直接的用户输入

**重复的 `variables` 字段：**
- `runtimeData.variables` - 运行时变量
- `context.variables` - 执行上下文变量

### 2. 数据结构不清晰

当前的 payload 结构混合了多种用途的数据：
- 节点静态配置数据
- 运行时动态数据
- 执行上下文信息
- 历史执行结果

### 3. 当前数据流

```typescript
// 在 prepareNodeInput 中构建
runtimeData: {
  userMessage: needsUserInput && context.variables?.userInput ? context.variables.userInput : filteredNodeData.userMessage,
  data: filteredNodeData.data,
  variables: context.variables,  // 第一次：运行时变量
  userInput: context.userInput || context.variables?.userInput  // 第二次：用户输入
}

// 在 NodeExecutor.execute 中又构建
const nodeContext = {
  variables: context.variables || {},  // 第三次：上下文变量
  userInput: context.userInput,  // 第四次：上下文用户输入
  // ...
}
```

## 优化方案

### 方案 1：简化数据结构（推荐）

**核心思想：**
- 消除重复字段
- 明确数据层次和职责
- 简化接口定义

**新的接口定义：**

```typescript
// 简化后的节点执行输入接口
export interface NodeExecutionInput {
  // 基础属性
  nodeId: string;
  nodeType: string;
  label?: string;
  description?: string;
  
  // 节点配置（静态配置）
  config: NodeConfigUnion;
  
  // 执行数据（动态数据）
  executionData?: {
    userInput?: string;           // 统一的用户输入
    inputData?: any;              // 输入数据
    previousResult?: any;         // 前置节点结果
  };
}

// 简化后的执行上下文
export interface NodeExecutionContext {
  // 执行环境
  executionId?: string;
  stepId?: string;
  workflowId?: string;
  
  // 全局状态
  globalVariables: Record<string, any>;  // 全局变量
  nodeResults: Record<string, any>;      // 节点结果历史
}

// 节点配置联合类型
type NodeConfigUnion = 
  | AINodeConfig 
  | DatabaseNodeConfig 
  | KnowledgeBaseNodeConfig 
  | HTTPNodeConfig
  | ConditionNodeConfig
  | DataProcessNodeConfig
  | StartNodeConfig
  | EndNodeConfig
  | UserInputNodeConfig
  | ResponseNodeConfig;
```

### 方案 2：保持现有结构，清理重复（保守）

**核心思想：**
- 保持现有接口不变
- 仅清理重复字段
- 明确数据来源优先级

**修改策略：**

```typescript
// 修改 prepareNodeInput 方法
private prepareNodeInput(node: Node, context: ExecutionContext): any {
  const nodeData = node.data || {};
  const nodeType = node.type || 'unknown';
  
  // 构建符合 NodeExecutionInput 接口的数据结构
  const nodeInput = {
    nodeId: node.id,
    nodeType,
    label: nodeData.label,
    description: nodeData.description,
    inputSource: nodeData.inputSource,
    
    // 根据节点类型构建相应的配置
    config: this.buildNodeConfig(nodeData, nodeType),
    
    // 简化运行时数据 - 移除重复字段
    runtimeData: {
      userMessage: nodeData.userMessage,
      data: nodeData.data,
      // 移除 variables 和 userInput，统一在 context 中处理
    }
  };

  return nodeInput;
}

// 修改 NodeExecutor.execute 方法
async execute(input: any, context: ExecutionContext): Promise<any> {
  // ... 其他代码

  // 构建执行上下文 - 统一管理变量和用户输入
  const nodeContext: NodeExecutionContext = {
    variables: {
      ...context.variables,
      // 如果有用户输入，添加到变量中
      ...(context.userInput ? { userInput: context.userInput } : {})
    },
    nodeResults: context.nodeResults || {},
    userInput: context.userInput,  // 保留单独的 userInput 字段以兼容现有代码
    previousResult: this.getMinimalPreviousResult(context.nodeResults || {}),
    executionId: context.executionPlan?.id,
    stepId: context.currentStep?.id,
    workflowId: context.executionPlan?.workflowId
  };
  
  // ... 其他代码
}
```

## 推荐实施计划

### 阶段1：清理重复数据（立即可做）
1. 修改 `prepareNodeInput` 方法，移除 `runtimeData` 中的重复字段
2. 在 `NodeExecutor.execute` 中统一处理变量和用户输入
3. 更新相关的类型定义注释

### 阶段2：接口重构（需要后端配合）
1. 设计新的简化接口
2. 创建新旧接口的适配层
3. 逐步迁移到新接口
4. 删除旧接口

### 阶段3：优化和清理
1. 优化数据传输大小
2. 改进错误处理
3. 加强类型安全

## 具体修改建议

### 立即修改：清理 prepareNodeInput
```typescript
// 当前版本（有重复）
runtimeData: {
  userMessage: needsUserInput && context.variables?.userInput ? context.variables.userInput : filteredNodeData.userMessage,
  data: filteredNodeData.data,
  variables: context.variables,  // 重复1
  userInput: context.userInput || context.variables?.userInput  // 重复2
}

// 优化版本（去重复）
runtimeData: {
  userMessage: filteredNodeData.userMessage,
  data: filteredNodeData.data
  // 移除 variables 和 userInput，由 context 统一管理
}
```

### 立即修改：统一 context 处理
```typescript
const nodeContext: NodeExecutionContext = {
  variables: {
    ...context.variables,
    // 确保 userInput 在 variables 中可用
    ...(context.userInput ? { userInput: context.userInput } : {})
  },
  nodeResults: context.nodeResults || {},
  userInput: context.userInput,  // 单独保留以确保兼容性
  // ... 其他字段
};
```

这样既保持了向后兼容性，又消除了数据重复，为后续的接口重构打下基础。
