import { ExecutionStats, NodePerformanceStats } from '../types';

/**
 * 执行统计数据收集器
 * 负责收集和管理工作流执行的统计数据
 */
export class ExecutionStatsCollector {
  private executionStats: ExecutionStats = {
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    averageExecutionTime: 0,
    totalExecutionTime: 0,
    nodeExecutionCounts: {},
    nodeAverageExecutionTimes: {},
    peakMemoryUsage: 0,
    currentMemoryUsage: 0
  };
  
  private nodePerformanceStats: Map<string, NodePerformanceStats> = new Map();
  
  private executionHistory: Array<{
    id: string;
    startTime: number;
    endTime?: number;
    status: string;
    nodeCount: number;
    duration?: number;
  }> = [];

  /**
   * 获取执行统计信息
   */
  getExecutionStats(): ExecutionStats {
    return { ...this.executionStats };
  }

  /**
   * 获取节点性能统计
   */
  getNodePerformanceStats(): NodePerformanceStats[] {
    return Array.from(this.nodePerformanceStats.values());
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
    return [...this.executionHistory];
  }

  /**
   * 更新执行统计
   * @param success 是否成功
   * @param duration 执行时长
   * @param nodeCount 节点数量
   */
  updateExecutionStats(success: boolean, duration: number, nodeCount: number): void {
    this.executionStats.totalExecutions++;
    this.executionStats.totalExecutionTime += duration;
    this.executionStats.averageExecutionTime = 
      this.executionStats.totalExecutionTime / this.executionStats.totalExecutions;
    this.executionStats.lastExecutionTime = Date.now();

    if (success) {
      this.executionStats.successfulExecutions++;
    } else {
      this.executionStats.failedExecutions++;
    }

    // 更新内存使用情况（模拟）
    this.executionStats.currentMemoryUsage = this.getEstimatedMemoryUsage();
    if (this.executionStats.currentMemoryUsage > this.executionStats.peakMemoryUsage) {
      this.executionStats.peakMemoryUsage = this.executionStats.currentMemoryUsage;
    }

    // 添加到执行历史
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.executionHistory.unshift({
      id: executionId,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      status: success ? 'completed' : 'failed',
      nodeCount,
      duration
    });

    // 保持历史记录不超过50条
    if (this.executionHistory.length > 50) {
      this.executionHistory = this.executionHistory.slice(0, 50);
    }
  }

  /**
   * 更新节点性能统计
   * @param nodeId 节点ID
   * @param nodeType 节点类型
   * @param duration 执行时长
   * @param success 是否成功
   */
  updateNodePerformanceStats(nodeId: string, nodeType: string, duration: number, success: boolean): void {
    let stats = this.nodePerformanceStats.get(nodeId);
    
    if (!stats) {
      stats = {
        nodeId,
        nodeType,
        executionCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        minExecutionTime: Infinity,
        maxExecutionTime: 0,
        successCount: 0,
        failureCount: 0
      };
      this.nodePerformanceStats.set(nodeId, stats);
    }

    stats.executionCount++;
    stats.totalExecutionTime += duration;
    stats.averageExecutionTime = stats.totalExecutionTime / stats.executionCount;
    stats.minExecutionTime = Math.min(stats.minExecutionTime, duration);
    stats.maxExecutionTime = Math.max(stats.maxExecutionTime, duration);
    stats.lastExecutionTime = Date.now();

    if (success) {
      stats.successCount++;
    } else {
      stats.failureCount++;
    }

    // 更新全局节点统计
    this.executionStats.nodeExecutionCounts[nodeType] = 
      (this.executionStats.nodeExecutionCounts[nodeType] || 0) + 1;
    
    const totalTime = this.executionStats.nodeAverageExecutionTimes[nodeType] || 0;
    const count = this.executionStats.nodeExecutionCounts[nodeType];
    this.executionStats.nodeAverageExecutionTimes[nodeType] = 
      (totalTime * (count - 1) + duration) / count;
  }

  /**
   * 重置统计数据
   */
  resetStats(): void {
    this.executionStats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
      nodeExecutionCounts: {},
      nodeAverageExecutionTimes: {},
      peakMemoryUsage: 0,
      currentMemoryUsage: 0
    };
    this.nodePerformanceStats.clear();
    this.executionHistory.length = 0;
  }

  /**
   * 获取特定节点类型的统计信息
   * @param nodeType 节点类型
   */
  getNodeTypeStats(nodeType: string): {
    executionCount: number;
    averageExecutionTime: number;
    totalExecutionTime: number;
  } {
    const count = this.executionStats.nodeExecutionCounts[nodeType] || 0;
    const avgTime = this.executionStats.nodeAverageExecutionTimes[nodeType] || 0;
    
    return {
      executionCount: count,
      averageExecutionTime: avgTime,
      totalExecutionTime: avgTime * count
    };
  }

  /**
   * 获取成功率
   */
  getSuccessRate(): number {
    if (this.executionStats.totalExecutions === 0) {
      return 0;
    }
    return (this.executionStats.successfulExecutions / this.executionStats.totalExecutions) * 100;
  }

  /**
   * 获取性能最好的节点类型
   */
  getBestPerformingNodeType(): string | null {
    const nodeTypes = Object.keys(this.executionStats.nodeAverageExecutionTimes);
    if (nodeTypes.length === 0) {
      return null;
    }
    
    return nodeTypes.reduce((best, current) => {
      const bestTime = this.executionStats.nodeAverageExecutionTimes[best];
      const currentTime = this.executionStats.nodeAverageExecutionTimes[current];
      return currentTime < bestTime ? current : best;
    });
  }

  /**
   * 获取性能最差的节点类型
   */
  getWorstPerformingNodeType(): string | null {
    const nodeTypes = Object.keys(this.executionStats.nodeAverageExecutionTimes);
    if (nodeTypes.length === 0) {
      return null;
    }
    
    return nodeTypes.reduce((worst, current) => {
      const worstTime = this.executionStats.nodeAverageExecutionTimes[worst];
      const currentTime = this.executionStats.nodeAverageExecutionTimes[current];
      return currentTime > worstTime ? current : worst;
    });
  }

  /**
   * 估算内存使用情况
   */
  private getEstimatedMemoryUsage(): number {
    // 浏览器环境下的内存估算
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    // 模拟值
    return Math.random() * 100;
  }

  /**
   * 导出统计数据（用于分析或报告）
   */
  exportStats(): {
    executionStats: ExecutionStats;
    nodePerformanceStats: NodePerformanceStats[];
    executionHistory: typeof this.executionHistory;
    summary: {
      successRate: number;
      bestPerformingNodeType: string | null;
      worstPerformingNodeType: string | null;
    };
  } {
    return {
      executionStats: this.getExecutionStats(),
      nodePerformanceStats: this.getNodePerformanceStats(),
      executionHistory: this.getExecutionHistory(),
      summary: {
        successRate: this.getSuccessRate(),
        bestPerformingNodeType: this.getBestPerformingNodeType(),
        worstPerformingNodeType: this.getWorstPerformingNodeType()
      }
    };
  }
}

export default ExecutionStatsCollector;
