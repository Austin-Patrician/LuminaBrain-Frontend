import { Node, Edge } from '@xyflow/react';
import { ExecutionManager } from './ExecutionManager';
import { 
  DebugExecutionState, 
  DebugNodeResult,
  ExecutionStats,
  NodePerformanceStats,
  UserInputResponse
} from './types';

/**
 * WorkflowExecutor - 重构后的工作流执行器
 * 现在作为 ExecutionManager 的代理，保持向后兼容性
 */
class WorkflowExecutor {
  private executionManager: ExecutionManager;

  constructor() {
    this.executionManager = new ExecutionManager();
  }

  // ===== 状态管理相关方法 =====

  /**
   * 获取当前调试状态
   */
  getDebugState(): DebugExecutionState {
    return this.executionManager.getDebugState();
  }

  /**
   * 监听执行状态变化
   */
  onExecutionStateChange(callback: (state: DebugExecutionState) => void): void {
    this.executionManager.onExecutionStateChange(callback);
  }

  /**
   * 移除执行状态监听器
   */
  removeExecutionStateChangeListener(callback: (state: DebugExecutionState) => void): void {
    this.executionManager.removeExecutionStateChangeListener(callback);
  }

  // ===== 统计数据相关方法 =====

  /**
   * 获取执行统计信息
   */
  getExecutionStats(): ExecutionStats {
    return this.executionManager.getExecutionStats();
  }

  /**
   * 获取节点性能统计
   */
  getNodePerformanceStats(): NodePerformanceStats[] {
    return this.executionManager.getNodePerformanceStats();
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(): Array<{
    id: string;
    startTime: number;
    endTime?: number;
    status: string;
    nodeCount: number;
    duration?: number;
  }> {
    return this.executionManager.getExecutionHistory();
  }

  /**
   * 重置统计数据
   */
  resetStats(): void {
    this.executionManager.resetStats();
  }

  // ===== 执行控制相关方法 =====

  /**
   * 开始调试执行
   */
  async startDebugExecution(nodes: Node[], edges: Edge[]): Promise<void> {
    await this.executionManager.startDebugExecution(nodes, edges);
  }

  /**
   * 停止执行
   */
  async stopExecution(): Promise<void> {
    await this.executionManager.stopExecution();
  }

  /**
   * 重置状态
   */
  resetState(): void {
    this.executionManager.resetState();
  }

  /**
   * 提交用户输入
   */
  async submitUserInput(response: UserInputResponse): Promise<void> {
    await this.executionManager.submitUserInput(response);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.executionManager.dispose();
  }
}

// 导出单例实例以保持向后兼容性
export const workflowExecutor = new WorkflowExecutor();

// 导出类作为默认导出
export default WorkflowExecutor;

// 导出调试相关类型以保持兼容性
export type { DebugNodeResult, DebugExecutionState, ExecutionStats, NodePerformanceStats };
