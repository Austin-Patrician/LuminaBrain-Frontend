import React, { useState, useRef, useEffect } from "react";
import { Badge, Button, Timeline, Collapse } from "antd";
import { UpOutlined, DownOutlined, LoadingOutlined } from "@ant-design/icons";
import { DebugExecutionState } from "../../services/workflowExecutor";
import OptimizedDebugInputDisplay from "../OptimizedDebugInputDisplay";
import Scrollbar from "@/components/scrollbar";

interface DebugExecutionLogsProps {
  debugState: DebugExecutionState;
  getStatusDisplay: (status: string) => {
    icon: React.ReactNode;
    color: string;
    text: string;
    bgColor: string;
  };
}

const DebugExecutionLogs: React.FC<DebugExecutionLogsProps> = ({
  debugState,
  getStatusDisplay,
}) => {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set()
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [debugState.completedNodes]);

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpandedNodeIds = new Set(expandedNodeIds);
    if (newExpandedNodeIds.has(nodeId)) {
      newExpandedNodeIds.delete(nodeId);
    } else {
      newExpandedNodeIds.add(nodeId);
    }
    setExpandedNodeIds(newExpandedNodeIds);
  };

  if (debugState.status === "idle") {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            暂无执行日志
          </h3>
          <p className="text-gray-500">
            开始执行工作流后，这里将显示详细的执行日志
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-hidden">
        <Scrollbar
          style={{ height: "100%", width: "100%" }}
          ref={scrollAreaRef}
        >
          <div className="p-4">
            <Timeline className="custom-timeline">
              {debugState.completedNodes.map((nodeId) => {
                const result = debugState.results?.[nodeId];
                if (!result) return null;

                const nodeStatusDisplay = getStatusDisplay(result.status);
                const isExpanded = expandedNodeIds.has(nodeId);

                return (
                  <Timeline.Item
                    key={nodeId}
                    dot={nodeStatusDisplay.icon}
                    color={
                      result.status === "completed"
                        ? "green"
                        : result.status === "failed"
                        ? "red"
                        : result.status === "running"
                        ? "blue"
                        : "gray"
                    }
                  >
                    <div className="pb-4">
                      {/* 节点基本信息 */}
                      <div
                        className={`rounded-lg border cursor-pointer transition-all duration-200 ${
                          isExpanded
                            ? "bg-blue-50 border-blue-200 shadow-sm"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => toggleNodeExpansion(nodeId)}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-base">
                                {nodeId}
                              </span>
                              <Badge
                                color="blue"
                                text={result.nodeType}
                                className="text-xs"
                              />
                              {result.status === "completed" && (
                                <Badge color="green" text="成功" size="small" />
                              )}
                              {result.status === "failed" && (
                                <Badge color="red" text="失败" size="small" />
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-500">
                                {result.duration}ms
                              </span>
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  isExpanded ? <UpOutlined /> : <DownOutlined />
                                }
                                className="text-gray-400 hover:text-gray-600"
                              />
                            </div>
                          </div>

                          {/* 错误信息预览 */}
                          {result.error && !isExpanded && (
                            <div className="mt-2 text-sm text-red-600 truncate">
                              错误: {result.error}
                            </div>
                          )}

                          {/* 成功信息预览 */}
                          {result.status === "completed" && !isExpanded && (
                            <div className="mt-2 text-sm text-green-600">
                              ✓ 执行成功
                            </div>
                          )}
                        </div>

                        {/* 展开的详细信息 */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-white">
                            <div className="p-4 space-y-4">
                              {/* 节点详细信息 */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    节点ID:
                                  </span>
                                  <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded break-all">
                                    {result.nodeId}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    节点类型:
                                  </span>
                                  <div className="font-medium mt-1">
                                    {result.nodeType}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    执行状态:
                                  </span>
                                  <div className="flex items-center gap-2 mt-1">
                                    {nodeStatusDisplay.icon}
                                    <span className="font-medium">
                                      {nodeStatusDisplay.text}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">
                                    执行时间:
                                  </span>
                                  <div className="font-medium mt-1">
                                    {result.duration}ms
                                  </div>
                                </div>
                              </div>

                              {/* 输入数据 */}
                              {result.input && (
                                <div>
                                  <span className="text-gray-500 text-sm font-medium">
                                    输入数据:
                                  </span>
                                  <div className="mt-2 border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 p-3">
                                      <OptimizedDebugInputDisplay
                                        input={result.input}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 输出结果 */}
                              {result.markdownOutput && (
                                <div>
                                  <span className="text-gray-500 text-sm font-medium">
                                    输出结果:
                                  </span>
                                  <div className="mt-2 border rounded-lg overflow-hidden">
                                    <div className="max-h-64 overflow-y-auto">
                                      <div className="p-4 bg-white prose prose-sm max-w-none">
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: result.markdownOutput,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {result.output && !result.markdownOutput && (
                                <div>
                                  <span className="text-gray-500 text-sm font-medium">
                                    输出数据:
                                  </span>
                                  <div className="mt-2 border rounded-lg overflow-hidden">
                                    <div className="max-h-64 overflow-auto">
                                      <pre className="p-3 bg-gray-100 text-xs font-mono whitespace-pre-wrap">
                                        {JSON.stringify(result.output, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 错误信息详情 */}
                              {result.error && (
                                <div>
                                  <span className="text-gray-500 text-sm font-medium">
                                    错误详情:
                                  </span>
                                  <div className="mt-2 border border-red-200 rounded-lg overflow-hidden">
                                    <div className="max-h-48 overflow-y-auto">
                                      <div className="p-3 bg-red-50 text-sm text-red-700 whitespace-pre-wrap break-words">
                                        {result.error}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 时间戳信息 */}
                              <div className="pt-2 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                  <div>
                                    <span>开始时间: </span>
                                    <span className="font-mono">
                                      {new Date(
                                        result.startTime || 0
                                      ).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span>结束时间: </span>
                                    <span className="font-mono">
                                      {result.endTime
                                        ? new Date(
                                            result.endTime
                                          ).toLocaleTimeString()
                                        : "执行中..."}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Timeline.Item>
                );
              })}

              {/* 当前正在执行的节点 */}
              {debugState.currentNode &&
                !debugState.completedNodes.includes(debugState.currentNode) && (
                  <Timeline.Item
                    dot={<LoadingOutlined className="text-blue-600" spin />}
                    color="blue"
                  >
                    <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-blue-800">
                          正在执行: {debugState.currentNode}
                        </span>
                        <Badge color="blue" text="执行中" size="small" />
                      </div>
                      <div className="mt-2 text-sm text-blue-600">
                        节点正在处理中，请稍候...
                      </div>
                    </div>
                  </Timeline.Item>
                )}
            </Timeline>
          </div>
        </Scrollbar>
      </div>
    </div>
  );
};

export default DebugExecutionLogs;
