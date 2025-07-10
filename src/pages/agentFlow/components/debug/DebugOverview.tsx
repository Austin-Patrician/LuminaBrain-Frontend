import React from "react";
import { Button, Card, Progress, Alert, Statistic, Row, Col } from "antd";
import {
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { DebugExecutionState } from "../../services/workflowExecutor";

interface DebugOverviewProps {
  debugState: DebugExecutionState;
  executionStats: {
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    totalDuration?: number;
    averageNodeDuration?: number;
  };
  statusDisplay: {
    icon: React.ReactNode;
    color: string;
    text: string;
    bgColor: string;
  };
  onStartDebug: () => void;
  onStopExecution: () => void;
  onReset: () => void;
}

const DebugOverview: React.FC<DebugOverviewProps> = ({
  debugState,
  executionStats,
  statusDisplay,
  onStartDebug,
  onStopExecution,
  onReset,
}) => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full bg-white">
      {/* 快速操作区域 */}
      <Card title="快速操作" size="small" className="shadow-sm">
        <div className="flex gap-3">
          <Button
            type="primary"
            onClick={onStartDebug}
            disabled={debugState.status === "running"}
            icon={<PlayCircleOutlined />}
            size="large"
            className="flex-1"
          >
            开始调试
          </Button>
          <Button
            onClick={onStopExecution}
            disabled={
              debugState.status !== "running" &&
              debugState.status !== "waiting_input"
            }
            danger
            icon={<StopOutlined />}
            size="large"
          >
            停止
          </Button>
          <Button
            onClick={onReset}
            disabled={debugState.status === "running"}
            type="dashed"
            icon={<ReloadOutlined />}
            size="large"
          >
            重置
          </Button>
        </div>
      </Card>

      {/* 执行状态概览 */}
      <Card title="执行状态" size="small" className="shadow-sm">
        <div className="space-y-4">
          {/* 当前状态 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full ${statusDisplay.bgColor}`}
              />
              <span className="font-medium text-lg">{statusDisplay.text}</span>
              {statusDisplay.icon}
            </div>
            {debugState.status === "running" && (
              <div className="text-sm text-gray-600">
                {debugState.currentNode && `当前: ${debugState.currentNode}`}
              </div>
            )}
          </div>

          {/* 执行进度 */}
          {debugState.totalNodes > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">执行进度</span>
                <span className="text-sm text-gray-600">
                  {executionStats.completedCount} / {executionStats.totalCount}
                </span>
              </div>
              <Progress
                percent={executionStats.progressPercentage}
                status={
                  debugState.status === "failed"
                    ? "exception"
                    : debugState.status === "completed"
                    ? "success"
                    : "active"
                }
                strokeWidth={8}
                showInfo={true}
              />
            </div>
          )}

          {/* 当前节点信息 */}
          {debugState.currentNode && (
            <Alert
              type="info"
              showIcon
              icon={<ThunderboltOutlined />}
              message="当前执行节点"
              description={
                <div className="mt-2">
                  <div className="text-sm">
                    <strong>节点ID:</strong> {debugState.currentNode}
                  </div>
                  {debugState.results?.[debugState.currentNode] && (
                    <div className="text-sm mt-1">
                      <strong>节点类型:</strong>{" "}
                      {debugState.results[debugState.currentNode].nodeType}
                    </div>
                  )}
                </div>
              }
            />
          )}

          {/* 等待用户输入提示 */}
          {debugState.status === "waiting_input" && (
            <Alert
              type="warning"
              showIcon
              icon={<UserOutlined />}
              message="等待用户输入"
              description="工作流正在等待用户输入，请在用户输入模态框中提供所需信息。"
            />
          )}

          {/* 错误信息 */}
          {debugState.error && (
            <Alert
              type="error"
              showIcon
              icon={<ExclamationCircleOutlined />}
              message="执行错误"
              description={
                <div className="whitespace-pre-wrap break-words text-sm">
                  {debugState.error}
                </div>
              }
            />
          )}
        </div>
      </Card>

      {/* 执行统计 */}
      {(debugState.startTime || executionStats.totalDuration) && (
        <Card title="执行统计" size="small" className="shadow-sm">
          <Row gutter={16}>
            <Col span={8}>
              <Statistic
                title="已完成节点"
                value={executionStats.completedCount}
                suffix={`/ ${executionStats.totalCount}`}
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="总耗时"
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
            <Col span={8}>
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
          </Row>
        </Card>
      )}

      {/* 成功完成提示 */}
      {debugState.status === "completed" && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="执行完成"
          description={
            <div className="space-y-2">
              <div>所有节点已成功执行完毕！</div>
              <div className="text-sm text-gray-600">
                总共执行了 {debugState.completedNodes.length} 个节点，耗时{" "}
                {executionStats.totalDuration
                  ? Math.round(executionStats.totalDuration)
                  : 0}{" "}
                毫秒
              </div>
              <div className="mt-3">
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    // 这里可以添加查看结果的逻辑
                  }}
                >
                  查看详细结果 →
                </Button>
              </div>
            </div>
          }
        />
      )}

      {/* 工作流提示 */}
      {debugState.status === "idle" && debugState.totalNodes === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            准备开始调试
          </h3>
          <p className="text-gray-500 mb-6">
            在画布中添加一些节点，然后点击"开始调试"按钮开始执行工作流
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="text-blue-800 font-medium mb-2">💡 调试提示：</div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 确保工作流有开始节点和结束节点</li>
              <li>• 检查所有节点是否正确连接</li>
              <li>• AI节点需要配置模型和提示词</li>
              <li>• 调试过程中可以随时停止执行</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugOverview;
