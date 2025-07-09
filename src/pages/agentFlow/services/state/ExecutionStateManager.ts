import { DebugExecutionState, DebugNodeResult } from '../types';

/**
 * 执行状态管理器
 * 负责管理工作流的执行状态和状态变化通知
 */
export class ExecutionStateManager {
  private debugState: DebugExecutionState = {
    status: 'idle',
    completedNodes: [],
    totalNodes: 0
  };
  
  private listeners: ((state: DebugExecutionState) => void)[] = [];

  /**
   * 获取当前调试状态
   */
  getDebugState(): DebugExecutionState {
    return { ...this.debugState };
  }

  /**
   * 更新调试状态
   * @param updates 状态更新数据
   */
  updateDebugState(updates: Partial<DebugExecutionState>): void {
    this.debugState = { ...this.debugState, ...updates };
    this.notifyStateChange();
  }

  /**
   * 重置状态
   */
  resetState(): void {
    this.debugState = {
      status: 'idle',
      completedNodes: [],
      totalNodes: 0
    };
    this.notifyStateChange();
  }

  /**
   * 更新节点执行结果
   * @param nodeId 节点ID
   * @param result 执行结果
   */
  updateNodeResult(nodeId: string, result: DebugNodeResult): void {
    this.updateDebugState({
      results: {
        ...this.debugState.results,
        [nodeId]: result
      }
    });
  }

  /**
   * 设置执行状态为运行中
   * @param totalNodes 总节点数
   */
  setRunningState(totalNodes: number): void {
    this.updateDebugState({
      status: 'running',
      startTime: Date.now(),
      totalNodes,
      completedNodes: [],
      error: undefined,
      results: {}
    });
  }

  /**
   * 设置执行状态为完成
   */
  setCompletedState(): void {
    this.updateDebugState({
      status: 'completed',
      endTime: Date.now(),
      currentNode: undefined
    });
  }

  /**
   * 设置执行状态为失败
   * @param error 错误信息
   */
  setFailedState(error: string): void {
    this.updateDebugState({
      status: 'failed',
      error,
      endTime: Date.now(),
      currentNode: undefined
    });
  }

  /**
   * 设置执行状态为停止
   */
  setStoppedState(): void {
    this.updateDebugState({
      status: 'stopped',
      endTime: Date.now(),
      currentNode: undefined
    });
  }

  /**
   * 设置执行状态为等待用户输入
   * @param request 用户输入请求
   */
  setWaitingInputState(request: any): void {
    this.updateDebugState({
      status: 'waiting_input',
      currentUserInputRequest: request
    });
  }

  /**
   * 更新当前执行节点
   * @param nodeId 节点ID
   */
  setCurrentNode(nodeId: string): void {
    this.updateDebugState({
      currentNode: nodeId
    });
  }

  /**
   * 添加已完成节点
   * @param nodeId 节点ID
   */
  addCompletedNode(nodeId: string): void {
    const completedNodes = [...this.debugState.completedNodes];
    if (!completedNodes.includes(nodeId)) {
      completedNodes.push(nodeId);
      this.updateDebugState({ completedNodes });
    }
  }

  /**
   * 监听执行状态变化
   * @param callback 回调函数
   */
  onExecutionStateChange(callback: (state: DebugExecutionState) => void): void {
    this.listeners.push(callback);
  }

  /**
   * 移除执行状态监听器
   * @param callback 回调函数
   */
  removeExecutionStateChangeListener(callback: (state: DebugExecutionState) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    const state = this.getDebugState();
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in state change listener:', error);
      }
    });
  }

  /**
   * 清理所有监听器
   */
  dispose(): void {
    this.listeners.length = 0;
  }
}

export default ExecutionStateManager;
