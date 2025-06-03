import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  Timeline,
  Typography,
  Space,
  Button,
  Tag,
  Tooltip,
  Drawer,
  Tabs,
  Table,
  Input,
  Select,
  Switch,
  Alert,
  Progress,
  Statistic,
  Empty,
  Badge,
  Row,
  Col
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  NodeIndexOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import WorkflowExecutor, { DebugExecutionState } from '../services/workflowExecutor';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Execution record types
interface ExecutionStep {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: any;
  output?: any;
  error?: string;
  metadata?: {
    memoryUsage?: number;
    cpuTime?: number;
    networkCalls?: number;
    cacheHits?: number;
  };
  children?: ExecutionStep[];
  parentId?: string;
}

interface ExecutionSession {
  id: string;
  workflowId: string;
  workflowName: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  steps: ExecutionStep[];
  variables: Record<string, any>;
  performance: {
    totalDuration: number;
    averageStepDuration: number;
    peakMemoryUsage: number;
    totalNetworkCalls: number;
  };
}

interface ExecutionRecorderProps {
  executor: WorkflowExecutor | null;
  visible: boolean;
  onClose: () => void;
  executionState?: DebugExecutionState | null;
}

const ExecutionRecorder: React.FC<ExecutionRecorderProps> = ({
  executor,
  visible,
  onClose,
  executionState
}) => {
  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [currentSession, setCurrentSession] = useState<ExecutionSession | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);

  const timelineRef = useRef<HTMLDivElement>(null);

  // Start recording execution
  const startRecording = () => {
    if (!executor) return;

    const sessionId = `exec_${Date.now()}`;
    const newSession: ExecutionSession = {
      id: sessionId,
      workflowId: 'current_workflow',
      workflowName: 'Current Workflow',
      startTime: Date.now(),
      status: 'running',
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      steps: [],
      variables: {},
      performance: {
        totalDuration: 0,
        averageStepDuration: 0,
        peakMemoryUsage: 0,
        totalNetworkCalls: 0
      }
    };

    setCurrentSession(newSession);
    setIsRecording(true);
  };

  // Stop recording execution
  const stopRecording = () => {
    if (currentSession) {
      const updatedSession: ExecutionSession = {
        ...currentSession,
        endTime: Date.now(),
        status: currentSession.status === 'running' ? 'completed' : currentSession.status,
        performance: {
          ...currentSession.performance,
          totalDuration: Date.now() - currentSession.startTime,
          averageStepDuration: currentSession.steps.length > 0
            ? currentSession.steps.reduce((sum, step) => sum + (step.duration || 0), 0) / currentSession.steps.length
            : 0
        }
      };

      setExecutionHistory(prev => [updatedSession, ...prev.slice(0, 9)]); // Keep last 10 sessions
      setCurrentSession(null);
    }
    setIsRecording(false);
  };

  // Monitor execution state changes
  useEffect(() => {
    if (!isRecording || !currentSession || !executionState) return;

    if (executionState.status === 'running' && executionState.currentNode) {
      const stepId = `step_${Date.now()}`;
      const newStep: ExecutionStep = {
        id: stepId,
        nodeId: executionState.currentNode,
        nodeName: executionState.currentNode,
        nodeType: 'unknown', // This would come from actual node data
        status: 'running',
        startTime: Date.now(),
        metadata: {
          memoryUsage: Math.random() * 100, // Mock data
          cpuTime: 0,
          networkCalls: 0,
          cacheHits: 0
        }
      };

      setCurrentSession(prev => {
        if (!prev) return prev;

        // Complete previous step if exists
        const updatedSteps = prev.steps.map(step => {
          if (step.status === 'running') {
            return {
              ...step,
              status: 'completed' as const,
              endTime: Date.now(),
              duration: Date.now() - step.startTime
            };
          }
          return step;
        });

        return {
          ...prev,
          steps: [...updatedSteps, newStep],
          totalSteps: updatedSteps.length + 1
        };
      });
    } else if (executionState.status === 'completed' || executionState.status === 'failed') {
      // Complete current session
      setCurrentSession(prev => {
        if (!prev) return prev;

        const finalStatus = executionState.status === 'failed' ? 'failed' : 'completed';
        const updatedSteps = prev.steps.map(step => {
          if (step.status === 'running') {
            return {
              ...step,
              status: finalStatus as 'completed' | 'failed',
              endTime: Date.now(),
              duration: Date.now() - step.startTime,
              error: executionState.status === 'failed' ? executionState.error : undefined
            };
          }
          return step;
        });

        return {
          ...prev,
          status: finalStatus,
          steps: updatedSteps,
          completedSteps: updatedSteps.filter(s => s.status === 'completed').length,
          failedSteps: updatedSteps.filter(s => s.status === 'failed').length
        };
      });

      // Auto-stop recording when execution completes
      setTimeout(stopRecording, 1000);
    }
  }, [executionState, isRecording, currentSession]);

  // Auto-scroll to latest step
  useEffect(() => {
    if (autoScroll && timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [currentSession?.steps, autoScroll]);

  // Get current execution metrics
  const executionMetrics = useMemo(() => {
    if (!currentSession) return null;

    const { steps } = currentSession;
    const runningSteps = steps.filter(s => s.status === 'running').length;
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const failedSteps = steps.filter(s => s.status === 'failed').length;
    const totalDuration = Date.now() - currentSession.startTime;
    const avgStepDuration = steps.length > 0
      ? steps.reduce((sum, step) => sum + (step.duration || 0), 0) / steps.length
      : 0;

    return {
      totalSteps: steps.length,
      runningSteps,
      completedSteps,
      failedSteps,
      totalDuration,
      avgStepDuration,
      progress: steps.length > 0 ? (completedSteps / steps.length) * 100 : 0
    };
  }, [currentSession]);

  // Render execution step timeline
  const renderExecutionTimeline = (session: ExecutionSession) => {
    const filteredSteps = session.steps.filter(step => {
      const matchesSearch = step.nodeName.toLowerCase().includes(searchText.toLowerCase()) ||
        step.nodeType.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || step.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    if (filteredSteps.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="没有匹配的执行步骤"
          className="py-8"
        />
      );
    }

    return (
      <div className="max-h-96 overflow-y-auto" ref={timelineRef}>
        <Timeline className="">
          {filteredSteps.map((step) => {
            const getStepIcon = () => {
              switch (step.status) {
                case 'running': return <PlayCircleOutlined className="animate-spin text-blue-500" />;
                case 'completed': return <CheckCircleOutlined className="text-green-500" />;
                case 'failed': return <CloseCircleOutlined className="text-red-500" />;
                case 'pending': return <ClockCircleOutlined className="text-gray-400" />;
                case 'skipped': return <ExclamationCircleOutlined className="text-orange-500" />;
                default: return <NodeIndexOutlined />;
              }
            };

            const getStepColor = () => {
              switch (step.status) {
                case 'running': return 'blue';
                case 'completed': return 'green';
                case 'failed': return 'red';
                case 'pending': return 'gray';
                case 'skipped': return 'orange';
                default: return 'gray';
              }
            };

            return (
              <Timeline.Item
                key={step.id}
                dot={getStepIcon()}
                color={getStepColor()}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Text strong>{step.nodeName}</Text>
                      <Tag>{step.nodeType}</Tag>
                      <Tag color={getStepColor()}>{step.status}</Tag>
                    </div>
                    <Text className="text-xs text-gray-500">
                      {step.duration ? `${step.duration}ms` : '运行中...'}
                    </Text>
                  </div>

                  <div className="text-xs text-gray-500">
                    开始时间: {new Date(step.startTime).toLocaleTimeString()}
                    {step.endTime && (
                      <span className="ml-4">
                        结束时间: {new Date(step.endTime).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {step.error && (
                    <Alert
                      message="执行错误"
                      description={step.error}
                      type="error"
                      showIcon
                    />
                  )}

                  {step.metadata && showMetrics && (
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        {step.metadata.memoryUsage && (
                          <div>内存: {step.metadata.memoryUsage.toFixed(1)}MB</div>
                        )}
                        {step.metadata.cpuTime && (
                          <div>CPU: {step.metadata.cpuTime}ms</div>
                        )}
                        {step.metadata.networkCalls && (
                          <div>网络调用: {step.metadata.networkCalls}</div>
                        )}
                        {step.metadata.cacheHits && (
                          <div>缓存命中: {step.metadata.cacheHits}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    );
  };

  // Render session history table
  const historyColumns: ColumnsType<ExecutionSession> = [
    {
      title: '会话ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => (
        <Text className="font-mono text-xs">{text.slice(-8)}</Text>
      ),
    },
    {
      title: '工作流',
      dataIndex: 'workflowName',
      key: 'workflowName',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors: Record<string, string> = {
          running: 'blue',
          completed: 'green',
          failed: 'red',
          cancelled: 'orange'
        };
        return <Tag color={colors[status as keyof typeof colors] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '步骤',
      key: 'steps',
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm font-semibold">
            {record.completedSteps}/{record.totalSteps}
          </div>
          <Progress
            percent={record.totalSteps > 0 ? (record.completedSteps / record.totalSteps) * 100 : 0}
            size="small"
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: '耗时',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        const duration = record.endTime ? record.endTime - record.startTime : 0;
        return (
          <Text className="text-xs">
            {duration > 0 ? `${(duration / 1000).toFixed(1)}s` : '-'}
          </Text>
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (timestamp) => (
        <Text className="text-xs">
          {new Date(timestamp).toLocaleString()}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedSession(record.id);
            setDetailVisible(true);
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  // Export execution data
  const handleExportExecution = (session: ExecutionSession) => {
    const exportData = {
      session,
      exportTime: new Date().toISOString(),
      metadata: {
        version: '1.0',
        format: 'execution-record'
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `execution-${session.id}-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <StopOutlined className={isRecording ? "text-red-500 animate-pulse" : "text-gray-400"} />
          <span>执行记录器</span>
          {isRecording && <Badge status="processing" text="正在记录" />}
        </div>
      }
      open={visible}
      onClose={onClose}
      width={1000}
      extra={
        <Space>
          <Tooltip title="显示性能指标">
            <Switch
              checked={showMetrics}
              onChange={setShowMetrics}
              size="small"
            />
          </Tooltip>
          <Tooltip title="自动滚动">
            <Switch
              checked={autoScroll}
              onChange={setAutoScroll}
              size="small"
            />
          </Tooltip>
          {!isRecording ? (
            <Button
              type="primary"
              icon={<StopOutlined />}
              onClick={startRecording}
              size="small"
              disabled={!executor}
            >
              开始记录
            </Button>
          ) : (
            <Button
              icon={<StopOutlined />}
              onClick={stopRecording}
              size="small"
              danger
            >
              停止记录
            </Button>
          )}
        </Space>
      }
    >
      <Tabs defaultActiveKey="current" className="h-full">
        <TabPane tab="当前执行" key="current">
          <div className="space-y-4">
            {/* Current Session Metrics */}
            {executionMetrics && (
              <Card size="small" className="bg-gradient-to-r from-blue-50 to-green-50">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic
                      title="总步骤"
                      value={executionMetrics.totalSteps}
                      prefix={<NodeIndexOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="已完成"
                      value={executionMetrics.completedSteps}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="执行进度"
                      value={executionMetrics.progress}
                      precision={1}
                      suffix="%"
                      prefix={<BarChartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="运行时长"
                      value={executionMetrics.totalDuration / 1000}
                      precision={1}
                      suffix="s"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                </Row>
                {executionMetrics.totalSteps > 0 && (
                  <Progress
                    percent={executionMetrics.progress}
                    status={isRecording ? "active" : "success"}
                    className="mt-3"
                  />
                )}
              </Card>
            )}

            {/* Filters */}
            <Card size="small">
              <div className="flex items-center gap-3">
                <Search
                  placeholder="搜索步骤..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                  size="small"
                />
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">所有状态</Option>
                  <Option value="running">运行中</Option>
                  <Option value="completed">已完成</Option>
                  <Option value="failed">失败</Option>
                  <Option value="pending">等待中</Option>
                </Select>
                {currentSession && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportExecution(currentSession)}
                    size="small"
                  >
                    导出当前会话
                  </Button>
                )}
              </div>
            </Card>

            {/* Execution Timeline */}
            <Card size="small" title="执行时间线">
              {currentSession ? (
                renderExecutionTimeline(currentSession)
              ) : isRecording ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="等待执行开始..."
                  className="py-8"
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="点击 开始记录 来追踪工作流执行"
                  className="py-8"
                />
              )}
            </Card>
          </div>
        </TabPane>

        <TabPane tab={`历史记录 (${executionHistory.length})`} key="history">
          <div className="space-y-4">
            {executionHistory.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无执行历史"
                className="py-8"
              />
            ) : (
              <Card size="small">
                <Table
                  columns={historyColumns}
                  dataSource={executionHistory}
                  rowKey="id"
                  size="small"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条记录`
                  }}
                />
              </Card>
            )}
          </div>
        </TabPane>
      </Tabs>

      {/* Session Detail Drawer */}
      <Drawer
        title="执行详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
        placement="right"
      >
        {selectedSession && (
          <div className="space-y-4">
            {(() => {
              const session = executionHistory.find(s => s.id === selectedSession);
              if (!session) return <Empty description="会话不存在" />;

              return (
                <>
                  <Card size="small" title="会话信息">
                    <div className="space-y-2">
                      <div><Text strong>会话ID:</Text> <Text className="font-mono">{session.id}</Text></div>
                      <div><Text strong>工作流:</Text> <Text>{session.workflowName}</Text></div>
                      <div><Text strong>状态:</Text> <Tag color="green">{session.status}</Tag></div>
                      <div><Text strong>开始时间:</Text> <Text>{new Date(session.startTime).toLocaleString()}</Text></div>
                      {session.endTime && (
                        <div><Text strong>结束时间:</Text> <Text>{new Date(session.endTime).toLocaleString()}</Text></div>
                      )}
                      <div><Text strong>总耗时:</Text> <Text>{((session.endTime || Date.now()) - session.startTime) / 1000}s</Text></div>
                    </div>
                  </Card>

                  <Card size="small" title="执行时间线">
                    {renderExecutionTimeline(session)}
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => handleExportExecution(session)}
                    >
                      导出此会话
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Drawer>
    </Drawer>
  );
};

export default ExecutionRecorder;