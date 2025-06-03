import React, { useState, useCallback } from 'react';
import { Input, Select, Slider, Switch, Typography, InputNumber, Button, Collapse, Tooltip, Badge } from 'antd';
import { Node, Edge } from '@xyflow/react';
import {
  EditOutlined,
  SaveOutlined,
  RobotOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  BugOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Define interface for node data
interface NodeData {
  label?: string;
  description?: string;
  inputSource?: string;
  model?: string;
  systemPrompt?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  dbType?: string;
  connectionString?: string;
  query?: string;
  timeout?: number;
  knowledgeBaseId?: string;
  searchQuery?: string;
  topK?: number;
  similarityThreshold?: number;
  condition?: string;
  conditionType?: string;
  trueBranch?: string;
  falseBranch?: string;
  jsonPath?: string;
  extractMode?: string;
  defaultValue?: string;
  responseTemplate?: string;
  responseFormat?: string;
  statusCode?: number;
  [key: string]: any;
}

interface PropertiesPanelProps {
  node: Node | null;
  edges: Edge[];
  onChange: (id: string, data: any) => void;
  onLabelChange: (id: string, label: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ node, edges, onChange, onLabelChange }) => {
  const [debugVisible, setDebugVisible] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>(['basic', 'specific']);

  // 处理面板宽度调整
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(280, Math.min(600, startWidth - (e.clientX - startX)));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelWidth]);

  if (!node) {
    return (
      <div
        className="h-full border-l border-gray-200 bg-white flex flex-col relative"
        style={{ width: panelWidth }}
      >
        {/* 拖拽调整条 */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200 cursor-col-resize hover:bg-blue-400 transition-colors duration-200"
          onMouseDown={handleMouseDown}
        />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <EditOutlined className="text-2xl text-gray-400" />
          </div>
          <Title level={4} className="text-gray-600 mb-2">选择节点编辑</Title>
          <Paragraph type="secondary" className="text-sm max-w-48">
            点击画布中的任意节点即可在此处编辑其属性和配置
          </Paragraph>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-700 space-y-1">
              <div className="font-medium">💡 操作提示:</div>
              <div>• 拖拽左边缘可调整面板宽度</div>
              <div>• 不同节点类型有专属配置项</div>
              <div>• 支持实时预览配置效果</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 类型安全的数据访问
  const nodeData = (node.data || {}) as NodeData;

  // 获取当前节点的连接信息
  const getConnectionInfo = () => {
    const incomingEdges = edges.filter(edge => edge.target === node.id);
    const outgoingEdges = edges.filter(edge => edge.source === node.id);

    return {
      incoming: incomingEdges.map(edge => edge.source),
      outgoing: outgoingEdges.map(edge => edge.target),
      totalConnections: incomingEdges.length + outgoingEdges.length,
      incomingCount: incomingEdges.length,
      outgoingCount: outgoingEdges.length
    };
  };

  // 获取节点类型图标和颜色
  const getNodeTypeInfo = (type: string) => {
    const typeMap: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      aiDialogNode: { icon: <RobotOutlined />, color: '#1677ff', label: 'AI对话' },
      aiSummaryNode: { icon: <RobotOutlined />, color: '#13c2c2', label: 'AI摘要' },
      aiExtractNode: { icon: <RobotOutlined />, color: '#722ed1', label: 'AI提取' },
      aiJsonNode: { icon: <RobotOutlined />, color: '#eb2f96', label: 'AI JSON' },
      databaseNode: { icon: <DatabaseOutlined />, color: '#52c41a', label: '数据库' },
      knowledgeBaseNode: { icon: <CloudOutlined />, color: '#faad14', label: '知识库' },
      bingNode: { icon: <CloudOutlined />, color: '#f5222d', label: '必应搜索' },
      responseNode: { icon: <EditOutlined />, color: '#13c2c2', label: '响应输出' },
      startNode: { icon: <EditOutlined />, color: '#52c41a', label: '开始' },
      endNode: { icon: <EditOutlined />, color: '#f5222d', label: '结束' },
      default: { icon: <SettingOutlined />, color: '#8c8c8c', label: '基础节点' }
    };
    return typeMap[type] || typeMap.default;
  };

  const nodeTypeInfo = getNodeTypeInfo(node.type || '');

  // 处理节点名称更改
  const handleLabelChange = (value: string) => {
    onLabelChange(node.id, value);
  };

  // 处理属性更改
  const handlePropertyChange = (propertyKey: string, value: any) => {
    onChange(node.id, { ...nodeData, [propertyKey]: value });
  };

  // 渲染基础属性编辑器
  const renderBasicProperties = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">节点名称</Text>
          <Tooltip title="为节点设置一个易于识别的名称">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <Input
          value={nodeData.label || ''}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="输入节点名称"
          size="large"
          className="rounded-lg"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">输入参数</Text>
          <Tooltip title="选择此节点的输入数据来源">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.inputSource || 'userInput'}
          onChange={(value) => handlePropertyChange('inputSource', value)}
          className="w-full"
          size="large"
          placeholder="选择输入数据来源"
        >
          <Option value="userInput">
            <div className="py-1">
              <div className="font-medium">用户输入</div>
            </div>
          </Option>
          <Option value="previousResult">
            <div className="py-1">
              <div className="font-medium">上一步结果</div>
            </div>
          </Option>
          <Option value="contextData">
            <div className="py-1">
              <div className="font-medium">上下文数据</div>
            </div>
          </Option>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">节点描述</Text>
            <Tooltip title="详细描述此节点的功能和用途">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">
            {(nodeData.description || '').length}/200
          </Text>
        </div>
        <TextArea
          value={nodeData.description || ''}
          onChange={(e) => handlePropertyChange('description', e.target.value)}
          placeholder="输入节点描述，例如：此节点用于处理用户查询并返回AI回答"
          rows={3}
          className="rounded-lg"
          maxLength={200}
          showCount={false}
        />
        <div className="mt-1 text-xs text-gray-500">
          清晰的描述有助于团队协作和流程维护
        </div>
      </div>
    </div>
  );

  // 渲染AI对话节点属性
  const renderAIDialogProperties = () => (
    <div className="space-y-4">
      {/* AI模型选择 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">AI模型</Text>
            <Tooltip title="选择不同的AI模型会影响响应质量和速度">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <Badge
            count={nodeData.model === 'gpt-4' ? 'PRO' : nodeData.model === 'gpt-4-turbo' ? 'TURBO' : ''}
            color={nodeData.model === 'gpt-4' ? 'gold' : 'blue'}
            size="small"
          />
        </div>
        <Select
          value={nodeData.model || 'gpt-3.5-turbo'}
          onChange={(value) => handlePropertyChange('model', value)}
          className="w-full"
          size="large"
          placeholder="选择AI模型"
        >
          <Option value="gpt-3.5-turbo">
            <div className="py-1">
              <div className="font-medium">GPT-3.5 Turbo</div>
            </div>
          </Option>
          <Option value="gpt-4">
            <div className="py-1">
              <div className="font-medium">GPT-4</div>
            </div>
          </Option>
          <Option value="gpt-4-turbo">
            <div className="py-1">
              <div className="font-medium">GPT-4 Turbo</div>
            </div>
          </Option>
          <Option value="claude-3">
            <div className="py-1">
              <div className="font-medium">Claude-3</div>
            </div>
          </Option>
        </Select>
      </div>

      {/* 系统提示词 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">系统提示词</Text>
            <Tooltip title="定义AI的角色、行为和回答风格">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">
            {(nodeData.systemPrompt || '').length}/2000
          </Text>
        </div>
        <TextArea
          value={nodeData.systemPrompt || ''}
          onChange={(e) => handlePropertyChange('systemPrompt', e.target.value)}
          placeholder="例如：你是一个专业的客服助手，需要友好、耐心地回答用户问题..."
          rows={4}
          className="rounded-lg font-mono text-sm"
          maxLength={2000}
          showCount={false}
        />
      </div>

      {/* 用户消息模板 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">用户消息模板</Text>
            <Tooltip title="用户输入的消息模板，支持变量替换">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">
            {(nodeData.userMessage || '').length}/1000
          </Text>
        </div>
        <TextArea
          value={nodeData.userMessage || ''}
          onChange={(e) => handlePropertyChange('userMessage', e.target.value)}
          placeholder="用户问题：{{input}}\n上下文：{{context}}"
          rows={3}
          className="rounded-lg font-mono text-sm"
          maxLength={1000}
          showCount={false}
        />
        <div className="mt-1 text-xs text-gray-500">
          支持变量：<code className="bg-gray-100 px-1 rounded">{`{{input}}`}</code>、
          <code className="bg-gray-100 px-1 rounded">{`{{context}}`}</code>、
          <code className="bg-gray-100 px-1 rounded">{`{{user}}`}</code>
        </div>
      </div>

      {/* 高级参数 */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <SettingOutlined className="text-gray-600" />
          <Text strong className="text-sm">高级参数</Text>
        </div>

        {/* 创造性调节 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">创造性 (Temperature)</Text>
              <Tooltip title="控制AI回答的随机性，数值越高越创意">
                <InfoCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {nodeData.temperature || 0.7}
            </div>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={nodeData.temperature || 0.7}
            onChange={(value) => handlePropertyChange('temperature', value)}
            marks={{
              0: { label: <span className="text-xs">精确</span>, style: { fontSize: '10px' } },
              0.5: { label: <span className="text-xs">平衡</span>, style: { fontSize: '10px' } },
              1: { label: <span className="text-xs">创意</span>, style: { fontSize: '10px' } }
            }}
            tooltip={{
              formatter: (value) => {
                if (!value) return '0.7';
                if (value < 0.3) return `${value} - 更精确`;
                if (value > 0.7) return `${value} - 更创意`;
                return `${value} - 平衡`;
              }
            }}
            trackStyle={{ backgroundColor: '#1677ff' }}
            handleStyle={{ borderColor: '#1677ff' }}
          />
        </div>

        {/* 最大令牌数 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">最大令牌数</Text>
              <Tooltip title="控制AI回答的最大长度">
                <InfoCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            </div>
            <Text className="text-xs text-gray-500">
              约 {Math.round((nodeData.maxTokens || 1000) * 0.75)} 字
            </Text>
          </div>
          <InputNumber
            min={1}
            max={4000}
            value={nodeData.maxTokens || 1000}
            onChange={(value) => handlePropertyChange('maxTokens', value)}
            className="w-full"
            placeholder="1000"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            size="large"
            addonAfter="tokens"
          />
        </div>

        {/* 流式输出 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Text strong className="text-sm">流式输出</Text>
              <Tooltip title="是否逐字输出响应结果">
                <InfoCircleOutlined className="text-gray-400 text-xs" />
              </Tooltip>
            </div>
            <Text className="text-xs text-gray-500">
              {nodeData.stream ? '已启用' : '已禁用'}
            </Text>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <Text className="text-sm font-medium">
                {nodeData.stream ? '逐字输出' : '完整输出'}
              </Text>
              <div className="text-xs text-gray-500 mt-1">
                {nodeData.stream
                  ? '启用后将实时显示AI生成的内容'
                  : '等待AI完成后一次性显示完整回答'
                }
              </div>
            </div>
            <Switch
              checked={nodeData.stream || false}
              onChange={(checked) => handlePropertyChange('stream', checked)}
              size="default"
            />
          </div>
        </div>

        {/* 配置预设 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Text strong className="text-sm">快速配置</Text>
            <Tooltip title="使用预设配置快速设置参数">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="small"
              type={nodeData.temperature === 0.1 && nodeData.maxTokens === 500 ? "primary" : "default"}
              onClick={() => {
                handlePropertyChange('temperature', 0.1);
                handlePropertyChange('maxTokens', 500);
                handlePropertyChange('stream', false);
              }}
              className="text-xs"
            >
              精确模式
            </Button>
            <Button
              size="small"
              type={nodeData.temperature === 0.7 && nodeData.maxTokens === 1000 ? "primary" : "default"}
              onClick={() => {
                handlePropertyChange('temperature', 0.7);
                handlePropertyChange('maxTokens', 1000);
                handlePropertyChange('stream', false);
              }}
              className="text-xs"
            >
              平衡模式
            </Button>
            <Button
              size="small"
              type={nodeData.temperature === 0.9 && nodeData.maxTokens === 2000 ? "primary" : "default"}
              onClick={() => {
                handlePropertyChange('temperature', 0.9);
                handlePropertyChange('maxTokens', 2000);
                handlePropertyChange('stream', true);
              }}
              className="text-xs"
            >
              创意模式
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染数据库节点属性
  const renderDatabaseProperties = () => (
    <div className="space-y-4">
      {/* 数据库类型 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">数据库类型</Text>
          <Tooltip title="选择要连接的数据库类型">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.dbType || 'mysql'}
          onChange={(value) => handlePropertyChange('dbType', value)}
          className="w-full"
          size="large"
          placeholder="选择数据库类型"
        >
          <Option value="mysql">MySQL</Option>
          <Option value="postgresql">PostgreSQL</Option>
          <Option value="mongodb">MongoDB</Option>
          <Option value="redis">Redis</Option>
        </Select>
      </div>

      {/* 连接字符串 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">连接字符串</Text>
          <Tooltip title="数据库连接配置">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.connectionString || ''}
          onChange={(e) => handlePropertyChange('connectionString', e.target.value)}
          placeholder="例如：mysql://user:password@host:port/database"
          rows={2}
          className="rounded-lg font-mono text-sm"
        />
      </div>

      {/* SQL查询 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">SQL查询</Text>
          <Tooltip title="要执行的SQL查询语句">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.query || ''}
          onChange={(e) => handlePropertyChange('query', e.target.value)}
          placeholder="SELECT * FROM users WHERE id = ?"
          rows={4}
          className="rounded-lg font-mono text-sm"
        />
      </div>
    </div>
  );

  // 渲染知识库节点属性
  const renderKnowledgeBaseProperties = () => (
    <div className="space-y-4">
      {/* 知识库选择 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">知识库</Text>
          <Tooltip title="选择要查询的知识库">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.knowledgeBaseId || ''}
          onChange={(value) => handlePropertyChange('knowledgeBaseId', value)}
          className="w-full"
          size="large"
          placeholder="选择知识库"
        >
          <Option value="kb1">产品知识库</Option>
          <Option value="kb2">技术文档库</Option>
          <Option value="kb3">FAQ知识库</Option>
        </Select>
      </div>

      {/* 检索参数 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">返回数量 (Top-K)</Text>
            <Tooltip title="检索结果的最大数量">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">{nodeData.topK || 5} 条</Text>
        </div>
        <Slider
          min={1}
          max={20}
          value={nodeData.topK || 5}
          onChange={(value) => handlePropertyChange('topK', value)}
          marks={{ 1: '1', 5: '5', 10: '10', 20: '20' }}
        />
      </div>

      {/* 相似度阈值 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Text strong className="text-sm">相似度阈值</Text>
            <Tooltip title="只返回相似度高于此阈值的结果">
              <InfoCircleOutlined className="text-gray-400 text-xs" />
            </Tooltip>
          </div>
          <Text className="text-xs text-gray-500">{nodeData.similarityThreshold || 0.7}</Text>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={nodeData.similarityThreshold || 0.7}
          onChange={(value) => handlePropertyChange('similarityThreshold', value)}
          marks={{ 0: '0', 0.5: '0.5', 1: '1' }}
        />
      </div>
    </div>
  );

  // 渲染条件节点属性
  const renderConditionProperties = () => (
    <div className="space-y-4">
      {/* 条件类型 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">条件类型</Text>
          <Tooltip title="选择条件判断的方式">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.conditionType || 'javascript'}
          onChange={(value) => handlePropertyChange('conditionType', value)}
          className="w-full"
          size="large"
        >
          <Option value="javascript">JavaScript表达式</Option>
          <Option value="jsonpath">JSONPath</Option>
          <Option value="simple">简单比较</Option>
        </Select>
      </div>

      {/* 条件表达式 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">条件表达式</Text>
          <Tooltip title="输入条件判断表达式">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.condition || ''}
          onChange={(e) => handlePropertyChange('condition', e.target.value)}
          placeholder="例如：input.value > 0"
          rows={3}
          className="rounded-lg font-mono text-sm"
        />
      </div>
    </div>
  );

  // 渲染响应节点属性
  const renderResponseProperties = () => (
    <div className="space-y-4">
      {/* 响应格式 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">响应格式</Text>
          <Tooltip title="选择响应数据的格式">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <Select
          value={nodeData.responseFormat || 'json'}
          onChange={(value) => handlePropertyChange('responseFormat', value)}
          className="w-full"
          size="large"
        >
          <Option value="json">JSON</Option>
          <Option value="text">纯文本</Option>
          <Option value="html">HTML</Option>
          <Option value="markdown">Markdown</Option>
        </Select>
      </div>

      {/* 响应模板 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">响应模板</Text>
          <Tooltip title="定义响应内容的模板">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <TextArea
          value={nodeData.responseTemplate || ''}
          onChange={(e) => handlePropertyChange('responseTemplate', e.target.value)}
          placeholder="例如：处理结果：{{result}}"
          rows={4}
          className="rounded-lg font-mono text-sm"
        />
      </div>

      {/* HTTP状态码 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Text strong className="text-sm">HTTP状态码</Text>
          <Tooltip title="设置响应的HTTP状态码">
            <InfoCircleOutlined className="text-gray-400 text-xs" />
          </Tooltip>
        </div>
        <InputNumber
          min={200}
          max={599}
          value={nodeData.statusCode || 200}
          onChange={(value) => handlePropertyChange('statusCode', value)}
          className="w-full"
          size="large"
        />
      </div>
    </div>
  );

  const renderSpecificProperties = () => {
    switch (node.type) {
      case 'aiDialogNode':
      case 'aiSummaryNode':
      case 'aiExtractNode':
      case 'aiJsonNode':
        return renderAIDialogProperties();
      case 'databaseNode':
        return renderDatabaseProperties();
      case 'knowledgeBaseNode':
        return renderKnowledgeBaseProperties();
      case 'conditionNode':
        return renderConditionProperties();
      case 'responseNode':
        return renderResponseProperties();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <SettingOutlined className="text-2xl mb-2" />
            <div>此节点类型暂无特殊配置</div>
          </div>
        );
    }
  };

  return (
    <div
      className="h-full border-l border-gray-200 bg-white flex flex-col relative"
      style={{ width: panelWidth }}
    >
      {/* 拖拽调整条 */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors duration-200 ${isResizing ? 'bg-blue-500' : 'bg-gray-200 hover:bg-blue-400'
          }`}
        onMouseDown={handleMouseDown}
      />

      {/* 面板头部 */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: nodeTypeInfo.color }}
            >
              {nodeTypeInfo.icon}
            </div>
            <div>
              <Title level={5} className="m-0">{nodeTypeInfo.label}</Title>
              <Text type="secondary" className="text-xs">
                {nodeData.label || `未命名${nodeTypeInfo.label}`}
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip title={debugVisible ? "隐藏调试信息" : "显示调试信息"}>
              <Button
                type="text"
                size="small"
                icon={debugVisible ? <EyeInvisibleOutlined /> : <BugOutlined />}
                onClick={() => setDebugVisible(!debugVisible)}
              />
            </Tooltip>
            <Tooltip title="保存配置">
              <Button
                type="text"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => console.log('Save configuration')}
              />
            </Tooltip>
          </div>
        </div>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Collapse
            activeKey={activeCollapseKeys}
            onChange={(keys) => setActiveCollapseKeys(keys as string[])}
            ghost
            size="small"
          >
            {/* 基础属性 */}
            <Panel header="基础属性" key="basic">
              {renderBasicProperties()}
            </Panel>

            {/* 特定属性 */}
            <Panel header="节点配置" key="specific">
              {renderSpecificProperties()}
            </Panel>

            {/* 调试信息 */}
            {debugVisible && (
              <Panel header="调试信息" key="debug">
                <div className="space-y-3">
                  <div>
                    <Text strong className="text-sm">节点数据:</Text>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40 mt-1">
                      {JSON.stringify(nodeData, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <Text strong className="text-sm">连接信息:</Text>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40 mt-1">
                      {JSON.stringify(getConnectionInfo(), null, 2)}
                    </pre>
                  </div>
                </div>
              </Panel>
            )}
          </Collapse>
        </div>
      </div>

      {/* 面板底部 */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          宽度: {panelWidth}px | 节点类型: {node.type}
        </div>
      </div>
    </div>
  )
};

export default PropertiesPanel;
