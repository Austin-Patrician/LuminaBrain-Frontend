import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Badge, Progress, Tabs } from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  ExclamationCircleOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Node, Edge } from '@xyflow/react';

import WorkflowExecutor, { DebugExecutionState } from '../services/workflowExecutor';
import Scrollbar from '@/components/scrollbar';

const { TextArea } = Input;

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
  executor: WorkflowExecutor;
  nodes: Node[];
  edges: Edge[];
  onExecutionStateChange?: (state: DebugExecutionState) => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  visible,
  onClose,
  executor,
  nodes,
  edges,
  onExecutionStateChange
}) => {
  const [debugState, setDebugState] = useState<DebugExecutionState>(executor.getDebugState());
  const [userInput, setUserInput] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 监听执行状态变化
  useEffect(() => {
    const handleStateChange = (newState: DebugExecutionState) => {
      console.log('DebugPanel: Received state change:', newState);
      setDebugState(newState);

      // 通知主页面状态变化
      if (onExecutionStateChange) {
        onExecutionStateChange(newState);
      }

      // 自动切换到执行日志标签页当开始执行时
      if (newState.status === 'running' && activeTab === 'overview') {
        setActiveTab('logs');
      }

      // 自动滚动到底部
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    };

    executor.onExecutionStateChange(handleStateChange);

    return () => {
      executor.removeExecutionStateChangeListener(handleStateChange);
    };
  }, [activeTab, executor, onExecutionStateChange]);

  // 开始调试执行
  const handleStartDebug = async () => {
    if (nodes.length === 0) {
      alert('请先添加一些节点到工作流中');
      return;
    }

    console.log('DebugPanel: Starting debug execution');
    await executor.startDebugExecution(nodes, edges);
  };

  // 停止执行
  const handleStopExecution = async () => {
    console.log('DebugPanel: Stopping execution');
    await executor.stopExecution();
  };

  // 重置状态
  const handleReset = () => {
    console.log('DebugPanel: Resetting state');
    executor.resetState();
    setSelectedNodeId(null);
    setUserInput('');
    setActiveTab('overview');
  };

  // 提交用户输入
  const handleSubmitUserInput = async () => {
    if (!debugState.currentNode || !userInput.trim()) {
      return;
    }

    console.log('DebugPanel: Submitting user input:', userInput);
    await executor.submitUserInput(debugState.currentNode, userInput.trim());
    setUserInput('');
  };

  // 获取状态对应的图标和颜色
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'running':
        return { icon: <LoadingOutlined className="text-blue-600" spin />, color: 'bg-blue-500', text: '执行中' };
      case 'completed':
        return { icon: <CheckCircleOutlined className="text-green-600" />, color: 'bg-green-500', text: '已完成' };
      case 'failed':
        return { icon: <CloseCircleOutlined className="text-red-600" />, color: 'bg-red-500', text: '失败' };
      case 'stopped':
        return { icon: <StopOutlined className="text-gray-600" />, color: 'bg-gray-500', text: '已停止' };
      case 'waiting_input':
        return { icon: <UserOutlined className="text-yellow-600" />, color: 'bg-yellow-500', text: '等待输入' };
      default:
        return { icon: <ClockCircleOutlined className="text-gray-600" />, color: 'bg-gray-400', text: '空闲' };
    }
  };

  const statusDisplay = getStatusDisplay(debugState.status);
  const stats = executor.getExecutionStats();

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Card className="absolute right-4 top-4 bottom-4 w-96 pointer-events-auto flex flex-col bg-white shadow-2xl border-2 border-gray-300">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${statusDisplay.color}`} />
            <h3 className="font-semibold">调试面板</h3>
            <Badge>{statusDisplay.text}</Badge>
          </div>
          <Button type="text" size="small" onClick={onClose} icon={<CloseOutlined />} />
        </div>

        <div className="flex-1 flex flex-col">
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="flex-1 flex flex-col">
            <Tabs.TabPane tab="概览" key="overview">
              {/* 控制按钮 */}
              <div className="flex gap-2">
                <Button
                  onClick={handleStartDebug}
                  disabled={debugState.status === 'running'}
                  size="small"
                  className="flex-1"
                  icon={<PlayCircleOutlined />}
                >
                  开始调试
                </Button>
                <Button
                  onClick={handleStopExecution}
                  disabled={debugState.status !== 'running' && debugState.status !== 'waiting_input'}
                  danger
                  size="small"
                  icon={<StopOutlined />}
                />
                <Button
                  onClick={handleReset}
                  disabled={debugState.status === 'running'}
                  type="dashed"
                  size="small"
                  icon={<ReloadOutlined />}
                />
              </div>

              {/* 执行进度 */}
              {debugState.totalNodes > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>执行进度</span>
                    <span>{stats.completedCount}/{stats.totalCount}</span>
                  </div>
                  <Progress percent={stats.progressPercentage} className="w-full" />
                </div>
              )}

              {/* 执行统计 */}
              {(debugState.startTime || stats.totalDuration) && (
                <div className="grid grid-cols-2 gap-4">
                  {stats.totalDuration && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">总耗时</div>
                      <div className="font-semibold">{Math.round(stats.totalDuration)}ms</div>
                    </div>
                  )}
                  {stats.averageNodeDuration && (
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">平均耗时</div>
                      <div className="font-semibold">{Math.round(stats.averageNodeDuration)}ms</div>
                    </div>
                  )}
                </div>
              )}

              {/* 当前节点信息 */}
              {debugState.currentNode && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {statusDisplay.icon}
                    <span className="font-medium">当前节点</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {debugState.currentNode}
                  </div>
                  {debugState.results?.[debugState.currentNode] && (
                    <div className="text-sm text-gray-600">
                      类型: {debugState.results[debugState.currentNode].nodeType}
                    </div>
                  )}
                </div>
              )}

              {/* 用户输入区域 */}
              {debugState.status === 'waiting_input' && debugState.currentNode && (
                <div className="space-y-2 p-3 bg-yellow-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-yellow-600" />
                    <span className="font-medium text-yellow-800">需要用户输入</span>
                  </div>
                  <TextArea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="请输入内容..."
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSubmitUserInput}
                    disabled={!userInput.trim()}
                    size="small"
                    className="w-full"
                    icon={<SendOutlined />}
                  >
                    提交输入
                  </Button>
                </div>
              )}

              {/* 错误信息 */}
              {debugState.error && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationCircleOutlined className="text-red-600" />
                    <span className="font-medium text-red-800">执行错误</span>
                  </div>
                  <div className="text-sm text-red-700">{debugState.error}</div>
                </div>
              )}
            </Tabs.TabPane>

            <Tabs.TabPane tab="执行日志" key="logs">
              <Scrollbar className="h-full" ref={scrollAreaRef}>
                <div className="space-y-2">
                  {debugState.completedNodes.map((nodeId) => {
                    const result = debugState.results?.[nodeId];
                    if (!result) return null;

                    const nodeStatusDisplay = getStatusDisplay(result.status);

                    return (
                      <div
                        key={nodeId}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedNodeId === nodeId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        onClick={() => setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {nodeStatusDisplay.icon}
                            <span className="font-medium">{nodeId}</span>
                            <Badge className="text-xs">
                              {result.nodeType}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {result.duration}ms
                          </span>
                        </div>

                        {result.error && (
                          <div className="mt-2 text-sm text-red-600">
                            错误: {result.error}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {debugState.currentNode && !debugState.completedNodes.includes(debugState.currentNode) && (
                    <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                      <div className="flex items-center gap-2">
                        <LoadingOutlined className="text-blue-600" spin />
                        <span className="font-medium">正在执行: {debugState.currentNode}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Scrollbar>
            </Tabs.TabPane>

            <Tabs.TabPane tab="结果" key="results">
              <Scrollbar className="h-full">
                {selectedNodeId && debugState.results?.[selectedNodeId] ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">节点执行结果</h4>
                      <Button
                        type="dashed"
                        size="small"
                        onClick={() => setSelectedNodeId(null)}
                      >
                        关闭
                      </Button>
                    </div>

                    {(() => {
                      const result = debugState.results![selectedNodeId];
                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">节点ID:</span>
                              <div className="font-medium">{result.nodeId}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">节点类型:</span>
                              <div className="font-medium">{result.nodeType}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">执行状态:</span>
                              <div className="flex items-center gap-1">
                                {getStatusDisplay(result.status).icon}
                                <span>{getStatusDisplay(result.status).text}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">执行时间:</span>
                              <div className="font-medium">{result.duration}ms</div>
                            </div>
                          </div>

                          {result.input && (
                            <div>
                              <span className="text-gray-500 text-sm">输入数据:</span>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.input, null, 2)}
                              </pre>
                            </div>
                          )}

                          {result.markdownOutput && (
                            <div>
                              <span className="text-gray-500 text-sm">输出结果:</span>
                              <div className="mt-1 p-2 bg-gray-50 rounded max-h-64 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: result.markdownOutput }} />
                              </div>
                            </div>
                          )}

                          {result.output && !result.markdownOutput && (
                            <div>
                              <span className="text-gray-500 text-sm">输出数据:</span>
                              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-h-32">
                                {JSON.stringify(result.output, null, 2)}
                              </pre>
                            </div>
                          )}

                          {result.error && (
                            <div>
                              <span className="text-gray-500 text-sm">错误信息:</span>
                              <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                {result.error}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <RobotOutlined className="text-4xl mb-4 opacity-50" />
                    <p>请在执行日志中选择一个节点查看详细结果</p>
                  </div>
                )}
              </Scrollbar>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default DebugPanel;