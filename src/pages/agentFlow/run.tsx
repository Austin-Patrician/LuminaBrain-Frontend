import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Button,
  Typography,
  Descriptions,
  Tag,
  message,
  Timeline,
  Spin,
  Empty,
  Progress,
  Badge,
  Modal,
  Input,
  Form,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { flowService, FlowDataRaw } from '@/api/services/flowService';
import { requiresUserInput } from '@/pages/agentFlow/constants/inputSource';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface NodeExecutionStatus {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  duration?: number;
  output?: any;
  error?: string;
  progress?: number;
}

interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  duration?: number;
  nodeStatuses: NodeExecutionStatus[];
  currentNodeId?: string;
  totalNodes: number;
  completedNodes: number;
}

const AgentFlowRunPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState<FlowDataRaw | null>(null);
  const [loading, setLoading] = useState(true);
  const [executionState, setExecutionState] = useState<ExecutionState>({
    status: 'idle',
    nodeStatuses: [],
    totalNodes: 0,
    completedNodes: 0,
  });
  
  // 用户输入相关状态
  const [userInputModalVisible, setUserInputModalVisible] = useState(false);
  const [userInputValue, setUserInputValue] = useState('');
  const [userInputForm] = Form.useForm();

  // 加载流程数据
  useEffect(() => {
    if (id) {
      loadFlowData(id);
    }
  }, [id]);

  const loadFlowData = async (flowId: string) => {
    setLoading(true);
    try {
      const data = await flowService.getFlowById(flowId);
      setFlowData(data);
      
      // 初始化节点状态
      const nodeStatuses: NodeExecutionStatus[] = data.nodes?.map(node => ({
        id: node.id,
        name: node.data?.label || node.type || 'Unknown',
        type: node.type || 'unknown',
        status: 'pending',
      })) || [];

      setExecutionState({
        status: 'idle',
        nodeStatuses,
        totalNodes: nodeStatuses.length,
        completedNodes: 0,
      });
    } catch (error) {
      message.error('加载流程数据失败');
      console.error('Load flow data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 检查第一个节点是否需要用户输入
  const checkFirstNodeRequiresInput = () => {
    if (!flowData?.nodes || flowData.nodes.length === 0) {
      return false;
    }
    
    // 找到第一个节点（通常是startNode）
    const firstNode = flowData.nodes.find(node => node.type === 'startNode') || flowData.nodes[0];
    
    if (!firstNode) {
      return false;
    }
    
    // 检查是否需要用户输入
    const nodeData = firstNode.data || {};
    
    // 检查 inputSource 配置
    if (nodeData.inputSource && requiresUserInput(nodeData.inputSource)) {
      return true;
    }
    
    // 检查是否是需要用户输入的节点类型
    if (firstNode.type === 'startNode' || firstNode.type === 'userInputNode') {
      return true;
    }
    
    return false;
  };

  // 开始执行流程
  const handleStartExecution = async () => {
    if (!flowData?.id) {
      message.error('流程ID不存在');
      return;
    }

    // 检查第一个节点是否需要用户输入
    if (checkFirstNodeRequiresInput()) {
      setUserInputModalVisible(true);
      return;
    }

    await startExecutionWithInput();
  };

  // 处理用户输入提交
  const handleUserInputSubmit = async () => {
    try {
      await userInputForm.validateFields();
      setUserInputModalVisible(false);
      await startExecutionWithInput(userInputValue);
    } catch (error) {
      console.error('用户输入验证失败:', error);
    }
  };

  // 处理用户输入取消
  const handleUserInputCancel = () => {
    setUserInputModalVisible(false);
    setUserInputValue('');
    userInputForm.resetFields();
  };

  // 开始执行（带有用户输入）
  const startExecutionWithInput = async (userInput?: string) => {
    setExecutionState(prev => ({
      ...prev,
      status: 'running',
      startTime: new Date().toISOString(),
    }));

    try {
      // 模拟执行过程，传入用户输入
      await simulateExecution(userInput);
    } catch (error) {
      message.error('流程执行失败');
      setExecutionState(prev => ({
        ...prev,
        status: 'failed',
        endTime: new Date().toISOString(),
      }));
    }
  };

  // 模拟执行过程
  const simulateExecution = async (userInput?: string) => {
    const { nodeStatuses } = executionState;
    let completedCount = 0;

    for (let i = 0; i < nodeStatuses.length; i++) {
      const node = nodeStatuses[i];
      
      // 更新当前节点为运行中
      setExecutionState(prev => ({
        ...prev,
        currentNodeId: node.id,
        nodeStatuses: prev.nodeStatuses.map(n => 
          n.id === node.id 
            ? { ...n, status: 'running', startTime: new Date().toISOString() }
            : n
        ),
      }));

      // 模拟执行时间
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 模拟成功或失败
      const isSuccess = Math.random() > 0.1; // 90% 成功率
      completedCount++;

      // 为第一个节点添加用户输入到输出中
      let nodeOutput: any = isSuccess ? { 
        result: `Node ${node.name} executed successfully` 
      } : undefined;
      
      if (i === 0 && userInput) {
        nodeOutput = { 
          result: `Node ${node.name} executed with user input: ${userInput}`,
          userInput
        };
      }

      setExecutionState(prev => ({
        ...prev,
        completedNodes: completedCount,
        nodeStatuses: prev.nodeStatuses.map(n => 
          n.id === node.id 
            ? { 
                ...n, 
                status: isSuccess ? 'completed' : 'failed',
                endTime: new Date().toISOString(),
                duration: Math.floor(1000 + Math.random() * 2000),
                output: nodeOutput,
                error: isSuccess ? undefined : `Node ${node.name} execution failed`,
              }
            : n
        ),
      }));

      if (!isSuccess) {
        throw new Error(`Node ${node.name} execution failed`);
      }
    }

    // 执行完成
    setExecutionState(prev => ({
      ...prev,
      status: 'completed',
      endTime: new Date().toISOString(),
      currentNodeId: undefined,
    }));

    message.success('流程执行完成');
  };

  // 停止执行
  const handleStopExecution = () => {
    setExecutionState(prev => ({
      ...prev,
      status: 'cancelled',
      endTime: new Date().toISOString(),
      currentNodeId: undefined,
    }));
    message.info('流程执行已停止');
  };

  // 重置执行状态
  const handleResetExecution = () => {
    setExecutionState(prev => ({
      ...prev,
      status: 'idle',
      startTime: undefined,
      endTime: undefined,
      duration: undefined,
      currentNodeId: undefined,
      completedNodes: 0,
      nodeStatuses: prev.nodeStatuses.map(node => ({
        ...node,
        status: 'pending',
        startTime: undefined,
        endTime: undefined,
        duration: undefined,
        output: undefined,
        error: undefined,
      })),
    }));
  };

  // 获取状态图标
  const getStatusIcon = (status: NodeExecutionStatus['status']) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined className="text-gray-400" />;
      case 'running':
        return <LoadingOutlined className="text-blue-500" />;
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'failed':
        return <ExclamationCircleOutlined className="text-red-500" />;
      case 'skipped':
        return <ClockCircleOutlined className="text-gray-400" />;
      default:
        return <ClockCircleOutlined className="text-gray-400" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: NodeExecutionStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'running':
        return 'processing';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'skipped':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!flowData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Empty description="流程数据加载失败" />
      </div>
    );
  }

  const progress = executionState.totalNodes > 0 
    ? (executionState.completedNodes / executionState.totalNodes) * 100 
    : 0;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 用户输入模态框 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span>请输入初始数据</span>
          </div>
        }
        open={userInputModalVisible}
        onCancel={handleUserInputCancel}
        width={600}
        footer={[
          <Button key="cancel" onClick={handleUserInputCancel} size="large">
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUserInputSubmit}
            size="large"
          >
            开始执行
          </Button>
        ]}
        destroyOnClose
        maskClosable={false}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <UserOutlined className="text-blue-600 mt-0.5" />
            <Text className="text-blue-800">
              此流程的第一个节点需要用户输入数据，请在下方输入您要处理的内容或问题。
            </Text>
          </div>
          
          <Form form={userInputForm} layout="vertical">
            <Form.Item
              name="userInput"
              label="初始输入"
              rules={[
                { required: true, message: '请输入初始数据' },
                { min: 1, message: '输入内容不能为空' }
              ]}
            >
              <TextArea
                value={userInputValue}
                onChange={(e) => setUserInputValue(e.target.value)}
                placeholder="请输入您要处理的内容、问题或数据..."
                rows={4}
                maxLength={2000}
              />
            </Form.Item>
          </Form>
          
          <div className="text-right text-xs text-gray-500">
            {userInputValue.length} / 2000
          </div>
        </div>
      </Modal>

      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/agentFlow/list')}
            className="flex items-center"
          >
            返回列表
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          {executionState.status === 'idle' && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartExecution}
              size="large"
            >
              开始运行
            </Button>
          )}
          
          {executionState.status === 'running' && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={handleStopExecution}
              size="large"
            >
              停止运行
            </Button>
          )}
          
          {['completed', 'failed', 'cancelled'].includes(executionState.status) && (
            <Button
              icon={<ReloadOutlined />}
              onClick={handleResetExecution}
              size="large"
            >
              重新运行
            </Button>
          )}
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：流程信息 */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <Title level={5} className="mb-4">流程信息</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="流程名称">{flowData.name}</Descriptions.Item>
              <Descriptions.Item label="描述">{flowData.description || '暂无描述'}</Descriptions.Item>
              <Descriptions.Item label="节点数量">{flowData.nodeCount}</Descriptions.Item>
              <Descriptions.Item label="连接数量">{flowData.connectionCount}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {flowData.status === 'published' ? (
                  <Tag color="success">已发布</Tag>
                ) : flowData.status === 'draft' ? (
                  <Tag color="default">草稿</Tag>
                ) : (
                  <Tag color="warning">已归档</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="标签">
                {flowData.tags?.map(tag => (
                  <Tag key={tag} className="mb-1">{tag}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* 执行状态 */}
          <div className="p-6 border-b border-gray-200">
            <Title level={5} className="mb-4">执行状态</Title>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text>状态</Text>
                <Badge
                  status={
                    executionState.status === 'running' ? 'processing' :
                    executionState.status === 'completed' ? 'success' :
                    executionState.status === 'failed' ? 'error' :
                    'default'
                  }
                  text={
                    executionState.status === 'idle' ? '未开始' :
                    executionState.status === 'running' ? '运行中' :
                    executionState.status === 'completed' ? '已完成' :
                    executionState.status === 'failed' ? '执行失败' :
                    '已取消'
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Text>进度</Text>
                <Text>{executionState.completedNodes} / {executionState.totalNodes}</Text>
              </div>
              
              <Progress 
                percent={progress} 
                size="small"
                status={
                  executionState.status === 'failed' ? 'exception' :
                  executionState.status === 'completed' ? 'success' :
                  'active'
                }
              />
              
              {executionState.startTime && (
                <div className="flex items-center justify-between">
                  <Text>开始时间</Text>
                  <Text className="text-sm">
                    {new Date(executionState.startTime).toLocaleString()}
                  </Text>
                </div>
              )}
              
              {executionState.endTime && (
                <div className="flex items-center justify-between">
                  <Text>结束时间</Text>
                  <Text className="text-sm">
                    {new Date(executionState.endTime).toLocaleString()}
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* 执行控制 */}
          <div className="p-6 flex-1">
            <Title level={5} className="mb-4">快捷操作</Title>
            <div className="space-y-3">
              {executionState.status === 'running' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <LoadingOutlined className="text-blue-500" />
                    <Text strong className="text-blue-700">正在执行中...</Text>
                  </div>
                  <Text className="text-sm text-blue-600">
                    当前正在执行第 {executionState.completedNodes + 1} 个节点
                  </Text>
                </div>
              )}
              
              {executionState.status === 'completed' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <Text strong className="text-green-700">执行完成</Text>
                  </div>
                  <Text className="text-sm text-green-600">
                    所有节点已成功执行完毕
                  </Text>
                </div>
              )}
              
              {executionState.status === 'failed' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationCircleOutlined className="text-red-500" />
                    <Text strong className="text-red-700">执行失败</Text>
                  </div>
                  <Text className="text-sm text-red-600">
                    请检查错误信息并重新运行
                  </Text>
                </div>
              )}
              
              {executionState.status === 'cancelled' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <StopOutlined className="text-orange-500" />
                    <Text strong className="text-orange-700">执行已取消</Text>
                  </div>
                  <Text className="text-sm text-orange-600">
                    可以重新开始执行流程
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：执行详情 */}
        <div className="flex-1 bg-white overflow-auto">
          {executionState.status === 'idle' && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <Title level={3} className="text-gray-400 mb-2">
                  AI 会在这里给你惊喜
                </Title>
                <Text className="text-gray-500">
                  点击左侧的"开始运行"按钮开始执行流程
                </Text>
              </div>
            </div>
          )}

          {executionState.status !== 'idle' && (
            <div className="p-6">
              <Title level={5} className="mb-4">节点执行详情</Title>
              <Timeline>
                {executionState.nodeStatuses.map((node) => (
                  <Timeline.Item
                    key={node.id}
                    dot={getStatusIcon(node.status)}
                    color={getStatusColor(node.status)}
                  >
                    <div className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Text strong className="text-base">{node.name}</Text>
                          <Tag className="text-xs bg-blue-50 border-blue-200 text-blue-600">
                            {node.type}
                          </Tag>
                        </div>
                        <Badge 
                          status={getStatusColor(node.status)} 
                          text={
                            <span className={`text-sm font-medium ${
                              node.status === 'pending' ? 'text-gray-500' :
                              node.status === 'running' ? 'text-blue-600' :
                              node.status === 'completed' ? 'text-green-600' :
                              node.status === 'failed' ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {
                                node.status === 'pending' ? '等待中' :
                                node.status === 'running' ? '执行中' :
                                node.status === 'completed' ? '已完成' :
                                node.status === 'failed' ? '执行失败' :
                                '已跳过'
                              }
                            </span>
                          }
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        {node.startTime && (
                          <div className="flex flex-col">
                            <Text className="text-xs text-gray-500 mb-1">开始时间</Text>
                            <Text className="text-sm font-mono">
                              {new Date(node.startTime).toLocaleTimeString()}
                            </Text>
                          </div>
                        )}
                        
                        {node.endTime && (
                          <div className="flex flex-col">
                            <Text className="text-xs text-gray-500 mb-1">结束时间</Text>
                            <Text className="text-sm font-mono">
                              {new Date(node.endTime).toLocaleTimeString()}
                            </Text>
                          </div>
                        )}
                        
                        {node.duration && (
                          <div className="flex flex-col">
                            <Text className="text-xs text-gray-500 mb-1">执行时长</Text>
                            <Text className="text-sm font-mono">
                              {(node.duration / 1000).toFixed(2)}s
                            </Text>
                          </div>
                        )}
                      </div>
                      
                      {node.output && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircleOutlined className="text-green-500" />
                            <Text strong className="text-sm text-green-700">执行结果</Text>
                          </div>
                          <div className="text-sm text-green-800 font-mono bg-white p-2 rounded border">
                            {JSON.stringify(node.output, null, 2)}
                          </div>
                        </div>
                      )}
                      
                      {node.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ExclamationCircleOutlined className="text-red-500" />
                            <Text strong className="text-sm text-red-700">错误信息</Text>
                          </div>
                          <div className="text-sm text-red-800 font-mono bg-white p-2 rounded border">
                            {node.error}
                          </div>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentFlowRunPage;
