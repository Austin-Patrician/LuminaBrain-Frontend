import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Button, Tabs, Badge, Progress, Card, Divider } from "antd";
import {
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  BugOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import { Node, Edge } from "@xyflow/react";

import WorkflowExecutor, {
  DebugExecutionState,
} from "../../services/workflowExecutor";
import UserInputModal from "../UserInputModal";
import { UserInputRequest, UserInputResponse } from "@/types/executionPlan";

// 导入子组件
import DebugOverview from "./DebugOverview";
import DebugExecutionLogs from "./DebugExecutionLogs";
import DebugResults from "./DebugResults";
import DebugStatistics from "./DebugStatistics";

// 导入样式
import "./EnhancedDebugPanel.css";

interface EnhancedDebugPanelProps {
  visible: boolean;
  onClose: () => void;
  executor: WorkflowExecutor;
  nodes: Node[];
  edges: Edge[];
  onExecutionStateChange?: (state: DebugExecutionState) => void;
}

const EnhancedDebugPanel: React.FC<EnhancedDebugPanelProps> = ({
  visible,
  onClose,
  executor,
  nodes,
  edges,
  onExecutionStateChange,
}) => {
  const [debugState, setDebugState] = useState<DebugExecutionState>(
    executor.getDebugState()
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 用户输入模态框状态
  const [userInputModalVisible, setUserInputModalVisible] = useState(false);
  const [currentUserInputRequest, setCurrentUserInputRequest] =
    useState<UserInputRequest | null>(null);

  // 监听执行状态变化
  useEffect(() => {
    const handleStateChange = (newState: DebugExecutionState) => {
      setDebugState(newState);

      // 处理用户输入请求
      if (
        newState.status === "waiting_input" &&
        newState.currentUserInputRequest
      ) {
        setCurrentUserInputRequest(newState.currentUserInputRequest);
        setUserInputModalVisible(true);
      } else if (newState.status !== "waiting_input") {
        setUserInputModalVisible(false);
        setCurrentUserInputRequest(null);
      }

      // 通知主页面状态变化
      if (onExecutionStateChange) {
        onExecutionStateChange(newState);
      }

      // 自动切换到执行日志标签页当开始执行时
      if (newState.status === "running" && activeTab === "overview") {
        setActiveTab("logs");
      }
    };

    executor.onExecutionStateChange(handleStateChange);

    return () => {
      executor.removeExecutionStateChangeListener(handleStateChange);
    };
  }, [activeTab, executor, onExecutionStateChange]);

  // 验证工作流完整性
  const validateWorkflow = (nodes: Node[], edges: Edge[]): boolean => {
    const errors: string[] = [];

    // 基础检查：必须有节点
    if (!nodes || nodes.length === 0) {
      Modal.error({
        title: "工作流验证失败",
        content: "工作流中没有任何节点，请添加节点后再开始调试。",
      });
      return false;
    }

    // 检查开始节点
    const startNodes = nodes.filter((node) => node.type === "startNode");
    if (startNodes.length === 0) {
      errors.push("工作流中必须有一个开始节点");
    } else if (startNodes.length > 1) {
      errors.push("工作流中只能有一个开始节点");
    }

    // 检查结束节点
    const endNodes = nodes.filter(
      (node) => node.type === "endNode" || node.type === "responseNode"
    );
    if (endNodes.length === 0) {
      errors.push("工作流中必须至少有一个结束节点（结束节点或响应节点）");
    }

    // 如果有错误，显示详细信息
    if (errors.length > 0) {
      Modal.error({
        title: "工作流验证失败",
        width: 600,
        content: (
          <div className="space-y-4">
            <div className="text-red-600 font-medium">
              发现 {errors.length} 个问题需要修复：
            </div>
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span className="text-sm">{error}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="text-blue-800 font-medium mb-2">
                💡 修复建议：
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 确保工作流有且仅有一个开始节点</li>
                <li>• 至少添加一个结束节点或响应节点</li>
                <li>• 确保所有节点都在完整的执行路径上</li>
              </ul>
            </div>
          </div>
        ),
      });
      return false;
    }

    return true;
  };

  // 执行控制函数
  const handleStartDebug = async () => {
    if (nodes.length === 0) {
      Modal.warning({
        title: "无法开始调试",
        content: "请先添加一些节点到工作流中",
      });
      return;
    }

    if (!validateWorkflow(nodes, edges)) {
      return;
    }

    await executor.startDebugExecution(nodes, edges);
  };

  const handleStopExecution = async () => {
    await executor.stopExecution();
  };

  const handleReset = () => {
    executor.resetState();
    setActiveTab("overview");
  };

  // 处理用户输入
  const handleUserInputSubmit = async (response: UserInputResponse) => {
    try {
      await executor.submitUserInput(response);
      setUserInputModalVisible(false);
      setCurrentUserInputRequest(null);
    } catch (error) {
      console.error("Failed to submit user input:", error);
      Modal.error({
        title: "提交失败",
        content: "用户输入提交失败，请重试",
      });
    }
  };

  const handleUserInputCancel = () => {
    setUserInputModalVisible(false);
    setCurrentUserInputRequest(null);
    handleStopExecution();
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 获取状态显示信息
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "running":
        return {
          icon: <LoadingOutlined className="text-blue-600" spin />,
          color: "processing" as const,
          text: "执行中",
          bgColor: "bg-blue-500",
        };
      case "completed":
        return {
          icon: <CheckCircleOutlined className="text-green-600" />,
          color: "success" as const,
          text: "已完成",
          bgColor: "bg-green-500",
        };
      case "failed":
        return {
          icon: <CloseCircleOutlined className="text-red-600" />,
          color: "error" as const,
          text: "失败",
          bgColor: "bg-red-500",
        };
      case "stopped":
        return {
          icon: <StopOutlined className="text-gray-600" />,
          color: "default" as const,
          text: "已停止",
          bgColor: "bg-gray-500",
        };
      case "waiting_input":
        return {
          icon: <UserOutlined className="text-yellow-600" />,
          color: "warning" as const,
          text: "等待输入",
          bgColor: "bg-yellow-500",
        };
      default:
        return {
          icon: <ClockCircleOutlined className="text-gray-600" />,
          color: "default" as const,
          text: "空闲",
          bgColor: "bg-gray-400",
        };
    }
  };

  // 计算执行统计
  const executionStats = useMemo(() => {
    const completedCount = debugState.completedNodes.length;
    const totalCount = debugState.totalNodes;
    const progressPercentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const totalDuration =
      debugState.startTime && debugState.endTime
        ? debugState.endTime - debugState.startTime
        : debugState.startTime
        ? Date.now() - debugState.startTime
        : undefined;

    const averageNodeDuration =
      completedCount > 0 && debugState.results
        ? Object.values(debugState.results).reduce(
            (sum, result) => sum + result.duration,
            0
          ) / completedCount
        : undefined;

    return {
      completedCount,
      totalCount,
      progressPercentage,
      totalDuration,
      averageNodeDuration,
    };
  }, [debugState]);

  const statusDisplay = getStatusDisplay(debugState.status);

  if (!visible) return null;

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${statusDisplay.bgColor}`}
              />
              <BugOutlined className="text-lg text-blue-600" />
              <span className="font-semibold text-lg">智能调试面板</span>
              <Badge status={statusDisplay.color} text={statusDisplay.text} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="text"
                size="small"
                icon={
                  isFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
                onClick={toggleFullscreen}
                className="text-gray-500 hover:text-gray-700"
              />
            </div>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={isFullscreen ? "95vw" : 1200}
        style={{ top: isFullscreen ? 20 : 50 }}
        bodyStyle={{
          height: isFullscreen ? "85vh" : "75vh",
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        }}
        destroyOnClose={false}
        maskClosable={false}
        className="enhanced-debug-panel"
        centered={!isFullscreen}
      >
        <div className="h-full flex flex-col bg-gray-50">
          {/* 快速控制栏 */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              {/* 执行进度指示器 */}
              {debugState.totalNodes > 0 && (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    进度: {executionStats.completedCount}/
                    {executionStats.totalCount}
                  </div>
                  <Progress
                    percent={executionStats.progressPercentage}
                    size="small"
                    style={{ width: 120 }}
                    status={
                      debugState.status === "failed"
                        ? "exception"
                        : debugState.status === "completed"
                        ? "success"
                        : "active"
                    }
                  />
                </div>
              )}

              {/* 执行时间 */}
              {executionStats.totalDuration && (
                <div className="text-sm text-gray-600">
                  耗时: {Math.round(executionStats.totalDuration)}ms
                </div>
              )}
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={handleStartDebug}
                disabled={debugState.status === "running"}
                size="small"
                icon={<PlayCircleOutlined />}
              >
                开始调试
              </Button>
              <Button
                onClick={handleStopExecution}
                disabled={
                  debugState.status !== "running" &&
                  debugState.status !== "waiting_input"
                }
                danger
                size="small"
                icon={<StopOutlined />}
              >
                停止
              </Button>
              <Button
                onClick={handleReset}
                disabled={debugState.status === "running"}
                type="dashed"
                size="small"
                icon={<ReloadOutlined />}
              >
                重置
              </Button>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="h-full debug-panel-tabs"
              style={{ height: "100%" }}
              tabBarStyle={{
                margin: 0,
                paddingLeft: 16,
                paddingRight: 16,
                backgroundColor: "white",
                borderBottom: "1px solid #f0f0f0",
              }}
              size="small"
              items={[
                {
                  key: "overview",
                  label: (
                    <span className="flex items-center gap-2">
                      <BugOutlined />
                      概览
                    </span>
                  ),
                  children: (
                    <DebugOverview
                      debugState={debugState}
                      executionStats={executionStats}
                      statusDisplay={statusDisplay}
                      onStartDebug={handleStartDebug}
                      onStopExecution={handleStopExecution}
                      onReset={handleReset}
                    />
                  ),
                },
                {
                  key: "logs",
                  label: (
                    <span className="flex items-center gap-2">
                      <ClockCircleOutlined />
                      执行日志
                      {debugState.completedNodes.length > 0 && (
                        <Badge
                          count={debugState.completedNodes.length}
                          size="small"
                        />
                      )}
                    </span>
                  ),
                  children: (
                    <DebugExecutionLogs
                      debugState={debugState}
                      getStatusDisplay={getStatusDisplay}
                    />
                  ),
                },
                {
                  key: "results",
                  label: (
                    <span className="flex items-center gap-2">
                      <CheckCircleOutlined />
                      结果
                    </span>
                  ),
                  children: (
                    <DebugResults
                      debugState={debugState}
                      executionStats={executionStats}
                      getStatusDisplay={getStatusDisplay}
                    />
                  ),
                },
                {
                  key: "statistics",
                  label: (
                    <span className="flex items-center gap-2">
                      <BarChartOutlined />
                      统计分析
                    </span>
                  ),
                  children: (
                    <DebugStatistics
                      executor={executor}
                      debugState={debugState}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Modal>

      {/* 用户输入模态框 */}
      <UserInputModal
        visible={userInputModalVisible}
        request={currentUserInputRequest}
        onSubmit={handleUserInputSubmit}
        onCancel={handleUserInputCancel}
      />
    </>
  );
};

export default EnhancedDebugPanel;
