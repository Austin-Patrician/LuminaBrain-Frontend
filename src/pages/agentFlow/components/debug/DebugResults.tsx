import React from "react";
import { Badge, Collapse, Card, Row, Col, Statistic } from "antd";
import {
  RobotOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { DebugExecutionState } from "../../services/workflowExecutor";
import OptimizedDebugInputDisplay from "../OptimizedDebugInputDisplay";
import Scrollbar from "@/components/scrollbar";

interface DebugResultsProps {
  debugState: DebugExecutionState;
  executionStats: {
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    totalDuration?: number;
    averageNodeDuration?: number;
  };
  getStatusDisplay: (status: string) => {
    icon: React.ReactNode;
    color: string;
    text: string;
    bgColor: string;
  };
}

const DebugResults: React.FC<DebugResultsProps> = ({
  debugState,
  executionStats,
  getStatusDisplay,
}) => {
  // 获取最后一个完成的节点结果
  const lastCompletedNodeId =
    debugState.completedNodes[debugState.completedNodes.length - 1];
  const lastResult = lastCompletedNodeId
    ? debugState.results?.[lastCompletedNodeId]
    : null;

  if (!lastResult) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center py-12">
          <RobotOutlined className="text-6xl mb-4 opacity-50 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            暂无执行结果
          </h3>
          <p className="text-gray-500 mb-6">
            执行工作流后，这里将显示最后一个节点的执行结果
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <div className="text-blue-800 font-medium mb-2">💡 提示：</div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 执行结果将在这里展示</li>
              <li>• 可以查看最终输出和中间过程</li>
              <li>• 支持多种格式的结果显示</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const lastStatusDisplay = getStatusDisplay(lastResult.status);

  return (
    <div className="h-full bg-white">
      <Scrollbar style={{ height: "100%", width: "100%" }}>
        <div className="p-6 space-y-6">
          {/* 页面标题 */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-800">
              最终执行结果
            </h4>
            <Badge
              color="blue"
              text={lastResult.nodeType}
              className="text-sm"
            />
          </div>

          {/* 执行统计卡片 */}
          <Card title="执行统计" size="small" className="shadow-sm">
            <Row gutter={24}>
              <Col span={6}>
                <Statistic
                  title="已完成节点"
                  value={debugState.completedNodes.length}
                  valueStyle={{ color: "#52c41a" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="总执行时间"
                  value={
                    executionStats.totalDuration
                      ? Math.round(executionStats.totalDuration)
                      : 0
                  }
                  suffix="ms"
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均耗时"
                  value={
                    executionStats.averageNodeDuration
                      ? Math.round(executionStats.averageNodeDuration)
                      : 0
                  }
                  suffix="ms"
                  valueStyle={{ color: "#722ed1" }}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="成功率"
                  value={executionStats.progressPercentage}
                  suffix="%"
                  valueStyle={{ color: "#f5222d" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>

          {/* 最后节点基本信息 */}
          <Card title="节点基本信息" size="small" className="shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm font-medium">
                    节点ID:
                  </span>
                  <div className="font-mono text-sm mt-1 p-3 bg-gray-50 rounded break-all">
                    {lastResult.nodeId}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm font-medium">
                    节点类型:
                  </span>
                  <div className="font-medium text-base mt-1">
                    {lastResult.nodeType}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 text-sm font-medium">
                    执行状态:
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {lastStatusDisplay.icon}
                    <span className="font-medium text-base">
                      {lastStatusDisplay.text}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm font-medium">
                    执行时间:
                  </span>
                  <div className="font-medium text-base mt-1">
                    {lastResult.duration}ms
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 最终输出结果 - 重点展示 */}
          {lastResult.markdownOutput && (
            <Card title="🎯 最终输出结果" size="small" className="shadow-sm">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-6 bg-white prose prose-base max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: lastResult.markdownOutput,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {lastResult.output && !lastResult.markdownOutput && (
            <Card title="🎯 最终输出数据" size="small" className="shadow-sm">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  <pre className="p-6 bg-gray-50 text-sm font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(lastResult.output, null, 2)}
                  </pre>
                </div>
              </div>
            </Card>
          )}

          {/* 输入数据 - 使用折叠面板 */}
          {lastResult.input && (
            <Collapse size="small" ghost>
              <Collapse.Panel
                header={
                  <span className="text-base font-medium">🔍 查看输入数据</span>
                }
                key="input"
              >
                <Card size="small" className="mt-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <OptimizedDebugInputDisplay input={lastResult.input} />
                  </div>
                </Card>
              </Collapse.Panel>
            </Collapse>
          )}

          {/* 错误信息 */}
          {lastResult.error && (
            <Card
              title="❌ 错误信息"
              size="small"
              className="shadow-sm border-red-200"
            >
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 bg-red-50 text-sm text-red-700 whitespace-pre-wrap break-words">
                    {lastResult.error}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 时间线信息 */}
          <Card title="⏱️ 执行时间线" size="small" className="shadow-sm">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 font-semibold text-lg">
                  {debugState.startTime
                    ? new Date(debugState.startTime).toLocaleTimeString()
                    : "--"}
                </div>
                <div className="text-blue-500 text-sm mt-1">开始时间</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 font-semibold text-lg">
                  {executionStats.totalDuration
                    ? Math.round(executionStats.totalDuration)
                    : 0}
                  ms
                </div>
                <div className="text-green-500 text-sm mt-1">总执行时间</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-600 font-semibold text-lg">
                  {debugState.endTime
                    ? new Date(debugState.endTime).toLocaleTimeString()
                    : "执行中..."}
                </div>
                <div className="text-purple-500 text-sm mt-1">结束时间</div>
              </div>
            </div>
          </Card>

          {/* 节点执行摘要 */}
          <Card title="📊 节点执行摘要" size="small" className="shadow-sm">
            <div className="space-y-3">
              {debugState.completedNodes.slice(-5).map((nodeId) => {
                const result = debugState.results?.[nodeId];
                if (!result) return null;

                const statusDisplay = getStatusDisplay(result.status);

                return (
                  <div
                    key={nodeId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {statusDisplay.icon}
                      <span className="font-medium text-sm truncate max-w-48">
                        {nodeId}
                      </span>
                      <Badge color="blue" text={result.nodeType} size="small" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{result.duration}ms</span>
                      {result.status === "completed" && (
                        <Badge color="green" text="✓" size="small" />
                      )}
                      {result.status === "failed" && (
                        <Badge color="red" text="✗" size="small" />
                      )}
                    </div>
                  </div>
                );
              })}
              {debugState.completedNodes.length > 5 && (
                <div className="text-center text-gray-500 text-sm py-2">
                  ... 显示最近 5 个节点
                </div>
              )}
            </div>
          </Card>

          {/* 成功完成提示 */}
          {debugState.status === "completed" && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleOutlined className="text-green-600 text-2xl" />
                <div className="text-left">
                  <div className="font-semibold text-green-800">
                    🎉 工作流执行完成！
                  </div>
                  <div className="text-sm text-green-600">
                    所有节点已成功执行，可以查看上述结果详情
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Scrollbar>
    </div>
  );
};

export default DebugResults;
