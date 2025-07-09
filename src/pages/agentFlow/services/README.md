# WorkflowExecutor 重构说明

## 重构概述

原始的 `workflowExecutor.ts` 文件过于庞大（超过1000行），承担了过多的职责。我们按照单一职责原则将其拆分为多个专门的模块。

## 新的架构

### 核心组件

1. **ExecutionManager** (`ExecutionManager.ts`) - 主要的执行管理器
   - 整合所有拆分的组件
   - 提供统一的工作流执行接口
   - 负责协调各个组件之间的交互

2. **NodeExecutorFactory** (`executors/NodeExecutorFactory.ts`) - 节点执行器工厂
   - 管理各种类型的节点执行器
   - 提供节点执行器的注册和获取功能
   - 支持动态扩展新的节点类型

3. **NodeExecutor** (`executors/NodeExecutor.ts`) - 节点执行器基类
   - 定义所有节点执行器的通用行为
   - 处理节点配置构建和API调用
   - 提供数据标准化功能

4. **ExecutionStateManager** (`state/ExecutionStateManager.ts`) - 执行状态管理器
   - 管理工作流的执行状态
   - 处理状态变化通知
   - 维护调试执行状态

5. **ExecutionStatsCollector** (`stats/ExecutionStatsCollector.ts`) - 统计数据收集器
   - 收集和管理执行统计数据
   - 计算性能指标
   - 维护执行历史记录

6. **UserInputHandler** (`input/UserInputHandler.ts`) - 用户输入处理器
   - 处理用户输入请求和响应
   - 管理用户输入等待状态
   - 提供输入验证功能

### 节点执行器实现

位于 `executors/implementations/` 目录下：

- **StartNodeExecutor** - 开始节点执行器
- **EndNodeExecutor** - 结束节点执行器  
- **AIDialogNodeExecutor** - AI对话节点执行器
- **OtherExecutors** - 其他节点执行器的集合

### 类型定义

`types.ts` 文件包含了所有共享的类型定义：
- ExecutionContext - 执行上下文
- DebugNodeInput/DebugNodeResult - 调试相关接口
- DebugExecutionState - 执行状态接口
- ExecutionStats - 统计数据接口
- NodePerformanceStats - 节点性能统计接口

## 向后兼容性

重构后的 `workflowExecutor.ts` 作为 `ExecutionManager` 的代理，保持原有的API接口不变，确保现有代码无需修改即可正常工作。

## 优势

1. **单一职责** - 每个模块只负责一个特定功能
2. **可维护性** - 代码结构清晰，易于理解和修改
3. **可扩展性** - 新的节点类型和功能可以轻松添加
4. **可测试性** - 每个组件可以独立测试
5. **重用性** - 组件可以在其他地方重用

## 使用方式

```typescript
import { workflowExecutor } from './services/workflowExecutor';

// 原有的API接口保持不变
workflowExecutor.startDebugExecution(nodes, edges);
workflowExecutor.getDebugState();
workflowExecutor.onExecutionStateChange(callback);
```

## 扩展新节点类型

1. 在 `executors/implementations/` 下创建新的执行器类
2. 继承 `NodeExecutor` 基类
3. 实现 `getNodeType()` 方法
4. 在 `NodeExecutorFactory` 中注册新的执行器
5. 在 `types.ts` 中添加相关类型定义（如需要）

## 文件结构

```
src/pages/agentFlow/services/
├── ExecutionManager.ts           # 主执行管理器
├── workflowExecutor.ts          # 兼容性代理
├── types.ts                     # 类型定义
├── executors/
│   ├── NodeExecutor.ts          # 节点执行器基类
│   ├── NodeExecutorFactory.ts   # 节点执行器工厂
│   └── implementations/         # 具体实现
│       ├── index.ts
│       ├── StartNodeExecutor.ts
│       ├── EndNodeExecutor.ts
│       ├── AIDialogNodeExecutor.ts
│       └── OtherExecutors.ts
├── state/
│   └── ExecutionStateManager.ts # 状态管理器
├── stats/
│   └── ExecutionStatsCollector.ts # 统计收集器
└── input/
    └── UserInputHandler.ts      # 用户输入处理器
```

这种架构使得代码更加模块化、可维护和可扩展，同时保持了向后兼容性。
