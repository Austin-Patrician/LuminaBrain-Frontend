import React from 'react';
import { Input, Select, Slider, Switch, Card, Typography, Space, InputNumber, Button } from 'antd';
import { Node, Edge } from '@xyflow/react';
import { EditOutlined, SaveOutlined, RobotOutlined, DatabaseOutlined, CloudOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Define interface for node data
interface NodeData {
  label?: string;
  description?: string;
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
  if (!node) {
    return (
      <Card className="h-full">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <EditOutlined className="text-4xl mb-4" />
          <Text>请选择一个节点来编辑属性</Text>
        </div>
      </Card>
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
    <Card title="基础属性" size="small" className="mb-4">
      <Space direction="vertical" className="w-full">
        <div>
          <Text strong>节点名称</Text>
          <Input
            value={nodeData.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="请输入节点名称"
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>节点类型</Text>
          <Input
            value={node.type || 'unknown'}
            disabled
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>节点ID</Text>
          <Input
            value={node.id}
            disabled
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>描述</Text>
          <TextArea
            value={nodeData.description || ''}
            onChange={(e) => handlePropertyChange('description', e.target.value)}
            placeholder="请输入节点描述"
            rows={2}
            className="mt-1"
          />
        </div>
      </Space>
    </Card>
  );

  // 渲染AI对话节点属性
  const renderAIDialogProperties = () => (
    <Card title={
      <div className="flex items-center gap-2">
        <RobotOutlined className="text-blue-500" />
        <span>AI对话设置</span>
      </div>
    } size="small" className="mb-4">
      <Space direction="vertical" className="w-full" size="small">
        <div>
          <Text strong className="text-sm">AI模型</Text>
          <Select
            value={nodeData.model || 'gpt-3.5-turbo'}
            onChange={(value) => handlePropertyChange('model', value)}
            className="w-full mt-1"
            placeholder="选择AI模型"
          >
            <Option value="gpt-3.5-turbo">
              <div className="flex items-center justify-between">
                <span>GPT-3.5 Turbo</span>
                <span className="text-xs text-green-600">快速</span>
              </div>
            </Option>
            <Option value="gpt-4">
              <div className="flex items-center justify-between">
                <span>GPT-4</span>
                <span className="text-xs text-blue-600">平衡</span>
              </div>
            </Option>
            <Option value="gpt-4-turbo">
              <div className="flex items-center justify-between">
                <span>GPT-4 Turbo</span>
                <span className="text-xs text-purple-600">强大</span>
              </div>
            </Option>
            <Option value="claude-3">
              <div className="flex items-center justify-between">
                <span>Claude-3</span>
                <span className="text-xs text-orange-600">专业</span>
              </div>
            </Option>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Text strong className="text-sm">系统提示词</Text>
            <Text className="text-xs text-gray-500">
              {(nodeData.systemPrompt || '').length}/2000
            </Text>
          </div>
          <TextArea
            value={nodeData.systemPrompt || ''}
            onChange={(e) => handlePropertyChange('systemPrompt', e.target.value)}
            placeholder="定义AI的角色和行为规则，例如：你是一个专业的客服助手..."
            rows={3}
            className="mt-1"
            maxLength={2000}
            showCount={false}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Text strong className="text-sm">用户消息模板</Text>
            <Text className="text-xs text-gray-500">
              {(nodeData.userMessage || '').length}/1000
            </Text>
          </div>
          <TextArea
            value={nodeData.userMessage || ''}
            onChange={(e) => handlePropertyChange('userMessage', e.target.value)}
            placeholder="用户输入的消息模板，支持变量：{{input}}, {{context}}..."
            rows={2}
            className="mt-1"
            maxLength={1000}
            showCount={false}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Text strong className="text-sm">创造性 (Temperature)</Text>
            <Text className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded">
              {nodeData.temperature || 0.7}
            </Text>
          </div>
          <div className="px-1">
            <Slider
              min={0}
              max={2}
              step={0.1}
              value={nodeData.temperature || 0.7}
              onChange={(value) => handlePropertyChange('temperature', value)}
              marks={{
                0: { label: '精确', style: { fontSize: '10px' } },
                1: { label: '平衡', style: { fontSize: '10px' } },
                2: { label: '创意', style: { fontSize: '10px' } }
              }}
              tooltip={{
                formatter: (value) => value ? `${value} - ${value < 0.3 ? '更精确' : value > 1.5 ? '更创意' : '平衡'}` : '0.7'
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Text strong className="text-sm">最大令牌数</Text>
            <InputNumber
              min={1}
              max={4000}
              value={nodeData.maxTokens || 1000}
              onChange={(value) => handlePropertyChange('maxTokens', value)}
              className="w-full mt-1"
              placeholder="1000"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
            <Text className="text-xs text-gray-500">约 {Math.round((nodeData.maxTokens || 1000) * 0.75)} 字</Text>
          </div>

          <div>
            <Text strong className="text-sm">流式输出</Text>
            <div className="mt-1 flex items-center gap-2">
              <Switch
                checked={nodeData.stream || false}
                onChange={(checked) => handlePropertyChange('stream', checked)}
                size="small"
              />
              <Text className="text-xs text-gray-500">
                {nodeData.stream ? '逐字输出' : '完整输出'}
              </Text>
            </div>
          </div>
        </div>

        {/* 预设模板快捷选择 */}
        <div>
          <Text strong className="text-sm mb-2 block">快捷模板</Text>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('systemPrompt', '你是一个专业的客服助手，友好、耐心地回答用户问题。');
                handlePropertyChange('userMessage', '用户问题：{{input}}');
              }}
            >
              客服助手
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('systemPrompt', '你是一个内容总结专家，能够提取关键信息并生成简洁的摘要。');
                handlePropertyChange('userMessage', '请总结以下内容：{{input}}');
              }}
            >
              内容总结
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('systemPrompt', '你是一个翻译专家，提供准确、自然的翻译服务。');
                handlePropertyChange('userMessage', '请翻译：{{input}}');
              }}
            >
              翻译助手
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('systemPrompt', '你是一个代码分析专家，能够解释代码功能并提供优化建议。');
                handlePropertyChange('userMessage', '请分析这段代码：{{input}}');
              }}
            >
              代码分析
            </Button>
          </div>
        </div>
      </Space>
    </Card>
  );

  // 渲染数据库节点属性
  const renderDatabaseProperties = () => (
    <Card title={
      <div className="flex items-center gap-2">
        <DatabaseOutlined className="text-teal-500" />
        <span>数据库设置</span>
      </div>
    } size="small" className="mb-4">
      <Space direction="vertical" className="w-full" size="small">
        <div>
          <Text strong className="text-sm">数据库类型</Text>
          <Select
            value={nodeData.dbType || 'mysql'}
            onChange={(value) => handlePropertyChange('dbType', value)}
            className="w-full mt-1"
            placeholder="选择数据库类型"
          >
            <Option value="mysql">
              <div className="flex items-center justify-between">
                <span>MySQL</span>
                <span className="text-xs text-blue-600">关系型</span>
              </div>
            </Option>
            <Option value="postgresql">
              <div className="flex items-center justify-between">
                <span>PostgreSQL</span>
                <span className="text-xs text-green-600">高级关系型</span>
              </div>
            </Option>
            <Option value="mongodb">
              <div className="flex items-center justify-between">
                <span>MongoDB</span>
                <span className="text-xs text-orange-600">文档型</span>
              </div>
            </Option>
            <Option value="redis">
              <div className="flex items-center justify-between">
                <span>Redis</span>
                <span className="text-xs text-red-600">缓存</span>
              </div>
            </Option>
          </Select>
        </div>

        <div>
          <Text strong className="text-sm">连接字符串</Text>
          <Input.Password
            value={nodeData.connectionString || ''}
            onChange={(e) => handlePropertyChange('connectionString', e.target.value)}
            placeholder="mysql://user:password@host:port/database"
            className="mt-1"
            visibilityToggle
          />
          <Text className="text-xs text-gray-500 mt-1">
            连接信息将被安全存储
          </Text>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Text strong className="text-sm">SQL查询</Text>
            <Text className="text-xs text-gray-500">
              {(nodeData.query || '').length}/2000
            </Text>
          </div>
          <TextArea
            value={nodeData.query || ''}
            onChange={(e) => handlePropertyChange('query', e.target.value)}
            placeholder="SELECT * FROM users WHERE id = {{userId}}"
            rows={4}
            className="mt-1 font-mono text-sm"
            maxLength={2000}
          />
          <Text className="text-xs text-gray-500 mt-1">
            支持变量：{`{{ userId }}, {{ input }}`} 等
          </Text>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Text strong className="text-sm">超时时间</Text>
            <InputNumber
              min={1}
              max={300}
              value={nodeData.timeout || 30}
              onChange={(value) => handlePropertyChange('timeout', value)}
              className="w-full mt-1"
              addonAfter="秒"
            />
          </div>

          <div>
            <Text strong className="text-sm">连接池</Text>
            <InputNumber
              min={1}
              max={100}
              value={nodeData.maxConnections || 10}
              onChange={(value) => handlePropertyChange('maxConnections', value)}
              className="w-full mt-1"
              placeholder="10"
            />
          </div>
        </div>

        {/* 快捷SQL模板 */}
        <div>
          <Text strong className="text-sm mb-2 block">快捷模板</Text>
          <div className="grid grid-cols-1 gap-2">
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('query', 'SELECT * FROM users WHERE id = {{userId}}');
              }}
            >
              用户查询
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('query', 'INSERT INTO logs (message, created_at) VALUES ({{message}}, NOW())');
              }}
            >
              插入日志
            </Button>
          </div>
        </div>
      </Space>
    </Card>
  );

  // 渲染知识库节点属性
  const renderKnowledgeBaseProperties = () => (
    <Card title={
      <div className="flex items-center gap-2">
        <CloudOutlined className="text-lime-500" />
        <span>知识库设置</span>
      </div>
    } size="small" className="mb-4">
      <Space direction="vertical" className="w-full" size="small">
        <div>
          <Text strong className="text-sm">知识库ID</Text>
          <Input
            value={nodeData.knowledgeBaseId || ''}
            onChange={(e) => handlePropertyChange('knowledgeBaseId', e.target.value)}
            placeholder="输入知识库标识符"
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Text strong className="text-sm">搜索查询</Text>
            <Text className="text-xs text-gray-500">
              {(nodeData.searchQuery || '').length}/500
            </Text>
          </div>
          <TextArea
            value={nodeData.searchQuery || ''}
            onChange={(e) => handlePropertyChange('searchQuery', e.target.value)}
            placeholder="搜索关键词或问题，支持变量：{{input}}, {{query}}"
            rows={2}
            className="mt-1"
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Text strong className="text-sm">返回结果数</Text>
            <InputNumber
              min={1}
              max={50}
              value={nodeData.topK || 5}
              onChange={(value) => handlePropertyChange('topK', value)}
              className="w-full mt-1"
              addonAfter="条"
            />
          </div>

          <div>
            <Text strong className="text-sm">相似度阈值</Text>
            <div className="mt-1">
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                value={nodeData.similarityThreshold || 0.7}
                onChange={(value) => handlePropertyChange('similarityThreshold', value)}
                className="w-full"
                formatter={(value) => `${value}`}
              />
            </div>
          </div>
        </div>

        <div>
          <Text strong className="text-sm mb-2 block">相似度调节</Text>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={nodeData.similarityThreshold || 0.7}
            onChange={(value) => handlePropertyChange('similarityThreshold', value)}
            marks={{
              0: { label: '宽松', style: { fontSize: '10px' } },
              0.5: { label: '适中', style: { fontSize: '10px' } },
              1: { label: '严格', style: { fontSize: '10px' } }
            }}
            tooltip={{
              formatter: (value) => value ? `${value} - ${value < 0.3 ? '宽松匹配' : value > 0.8 ? '严格匹配' : '适中匹配'}` : '0.7'
            }}
          />
        </div>

        {/* 快捷配置 */}
        <div>
          <Text strong className="text-sm mb-2 block">快捷配置</Text>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('topK', 3);
                handlePropertyChange('similarityThreshold', 0.8);
              }}
            >
              精确搜索
            </Button>
            <Button
              size="small"
              type="dashed"
              onClick={() => {
                handlePropertyChange('topK', 10);
                handlePropertyChange('similarityThreshold', 0.5);
              }}
            >
              广泛搜索
            </Button>
          </div>
        </div>
      </Space>
    </Card>
  );

  // 渲染条件节点属性
  const renderConditionProperties = () => (
    <Card title="条件设置" size="small" className="mb-4">
      <Space direction="vertical" className="w-full">
        <div>
          <Text strong>条件表达式</Text>
          <TextArea
            value={nodeData.condition || ''}
            onChange={(e) => handlePropertyChange('condition', e.target.value)}
            placeholder="请输入条件表达式，如: input.length > 0"
            rows={2}
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>条件类型</Text>
          <Select
            value={nodeData.conditionType || 'javascript'}
            onChange={(value) => handlePropertyChange('conditionType', value)}
            className="w-full mt-1"
          >
            <Option value="javascript">JavaScript表达式</Option>
            <Option value="jsonpath">JSONPath</Option>
            <Option value="regex">正则表达式</Option>
          </Select>
        </div>

        <div>
          <Text strong>真值分支</Text>
          <Input
            value={nodeData.trueBranch || ''}
            onChange={(e) => handlePropertyChange('trueBranch', e.target.value)}
            placeholder="条件为真时的输出"
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>假值分支</Text>
          <Input
            value={nodeData.falseBranch || ''}
            onChange={(e) => handlePropertyChange('falseBranch', e.target.value)}
            placeholder="条件为假时的输出"
            className="mt-1"
          />
        </div>
      </Space>
    </Card>
  );

  // 渲染JSON提取器属性
  const renderJsonExtractorProperties = () => (
    <Card title="JSON提取设置" size="small" className="mb-4">
      <Space direction="vertical" className="w-full">
        <div>
          <Text strong>JSONPath表达式</Text>
          <Input
            value={nodeData.jsonPath || ''}
            onChange={(e) => handlePropertyChange('jsonPath', e.target.value)}
            placeholder="如: $.data.items[*].name"
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>提取模式</Text>
          <Select
            value={nodeData.extractMode || 'single'}
            onChange={(value) => handlePropertyChange('extractMode', value)}
            className="w-full mt-1"
          >
            <Option value="single">单个值</Option>
            <Option value="array">数组</Option>
            <Option value="object">对象</Option>
          </Select>
        </div>

        <div>
          <Text strong>默认值</Text>
          <Input
            value={nodeData.defaultValue || ''}
            onChange={(e) => handlePropertyChange('defaultValue', e.target.value)}
            placeholder="提取失败时的默认值"
            className="mt-1"
          />
        </div>
      </Space>
    </Card>
  );

  // 渲染响应节点属性
  const renderResponseProperties = () => (
    <Card title="响应设置" size="small" className="mb-4">
      <Space direction="vertical" className="w-full">
        <div>
          <Text strong>响应模板</Text>
          <TextArea
            value={nodeData.responseTemplate || ''}
            onChange={(e) => handlePropertyChange('responseTemplate', e.target.value)}
            placeholder="请输入响应模板，支持变量替换"
            rows={4}
            className="mt-1"
          />
        </div>

        <div>
          <Text strong>响应格式</Text>
          <Select
            value={nodeData.responseFormat || 'text'}
            onChange={(value) => handlePropertyChange('responseFormat', value)}
            className="w-full mt-1"
          >
            <Option value="text">纯文本</Option>
            <Option value="json">JSON</Option>
            <Option value="markdown">Markdown</Option>
            <Option value="html">HTML</Option>
          </Select>
        </div>

        <div>
          <Text strong>状态码</Text>
          <InputNumber
            min={100}
            max={599}
            value={nodeData.statusCode || 200}
            onChange={(value) => handlePropertyChange('statusCode', value)}
            className="w-full mt-1"
          />
        </div>
      </Space>
    </Card>
  );

  // 根据节点类型渲染特定属性
  const renderNodeSpecificProperties = () => {
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
      case 'decisionNode':
      case 'conditionNode':
        return renderConditionProperties();
      case 'jsonExtractor':
        return renderJsonExtractorProperties();
      case 'responseNode':
        return renderResponseProperties();
      default:
        return (
          <Card title="自定义属性" size="small" className="mb-4">
            <Space direction="vertical" className="w-full">
              <div>
                <Text strong>配置JSON</Text>
                <TextArea
                  value={JSON.stringify(node.data, null, 2)}
                  onChange={(e) => {
                    try {
                      const newData = JSON.parse(e.target.value);
                      onChange(node.id, newData);
                    } catch (error) {
                      // 忽略JSON解析错误，让用户继续编辑
                    }
                  }}
                  rows={10}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </Space>
          </Card>
        );
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <Title level={4} className="m-0">节点属性</Title>
        <Button
          type="primary"
          size="small"
          icon={<SaveOutlined />}
          onClick={() => {
            // 这里可以添加保存逻辑
            console.log('保存节点配置:', node);
          }}
        >
          保存
        </Button>
      </div>

      {renderBasicProperties()}
      {renderNodeSpecificProperties()}

      {/* 调试信息 */}
      <Card title="调试信息" size="small" className="mb-4">
        <Space direction="vertical" className="w-full" size="small">
          {/* 整合的节点信息 */}
          <div>
            <Text strong>节点概览</Text>
            <div className="bg-gray-50 p-3 rounded mt-1 space-y-2">
              {/* 基本信息行 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-gray-600">ID:</span>
                  <span className="ml-1 font-mono text-gray-800">{node.id.slice(0, 8)}...</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">类型:</span>
                  <span className="ml-1 text-blue-600">{node.type}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">位置:</span>
                  <span className="ml-1 text-gray-800">({Math.round(node.position.x)}, {Math.round(node.position.y)})</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">可删除:</span>
                  <span className={`ml-1 ${node.deletable !== false ? 'text-green-600' : 'text-red-600'}`}>
                    {node.deletable !== false ? '是' : '否'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 连接信息 */}
          <div>
            <Text strong>连接状态</Text>
            <div className="bg-green-50 p-3 rounded mt-1">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-700">入连接</div>
                  <div className="text-lg font-bold text-green-600">{getConnectionInfo().incomingCount}</div>
                  {getConnectionInfo().incoming.length > 0 && (
                    <div className="text-gray-600 mt-1">
                      {getConnectionInfo().incoming.map(id => (
                        <div key={id} className="font-mono text-xs">{id.slice(0, 8)}...</div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium text-blue-700">总连接</div>
                  <div className="text-lg font-bold text-blue-600">{getConnectionInfo().totalConnections}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-orange-700">出连接</div>
                  <div className="text-lg font-bold text-orange-600">{getConnectionInfo().outgoingCount}</div>
                  {getConnectionInfo().outgoing.length > 0 && (
                    <div className="text-gray-600 mt-1">
                      {getConnectionInfo().outgoing.map(id => (
                        <div key={id} className="font-mono text-xs">{id.slice(0, 8)}...</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 配置属性摘要 */}
          <div>
            <Text strong>配置摘要</Text>
            <div className="bg-blue-50 p-3 rounded mt-1">
              {Object.keys(node.data || {}).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(node.data || {}).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-blue-700 truncate max-w-20">{key}:</span>
                      <span className="text-gray-600 truncate max-w-32 text-right">
                        {typeof value === 'object'
                          ? JSON.stringify(value).slice(0, 20) + '...'
                          : String(value).slice(0, 20) + (String(value).length > 20 ? '...' : '')
                        }
                      </span>
                    </div>
                  ))}
                  {Object.keys(node.data || {}).length > 4 && (
                    <div className="text-xs text-gray-500 text-center pt-1 border-t">
                      还有 {Object.keys(node.data || {}).length - 4} 个配置项...
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 text-center py-2">
                  暂无配置属性
                </div>
              )}
            </div>
          </div>

          {/* 展开查看完整信息 */}
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800 select-none">
              <span className="font-medium">🔍 展开查看完整调试数据</span>
            </summary>
            <div className="mt-2">
              <div>
                <Text className="text-xs font-medium text-gray-700">完整节点信息:</Text>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40 mt-1 font-mono">
                  {JSON.stringify({
                    // 节点基本信息
                    nodeInfo: {
                      id: node.id,
                      type: node.type,
                      position: node.position,
                      deletable: node.deletable,
                      connectable: node.connectable,
                      selectable: node.selectable,
                      draggable: node.draggable
                    },
                    // 节点配置数据
                    nodeData: node.data,
                    // 连接信息
                    connections: getConnectionInfo()
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </Space>
      </Card>
    </div>
  );
};

export default PropertiesPanel;
