import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Popconfirm,
  Empty,
  Tooltip,
  Collapse,
  Tree,
  Badge
} from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  DownOutlined,
  FileTextOutlined,
  FunctionOutlined,
  NumberOutlined,
  BooleanOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface WatchVariable {
  id: string;
  expression: string;
  value: any;
  type: string;
  lastUpdated: number;
  nodeId?: string;
  error?: string;
}

interface VariableWatcherProps {
  variables: WatchVariable[];
  currentNodeId?: string;
  currentData?: Record<string, any>;
  onAddVariable: (expression: string, nodeId?: string) => void;
  onRemoveVariable: (id: string) => void;
  onRefreshVariable: (id: string) => void;
  onRefreshAll: () => void;
}

const VariableWatcher: React.FC<VariableWatcherProps> = ({
  variables,
  currentNodeId,
  currentData,
  onAddVariable,
  onRemoveVariable,
  onRefreshVariable,
  onRefreshAll
}) => {
  const [newExpression, setNewExpression] = useState('');
  const [selectedScope, setSelectedScope] = useState<'current' | 'global'>('current');

  const handleAddVariable = () => {
    if (!newExpression.trim()) return;

    const nodeId = selectedScope === 'current' ? currentNodeId : undefined;
    onAddVariable(newExpression.trim(), nodeId);
    setNewExpression('');
  };

  const formatValue = (value: any, type: string): React.ReactNode => {
    if (value === null) return <Text type="secondary">null</Text>;
    if (value === undefined) return <Text type="secondary">undefined</Text>;

    switch (type) {
      case 'string':
        return (
          <Text code className="text-green-600">
            "{String(value)}"
          </Text>
        );
      case 'number':
        return (
          <Text className="text-blue-600 font-mono">
            {String(value)}
          </Text>
        );
      case 'boolean':
        return (
          <Text className={value ? 'text-green-600' : 'text-red-600'} strong>
            {String(value)}
          </Text>
        );
      case 'object':
        return (
          <details className="cursor-pointer">
            <summary className="text-purple-600 font-mono">
              {Array.isArray(value) ? `Array(${value.length})` : 'Object'}
            </summary>
            <pre className="mt-2 p-2 bg-gray-50 border rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(value, null, 2)}
            </pre>
          </details>
        );
      case 'function':
        return (
          <Text className="text-orange-600 font-mono">
            function {value.name || 'anonymous'}()
          </Text>
        );
      default:
        return (
          <Text code className="text-gray-600">
            {String(value)}
          </Text>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'string': return <FileTextOutlined className="text-green-500" />;
      case 'number': return <NumberOutlined className="text-blue-500" />;
      case 'boolean': return <BooleanOutlined className="text-purple-500" />;
      case 'object': return <UnorderedListOutlined className="text-orange-500" />;
      case 'function': return <FunctionOutlined className="text-red-500" />;
      default: return <FileTextOutlined className="text-gray-500" />;
    }
  };

  const currentScopeVariables = variables.filter(v => v.nodeId === currentNodeId);
  const globalScopeVariables = variables.filter(v => !v.nodeId);

  return (
    <Card
      size="small"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-blue-500" />
            <span>变量监视器</span>
            <Badge count={variables.length} showZero color="blue" />
          </div>
          {variables.length > 0 && (
            <Tooltip title="刷新全部变量">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRefreshAll}
              >
                刷新
              </Button>
            </Tooltip>
          )}
        </div>
      }
      className="variable-watcher"
    >
      {/* 添加变量 */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="输入变量表达式 (如: input.data, output.result)"
            value={newExpression}
            onChange={(e) => setNewExpression(e.target.value)}
            onPressEnter={handleAddVariable}
            className="flex-1"
          />
          <Select
            value={selectedScope}
            onChange={setSelectedScope}
            className="w-24"
          >
            <Select.Option value="current">当前</Select.Option>
            <Select.Option value="global">全局</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddVariable}
            disabled={!newExpression.trim()}
          >
            监视
          </Button>
        </div>

        <div className="text-xs text-gray-500">
          💡 表达式示例: input.text, output.length, data[0].name, Math.random()
        </div>
      </div>

      {/* 变量列表 */}
      {variables.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无监视变量"
          className="py-4"
        />
      ) : (
        <Collapse
          defaultActiveKey={['current']}
          ghost
          expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
        >
          {/* 当前节点作用域 */}
          {currentNodeId && (
            <Panel
              header={
                <div className="flex items-center gap-2">
                  <Text strong>当前节点作用域</Text>
                  <Badge count={currentScopeVariables.length} showZero />
                  <Text className="text-xs text-gray-500">({currentNodeId})</Text>
                </div>
              }
              key="current"
            >
              {currentScopeVariables.length === 0 ? (
                <Text type="secondary" className="text-sm">
                  当前节点没有监视变量
                </Text>
              ) : (
                <List
                  size="small"
                  dataSource={currentScopeVariables}
                  renderItem={variable => (
                    <List.Item
                      className="px-3 py-2 border border-gray-200 rounded mb-2"
                      actions={[
                        <Tooltip title="刷新变量值">
                          <Button
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={() => onRefreshVariable(variable.id)}
                          />
                        </Tooltip>,
                        <Tooltip title="删除监视">
                          <Popconfirm
                            title="确定要删除此监视变量吗？"
                            onConfirm={() => onRemoveVariable(variable.id)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Tooltip>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={getTypeIcon(variable.type)}
                        title={
                          <div className="flex items-center gap-2">
                            <Text code className="text-sm">{variable.expression}</Text>
                            <Tag color="blue">{variable.type}</Tag>
                          </div>
                        }
                        description={
                          <div className="space-y-2">
                            {variable.error ? (
                              <Text type="danger" className="text-xs">
                                错误: {variable.error}
                              </Text>
                            ) : (
                              <div className="text-sm">
                                {formatValue(variable.value, variable.type)}
                              </div>
                            )}
                            <Text className="text-xs text-gray-400">
                              更新时间: {new Date(variable.lastUpdated).toLocaleString()}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Panel>
          )}

          {/* 全局作用域 */}
          <Panel
            header={
              <div className="flex items-center gap-2">
                <Text strong>全局作用域</Text>
                <Badge count={globalScopeVariables.length} showZero />
              </div>
            }
            key="global"
          >
            {globalScopeVariables.length === 0 ? (
              <Text type="secondary" className="text-sm">
                没有全局监视变量
              </Text>
            ) : (
              <List
                size="small"
                dataSource={globalScopeVariables}
                renderItem={variable => (
                  <List.Item
                    className="px-3 py-2 border border-gray-200 rounded mb-2"
                    actions={[
                      <Tooltip title="刷新变量值">
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => onRefreshVariable(variable.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="删除监视">
                        <Popconfirm
                          title="确定要删除此监视变量吗？"
                          onConfirm={() => onRemoveVariable(variable.id)}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Tooltip>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={getTypeIcon(variable.type)}
                      title={
                        <div className="flex items-center gap-2">
                          <Text code className="text-sm">{variable.expression}</Text>
                          <Tag color="green">{variable.type}</Tag>
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          {variable.error ? (
                            <Text type="danger" className="text-xs">
                              错误: {variable.error}
                            </Text>
                          ) : (
                            <div className="text-sm">
                              {formatValue(variable.value, variable.type)}
                            </div>
                          )}
                          <Text className="text-xs text-gray-400">
                            更新时间: {new Date(variable.lastUpdated).toLocaleString()}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Panel>
        </Collapse>
      )}

      {/* 当前数据上下文 */}
      {currentData && Object.keys(currentData).length > 0 && (
        <Card size="small" className="mt-4" title="当前数据上下文">
          <div className="max-h-40 overflow-auto">
            <pre className="text-xs bg-gray-50 p-2 rounded">
              {JSON.stringify(currentData, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </Card>
  );
};

export default VariableWatcher;