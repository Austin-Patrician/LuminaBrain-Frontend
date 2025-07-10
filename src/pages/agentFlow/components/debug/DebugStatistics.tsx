import React from "react";
import { Card, Row, Col, Statistic, Table, Progress } from "antd";
import {
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { DebugExecutionState } from "../../services/workflowExecutor";
import WorkflowExecutor from "../../services/workflowExecutor";
import Scrollbar from "@/components/scrollbar";

interface DebugStatisticsProps {
  executor: WorkflowExecutor;
  debugState: DebugExecutionState;
}

const DebugStatistics: React.FC<DebugStatisticsProps> = ({
  executor,
  debugState,
}) => {
  // 获取执行统计信息
  const executionStats = executor.getExecutionStats();
  const nodePerformanceStats = executor.getNodePerformanceStats();
  const executionHistory = executor.getExecutionHistory();

  // 计算额外的统计数据
  const enhancedExecutionStats = React.useMemo(() => {
    const successRate =
      executionStats.totalExecutions > 0
        ? (executionStats.successfulExecutions /
            executionStats.totalExecutions) *
          100
        : 0;

    const totalNodes = debugState.totalNodes || 0;

    return {
      ...executionStats,
      successRate,
      totalNodes,
    };
  }, [executionStats, debugState.totalNodes]);

  // 增强节点性能统计数据
  const enhancedNodePerformanceStats = React.useMemo(() => {
    return nodePerformanceStats.map((stat) => ({
      ...stat,
      averageDuration: stat.averageExecutionTime,
      minDuration: stat.minExecutionTime,
      maxDuration: stat.maxExecutionTime,
      successRate:
        stat.executionCount > 0
          ? (stat.successCount / stat.executionCount) * 100
          : 0,
    }));
  }, [nodePerformanceStats]);

  // 计算节点类型统计
  const nodeTypeStats = React.useMemo(() => {
    const stats: Record<string, number> = {};
    if (debugState.results) {
      Object.values(debugState.results).forEach((result) => {
        stats[result.nodeType] = (stats[result.nodeType] || 0) + 1;
      });
    }
    return Object.entries(stats).map(([type, count]) => ({
      type,
      count,
      percentage:
        debugState.totalNodes > 0 ? (count / debugState.totalNodes) * 100 : 0,
    }));
  }, [debugState.results, debugState.totalNodes]);

  // 性能统计表格列定义
  const performanceColumns = [
    {
      title: "节点类型",
      dataIndex: "nodeType",
      key: "nodeType",
      width: 120,
    },
    {
      title: "执行次数",
      dataIndex: "executionCount",
      key: "executionCount",
      width: 100,
      sorter: (a: any, b: any) => a.executionCount - b.executionCount,
    },
    {
      title: "平均耗时",
      dataIndex: "averageDuration",
      key: "averageDuration",
      width: 100,
      render: (value: number) => `${Math.round(value)}ms`,
      sorter: (a: any, b: any) => a.averageDuration - b.averageDuration,
    },
    {
      title: "最快执行",
      dataIndex: "minDuration",
      key: "minDuration",
      width: 100,
      render: (value: number) => `${Math.round(value)}ms`,
    },
    {
      title: "最慢执行",
      dataIndex: "maxDuration",
      key: "maxDuration",
      width: 100,
      render: (value: number) => `${Math.round(value)}ms`,
    },
    {
      title: "成功率",
      dataIndex: "successRate",
      key: "successRate",
      width: 100,
      render: (value: number) => (
        <span
          className={
            value >= 95
              ? "text-green-600"
              : value >= 80
              ? "text-yellow-600"
              : "text-red-600"
          }
        >
          {Math.round(value)}%
        </span>
      ),
      sorter: (a: any, b: any) => a.successRate - b.successRate,
    },
  ];

  // 历史记录表格列定义
  const historyColumns = [
    {
      title: "执行ID",
      dataIndex: "id",
      key: "id",
      width: 120,
      render: (value: string) => (
        <span className="font-mono text-xs">{value.slice(0, 8)}...</span>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "startTime",
      key: "startTime",
      width: 120,
      render: (value: number) => new Date(value).toLocaleTimeString(),
    },
    {
      title: "执行时长",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: (value: number) => (value ? `${Math.round(value)}ms` : "进行中"),
    },
    {
      title: "节点数量",
      dataIndex: "nodeCount",
      key: "nodeCount",
      width: 100,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: string) => {
        const statusConfig = {
          completed: { color: "text-green-600", text: "完成" },
          failed: { color: "text-red-600", text: "失败" },
          running: { color: "text-blue-600", text: "运行中" },
          stopped: { color: "text-gray-600", text: "已停止" },
        };
        const config = statusConfig[value as keyof typeof statusConfig] || {
          color: "text-gray-600",
          text: value,
        };
        return <span className={config.color}>{config.text}</span>;
      },
    },
  ];

  if (debugState.status === "idle" && executionStats.totalExecutions === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center py-12">
          <BarChartOutlined className="text-6xl mb-4 opacity-50 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            暂无统计数据
          </h3>
          <p className="text-gray-500 mb-6">
            执行工作流后，这里将显示详细的性能统计和分析数据
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="text-blue-800 font-medium mb-2">📊 统计内容：</div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 节点执行性能分析</li>
              <li>• 执行历史记录</li>
              <li>• 成功率和错误统计</li>
              <li>• 性能优化建议</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <Scrollbar style={{ height: "100%", width: "100%" }}>
        <div className="p-6 space-y-6">
          {/* 总体统计 */}
          <Card title="📊 总体统计" size="small" className="shadow-sm">
            <Row gutter={24}>
              <Col span={6}>
                <Statistic
                  title="总执行次数"
                  value={executionStats.totalExecutions}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均执行时长"
                  value={Math.round(executionStats.averageExecutionTime)}
                  suffix="ms"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功执行率"
                  value={Math.round(enhancedExecutionStats.successRate)}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{
                    color:
                      enhancedExecutionStats.successRate >= 95
                        ? "#52c41a"
                        : enhancedExecutionStats.successRate >= 80
                        ? "#faad14"
                        : "#f5222d",
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总节点数"
                  value={enhancedExecutionStats.totalNodes}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
          </Card>

          {/* 当前执行状态 */}
          {debugState.status !== "idle" && (
            <Card title="🚀 当前执行状态" size="small" className="shadow-sm">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">执行进度</span>
                        <span className="text-sm text-gray-600">
                          {debugState.completedNodes.length} /{" "}
                          {debugState.totalNodes}
                        </span>
                      </div>
                      <Progress
                        percent={
                          debugState.totalNodes > 0
                            ? Math.round(
                                (debugState.completedNodes.length /
                                  debugState.totalNodes) *
                                  100
                              )
                            : 0
                        }
                        status={
                          debugState.status === "failed"
                            ? "exception"
                            : debugState.status === "completed"
                            ? "success"
                            : "active"
                        }
                      />
                    </div>
                    {debugState.currentNode && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <strong>当前节点:</strong> {debugState.currentNode}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-green-600 font-semibold text-lg">
                        {debugState.completedNodes.length}
                      </div>
                      <div className="text-green-500 text-sm">已完成</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-blue-600 font-semibold text-lg">
                        {debugState.totalNodes -
                          debugState.completedNodes.length}
                      </div>
                      <div className="text-blue-500 text-sm">待执行</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )}

          {/* 节点类型分布 */}
          {nodeTypeStats.length > 0 && (
            <Card title="🔧 节点类型分布" size="small" className="shadow-sm">
              <div className="space-y-3">
                {nodeTypeStats.map((stat) => (
                  <div
                    key={stat.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{stat.type}</span>
                      <span className="text-sm text-gray-500">
                        ({stat.count} 个)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        percent={stat.percentage}
                        size="small"
                        style={{ width: 100 }}
                        showInfo={false}
                      />
                      <span className="text-sm text-gray-600 min-w-[40px]">
                        {Math.round(stat.percentage)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 性能分析表格 */}
          {enhancedNodePerformanceStats.length > 0 && (
            <Card title="⚡ 节点性能分析" size="small" className="shadow-sm">
              <Table
                columns={performanceColumns}
                dataSource={enhancedNodePerformanceStats}
                rowKey="nodeType"
                size="small"
                pagination={false}
                scroll={{ x: 600 }}
              />
            </Card>
          )}

          {/* 执行历史 */}
          {executionHistory.length > 0 && (
            <Card title="📋 执行历史" size="small" className="shadow-sm">
              <Table
                columns={historyColumns}
                dataSource={executionHistory.slice(-10)} // 只显示最近10条
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ x: 600 }}
              />
              {executionHistory.length > 10 && (
                <div className="text-center text-gray-500 text-sm mt-3">
                  显示最近 10 条记录，共 {executionHistory.length} 条
                </div>
              )}
            </Card>
          )}

          {/* 性能建议 */}
          {enhancedNodePerformanceStats.length > 0 && (
            <Card
              title="💡 性能优化建议"
              size="small"
              className="shadow-sm border-yellow-200"
            >
              <div className="space-y-3">
                {/* 检查慢节点 */}
                {(() => {
                  const slowNodes = enhancedNodePerformanceStats.filter(
                    (node) => node.averageDuration > 5000
                  );
                  return slowNodes.length > 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationCircleOutlined className="text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          性能优化建议
                        </span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {slowNodes.map((node) => (
                          <li key={node.nodeType}>
                            • {node.nodeType} 节点平均耗时{" "}
                            {Math.round(node.averageDuration)}ms，建议优化
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}

                {/* 检查低成功率节点 */}
                {(() => {
                  const unreliableNodes = enhancedNodePerformanceStats.filter(
                    (node) => node.successRate < 90
                  );
                  return unreliableNodes.length > 0 ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationCircleOutlined className="text-red-600" />
                        <span className="font-medium text-red-800">
                          可靠性建议
                        </span>
                      </div>
                      <ul className="text-sm text-red-700 space-y-1">
                        {unreliableNodes.map((node) => (
                          <li key={node.nodeType}>
                            • {node.nodeType} 节点成功率仅{" "}
                            {Math.round(node.successRate)}%，需要检查配置
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                })()}

                {/* 最佳性能节点 */}
                {(() => {
                  const bestNode = enhancedNodePerformanceStats.reduce(
                    (best, current) =>
                      current.successRate > best.successRate ||
                      (current.successRate === best.successRate &&
                        current.averageDuration < best.averageDuration)
                        ? current
                        : best,
                    enhancedNodePerformanceStats[0]
                  );

                  return bestNode && bestNode.successRate >= 95 ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrophyOutlined className="text-green-600" />
                        <span className="font-medium text-green-800">
                          最佳性能节点
                        </span>
                      </div>
                      <div className="text-sm text-green-700">
                        🏆 {bestNode.nodeType} 节点表现最佳，成功率{" "}
                        {Math.round(bestNode.successRate)}%，平均耗时{" "}
                        {Math.round(bestNode.averageDuration)}ms
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </Card>
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

export default DebugStatistics;
