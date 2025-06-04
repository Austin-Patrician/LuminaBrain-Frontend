import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Badge, Progress, Tabs, Collapse } from 'antd';
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
  UpOutlined,
  DownOutlined
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
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
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

  // 验证工作流完整性
  const validateWorkflow = (nodes: Node[], edges: Edge[]): boolean => {
    const errors: string[] = [];

    // 1. 基础检查：必须有节点
    if (!nodes || nodes.length === 0) {
      Modal.error({
        title: '工作流验证失败',
        content: '工作流中没有任何节点，请添加节点后再开始调试。'
      });
      return false;
    }

    // 2. 检查开始节点
    const startNodes = nodes.filter(node => node.type === 'startNode');
    if (startNodes.length === 0) {
      errors.push('工作流中必须有一个开始节点');
    } else if (startNodes.length > 1) {
      errors.push('工作流中只能有一个开始节点');
    }

    // 3. 检查结束节点
    const endNodes = nodes.filter(node =>
      node.type === 'endNode' || node.type === 'responseNode'
    );
    if (endNodes.length === 0) {
      errors.push('工作流中必须至少有一个结束节点（结束节点或响应节点）');
    }

    // 4. 定义允许多输出的节点类型（条件控制节点）
    const MULTI_OUTPUT_NODE_TYPES = [
      'conditionNode',    // 条件判断节点
      'decisionNode',     // 决策节点  
      'switchNode'        // 开关节点
    ];

    // 5. 定义允许多输入的节点类型
    const MULTI_INPUT_NODE_TYPES = [
      'endNode',          // 结束节点可以被多个分支连接
      'responseNode'      // 响应节点可以被多个分支连接
    ];

    // 6. 构建邻接表和入度统计
    const adjacencyList: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};

    // 初始化
    nodes.forEach(node => {
      adjacencyList[node.id] = [];
      inDegree[node.id] = 0;
      outDegree[node.id] = 0;
    });

    // 统计连接关系
    edges.forEach(edge => {
      if (edge.source && edge.target) {
        adjacencyList[edge.source].push(edge.target);
        outDegree[edge.source]++;
        inDegree[edge.target]++;
      }
    });

    // 7. 检查多链路执行问题
    nodes.forEach(node => {
      const nodeType = node.type;
      const nodeLabel = node.data?.label || node.id;

      // 检查非条件节点是否被多个节点连入（会造成执行歧义）
      if (inDegree[node.id] > 1 && !MULTI_INPUT_NODE_TYPES.includes(nodeType)) {
        const sourceNodes = edges
          .filter(edge => edge.target === node.id)
          .map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            return sourceNode?.data?.label || edge.source;
          });

        errors.push(
          `节点"${nodeLabel}"被多个节点连接，这会造成执行歧义。` +
          `连接来源: ${sourceNodes.join(', ')}。` +
          `建议在前面添加条件节点来控制执行流程。`
        );
      }

      // 检查普通节点是否有多个输出（除了条件控制节点）
      if (outDegree[node.id] > 1 && !MULTI_OUTPUT_NODE_TYPES.includes(nodeType)) {
        const targetNodes = edges
          .filter(edge => edge.source === node.id)
          .map(edge => {
            const targetNode = nodes.find(n => n.id === edge.target);
            return targetNode?.data?.label || edge.target;
          });

        errors.push(
          `普通节点"${nodeLabel}"连接到多个目标节点，这会造成并行执行问题。` +
          `目标节点: ${targetNodes.join(', ')}。` +
          `如需分支执行，请使用条件判断节点。`
        );
      }
    });

    // 8. 检查开始节点连接
    if (startNodes.length > 0) {
      const startNode = startNodes[0];
      if (outDegree[startNode.id] === 0) {
        errors.push('开始节点没有连接到任何其他节点');
      }
    }

    // 9. 检查结束节点连接
    endNodes.forEach(endNode => {
      if (inDegree[endNode.id] === 0) {
        const nodeLabel = endNode.data?.label || endNode.id;
        errors.push(`结束节点"${nodeLabel}"没有接收任何输入连接`);
      }
    });

    // 10. 检查从开始节点到结束节点的连通性
    if (startNodes.length > 0 && endNodes.length > 0) {
      const startNodeId = startNodes[0].id;
      const endNodeIds = endNodes.map(node => node.id);

      // 深度优先搜索检查可达性
      const visited = new Set<string>();
      const reachableNodes = new Set<string>();

      const dfs = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        reachableNodes.add(nodeId);

        const neighbors = adjacencyList[nodeId] || [];
        neighbors.forEach(neighbor => dfs(neighbor));
      };

      dfs(startNodeId);

      // 检查每个结束节点是否可达
      const unreachableEndNodes = endNodeIds.filter(endId => !reachableNodes.has(endId));
      if (unreachableEndNodes.length > 0) {
        const unreachableLabels = unreachableEndNodes.map(endId => {
          const node = nodes.find(n => n.id === endId);
          return node?.data?.label || endId;
        });
        errors.push(`以下结束节点无法从开始节点到达: ${unreachableLabels.join(', ')}`);
      }

      // 检查孤立节点（不在执行路径上的节点）
      const isolatedNodes = nodes.filter(node => {
        // 跳过开始节点和结束节点
        if (node.type === 'startNode' || endNodeIds.includes(node.id)) return false;

        // 检查节点是否在从开始节点可达的路径上
        if (!reachableNodes.has(node.id)) return true;

        // 检查节点是否有到达结束节点的路径
        const tempVisited = new Set<string>();
        const canReachEnd = (nodeId: string): boolean => {
          if (tempVisited.has(nodeId)) return false;
          if (endNodeIds.includes(nodeId)) return true;

          tempVisited.add(nodeId);
          const neighbors = adjacencyList[nodeId] || [];
          return neighbors.some(neighbor => canReachEnd(neighbor));
        };

        return !canReachEnd(node.id);
      });

      if (isolatedNodes.length > 0) {
        const isolatedLabels = isolatedNodes.map(node => node.data?.label || node.id);
        errors.push(`以下节点处于孤立状态，不在完整执行路径上: ${isolatedLabels.join(', ')}`);
      }
    }

    // 11. 检查循环引用（简单检测）
    const detectCycle = (): boolean => {
      const visiting = new Set<string>();
      const visited = new Set<string>();

      const hasCycle = (nodeId: string): boolean => {
        if (visiting.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visiting.add(nodeId);
        const neighbors = adjacencyList[nodeId] || [];

        for (const neighbor of neighbors) {
          if (hasCycle(neighbor)) return true;
        }

        visiting.delete(nodeId);
        visited.add(nodeId);
        return false;
      };

      for (const nodeId of Object.keys(adjacencyList)) {
        if (!visited.has(nodeId) && hasCycle(nodeId)) {
          return true;
        }
      }
      return false;
    };

    if (detectCycle()) {
      errors.push('工作流中存在循环引用，这可能导致无限执行');
    }

    // 12. 显示验证结果
    if (errors.length > 0) {
      Modal.error({
        title: '工作流验证失败',
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
              <div className="text-blue-800 font-medium mb-2">💡 修复建议：</div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 确保工作流有且仅有一个开始节点</li>
                <li>• 至少添加一个结束节点或响应节点</li>
                <li>• 避免普通节点被多个节点连接，使用条件节点控制分支</li>
                <li>• 确保所有节点都在完整的执行路径上</li>
                <li>• 检查并移除可能的循环连接</li>
              </ul>
            </div>
          </div>
        )
      });
      return false;
    }

    return true;
  };

  // 开始调试执行
  const handleStartDebug = async () => {
    if (nodes.length === 0) {
      alert('请先添加一些节点到工作流中');
      return;
    }

    // 验证工作流完整性
    if (!validateWorkflow(nodes, edges)) {
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
    setExpandedNodeIds(new Set());
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
    <Modal
      title={
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusDisplay.color}`} />
          <span className="font-semibold">调试面板</span>
          <Badge>{statusDisplay.text}</Badge>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 50 }}
      bodyStyle={{ height: '70vh', padding: 0 }}
      destroyOnClose={false}
      maskClosable={false}
      className="debug-panel-modal"
    >
      <div className="h-full flex flex-col">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="h-full flex flex-col"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          tabBarStyle={{ flexShrink: 0, marginBottom: 0, paddingLeft: 16, paddingRight: 16 }}
          size="small"
        >
          <Tabs.TabPane tab="概览" key="overview" className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-4">
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
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">总耗时</div>
                      <div className="font-semibold">{Math.round(stats.totalDuration)}ms</div>
                    </div>
                  )}
                  {stats.averageNodeDuration && (
                    <div className="text-center p-3 bg-gray-50 rounded">
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
                    rows={2}
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
                  <div className="text-sm text-red-700 whitespace-pre-wrap break-words">{debugState.error}</div>
                </div>
              )}
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="执行日志" key="logs" className="h-full overflow-hidden">
            <div className="h-full flex flex-col">
              <div
                className="flex-1 overflow-hidden"
                style={{ height: 'calc(70vh - 120px)' }}
              >
                <Scrollbar style={{ height: '100%' }} ref={scrollAreaRef}>
                  <div className="p-4">
                    <div className="space-y-2">
                      {debugState.completedNodes.map((nodeId) => {
                        const result = debugState.results?.[nodeId];
                        if (!result) return null;

                        const nodeStatusDisplay = getStatusDisplay(result.status);

                        return (
                          <div
                            key={nodeId}
                            className={`rounded-lg border ${expandedNodeIds.has(nodeId) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                          >
                            {/* 节点基本信息 */}
                            <div
                              className="p-3 cursor-pointer transition-colors hover:bg-gray-100"
                              onClick={() => {
                                const newExpandedNodeIds = new Set(expandedNodeIds);
                                if (newExpandedNodeIds.has(nodeId)) {
                                  newExpandedNodeIds.delete(nodeId);
                                } else {
                                  newExpandedNodeIds.add(nodeId);
                                }
                                setExpandedNodeIds(newExpandedNodeIds);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {nodeStatusDisplay.icon}
                                  <span className="font-medium text-sm">{nodeId}</span>
                                  <Badge className="text-xs">
                                    {result.nodeType}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {result.duration}ms
                                  </span>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={expandedNodeIds.has(nodeId) ? <UpOutlined /> : <DownOutlined />}
                                    className="text-gray-400"
                                  />
                                </div>
                              </div>

                              {result.error && (
                                <div className="mt-2 text-sm text-red-600 whitespace-pre-wrap break-words">
                                  错误: {result.error}
                                </div>
                              )}
                            </div>

                            {/* 折叠的执行结果详情 */}
                            {expandedNodeIds.has(nodeId) && (
                              <div className="border-t border-gray-200 p-3 bg-white">
                                <div className="space-y-3">
                                  {/* 节点详细信息 */}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">节点ID:</span>
                                      <div className="font-medium break-all">{result.nodeId}</div>
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

                                  {/* 输入数据 */}
                                  {result.input && (
                                    <div>
                                      <span className="text-gray-500 text-sm font-medium">输入数据:</span>
                                      <div className="mt-1 border rounded-lg">
                                        <div className="max-h-24 overflow-y-auto">
                                          <pre className="p-2 bg-gray-100 text-xs whitespace-pre-wrap break-words">
                                            {JSON.stringify(result.input, null, 2)}
                                          </pre>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 输出结果 */}
                                  {result.markdownOutput && (
                                    <div>
                                      <span className="text-gray-500 text-sm font-medium">输出结果:</span>
                                      <div className="mt-1 border rounded-lg">
                                        <div className="max-h-32 overflow-y-auto">
                                          <div className="p-2 bg-gray-50 prose prose-sm max-w-none">
                                            <div dangerouslySetInnerHTML={{ __html: result.markdownOutput }} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {result.output && !result.markdownOutput && (
                                    <div>
                                      <span className="text-gray-500 text-sm font-medium">输出数据:</span>
                                      <div className="mt-1 border rounded-lg">
                                        <div className="max-h-32 overflow-y-auto">
                                          <pre className="p-2 bg-gray-100 text-xs whitespace-pre-wrap break-words">
                                            {JSON.stringify(result.output, null, 2)}
                                          </pre>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 错误信息详情 */}
                                  {result.error && (
                                    <div>
                                      <span className="text-gray-500 text-sm font-medium">错误详情:</span>
                                      <div className="mt-1 border border-red-200 rounded-lg">
                                        <div className="max-h-24 overflow-y-auto">
                                          <div className="p-2 bg-red-50 text-sm text-red-700 whitespace-pre-wrap break-words">
                                            {result.error}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {debugState.currentNode && !debugState.completedNodes.includes(debugState.currentNode) && (
                        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                          <div className="flex items-center gap-2">
                            <LoadingOutlined className="text-blue-600" spin />
                            <span className="font-medium text-sm">正在执行: {debugState.currentNode}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Scrollbar>
              </div>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="结果" key="results" className="h-full overflow-hidden">
            <div className="h-full flex flex-col">
              <div
                className="flex-1 overflow-hidden"
                style={{ height: 'calc(70vh - 120px)' }}
              >
                <Scrollbar style={{ height: '100%' }}>
                  {(() => {
                    // 获取最后一个完成的节点结果
                    const lastCompletedNodeId = debugState.completedNodes[debugState.completedNodes.length - 1];
                    const lastResult = lastCompletedNodeId ? debugState.results?.[lastCompletedNodeId] : null;

                    if (!lastResult) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-gray-500 py-8">
                            <RobotOutlined className="text-4xl mb-4 opacity-50" />
                            <p>暂无执行结果</p>
                            <p className="text-sm text-gray-400 mt-2">
                              执行工作流后，这里将显示最后一个节点的执行结果
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">最终执行结果</h4>
                          <Badge color="blue" className="text-sm">
                            {lastResult.nodeType}
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {/* 节点基本信息 */}
                          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                            <div>
                              <span className="text-gray-500">节点ID:</span>
                              <div className="font-medium break-all">{lastResult.nodeId}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">节点类型:</span>
                              <div className="font-medium">{lastResult.nodeType}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">执行状态:</span>
                              <div className="flex items-center gap-1">
                                {getStatusDisplay(lastResult.status).icon}
                                <span>{getStatusDisplay(lastResult.status).text}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">执行时间:</span>
                              <div className="font-medium">{lastResult.duration}ms</div>
                            </div>
                          </div>

                          {/* 最终输出结果 - 重点展示 */}
                          {lastResult.markdownOutput && (
                            <div>
                              <span className="text-gray-500 text-sm font-medium">最终输出结果:</span>
                              <div className="mt-2 border rounded-lg overflow-hidden">
                                <div className="max-h-96 overflow-y-auto">
                                  <div className="p-4 bg-white prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: lastResult.markdownOutput }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {lastResult.output && !lastResult.markdownOutput && (
                            <div>
                              <span className="text-gray-500 text-sm font-medium">最终输出数据:</span>
                              <div className="mt-2 border rounded-lg overflow-hidden">
                                <div className="max-h-96 overflow-y-auto">
                                  <pre className="p-4 bg-gray-100 text-sm whitespace-pre-wrap break-words">
                                    {JSON.stringify(lastResult.output, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 输入数据 - 折叠显示 */}
                          {lastResult.input && (
                            <Collapse size="small" ghost>
                              <Collapse.Panel header="查看输入数据" key="input">
                                <div className="border rounded-lg max-h-32 overflow-y-auto">
                                  <pre className="p-3 bg-gray-100 text-xs whitespace-pre-wrap break-words">
                                    {JSON.stringify(lastResult.input, null, 2)}
                                  </pre>
                                </div>
                              </Collapse.Panel>
                            </Collapse>
                          )}

                          {/* 错误信息 */}
                          {lastResult.error && (
                            <div>
                              <span className="text-gray-500 text-sm font-medium">错误信息:</span>
                              <div className="mt-2 border border-red-200 rounded-lg overflow-hidden">
                                <div className="max-h-32 overflow-y-auto">
                                  <div className="p-3 bg-red-50 text-sm text-red-700 whitespace-pre-wrap break-words">
                                    {lastResult.error}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 执行统计 */}
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm text-blue-800 mb-2 font-medium">执行统计</div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-blue-600 font-semibold">{debugState.completedNodes.length}</div>
                                <div className="text-blue-500">已完成节点</div>
                              </div>
                              <div className="text-center">
                                <div className="text-blue-600 font-semibold">
                                  {stats.totalDuration ? Math.round(stats.totalDuration) : 0}ms
                                </div>
                                <div className="text-blue-500">总执行时间</div>
                              </div>
                              <div className="text-center">
                                <div className="text-blue-600 font-semibold">
                                  {stats.averageNodeDuration ? Math.round(stats.averageNodeDuration) : 0}ms
                                </div>
                                <div className="text-blue-500">平均耗时</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Scrollbar>
              </div>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default DebugPanel;