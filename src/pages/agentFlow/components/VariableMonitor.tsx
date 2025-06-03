import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Input,
  Select,
  Button,
  Tooltip,
  Badge,
  Drawer,

  Timeline,
  Switch,
  Alert,
  Empty
} from 'antd';
import {
  EyeOutlined,
  BranchesOutlined,
  FunctionOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
  ,
  InfoCircleOutlined,
  DownloadOutlined,
  ClearOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import WorkflowExecutor, { DebugExecutionState } from '../services/workflowExecutor';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Variable types and interfaces
interface VariableValue {
  value: any;
  type: string;
  source: string;
  nodeId: string;
  timestamp: number;
  size?: number;
  preview?: string;
}

interface VariableHistory {
  variableName: string;
  changes: Array<{
    value: any;
    nodeId: string;
    timestamp: number;
    changeType: 'created' | 'updated' | 'deleted';
    oldValue?: any;
  }>;
}

interface VariableScope {
  global: Record<string, VariableValue>;
  nodeLocal: Record<string, Record<string, VariableValue>>;
  temporary: Record<string, VariableValue>;
}

interface VariableMonitorProps {
  executor: WorkflowExecutor | null;
  visible: boolean;
  onClose: () => void;
  executionState?: DebugExecutionState | null;
}

const VariableMonitor: React.FC<VariableMonitorProps> = ({
  executor,
  visible,
  onClose,
  executionState
}) => {
  // State management
  const [variables, setVariables] = useState<VariableScope>({
    global: {},
    nodeLocal: {},
    temporary: {}
  });
  const [variableHistory, setVariableHistory] = useState<Record<string, VariableHistory>>({});
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterScope, setFilterScope] = useState<string>('all');
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [highlightedVariables, setHighlightedVariables] = useState<Set<string>>(new Set());

  // Monitor variable changes during execution
  useEffect(() => {
    if (!executor || !autoUpdate) return;

    const handleVariableChange = (variableName: string, value: any, nodeId: string, scope: 'global' | 'local' | 'temporary') => {
      const timestamp = Date.now();
      const variableValue: VariableValue = {
        value,
        type: typeof value === 'object' ? (Array.isArray(value) ? 'array' : 'object') : typeof value,
        source: nodeId,
        nodeId,
        timestamp,
        size: JSON.stringify(value).length,
        preview: generatePreview(value)
      };

      setVariables(prev => {
        const newVariables = { ...prev };

        if (scope === 'global') {
          newVariables.global = { ...prev.global, [variableName]: variableValue };
        } else if (scope === 'local') {
          if (!newVariables.nodeLocal[nodeId]) {
            newVariables.nodeLocal[nodeId] = {};
          }
          newVariables.nodeLocal[nodeId] = { ...prev.nodeLocal[nodeId], [variableName]: variableValue };
        } else {
          newVariables.temporary = { ...prev.temporary, [variableName]: variableValue };
        }

        return newVariables;
      });

      // Update history
      setVariableHistory(prev => {
        const history = prev[variableName] || { variableName, changes: [] };
        const oldValue = prev[variableName]?.changes[prev[variableName].changes.length - 1]?.value;

        history.changes.push({
          value,
          nodeId,
          timestamp,
          changeType: history.changes.length === 0 ? 'created' : 'updated',
          oldValue
        });

        return { ...prev, [variableName]: history };
      });

      // Highlight changed variable
      setHighlightedVariables(prev => new Set([...prev, variableName]));
      setTimeout(() => {
        setHighlightedVariables(prev => {
          const newSet = new Set(prev);
          newSet.delete(variableName);
          return newSet;
        });
      }, 2000);
    };

    // Mock variable monitoring - in real implementation, this would connect to the executor
    const mockVariableUpdates = () => {
      if (executionState?.status === 'running' && executionState.currentNode) {
        // Simulate variable updates during execution
        const currentNode = executionState.currentNode;
        const mockVars = [
          { name: 'input', value: `Input for ${currentNode}`, scope: 'global' as const },
          { name: 'output', value: `Output from ${currentNode}`, scope: 'global' as const },
          { name: `${currentNode}_temp`, value: Math.random().toString(), scope: 'local' as const },
        ];

        mockVars.forEach(({ name, value, scope }) => {
          handleVariableChange(name, value, currentNode, scope);
        });
      }
    };

    const interval = setInterval(mockVariableUpdates, 1000);
    return () => clearInterval(interval);
  }, [executor, autoUpdate, executionState]);

  // Generate preview for complex values
  const generatePreview = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value.length > 50 ? `${value.substring(0, 50)}...` : value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (typeof value === 'object') return `Object(${Object.keys(value).length} keys)`;
    return String(value);
  };

  // Get all variables in flat structure for table display
  const flatVariables = useMemo(() => {
    const result: Array<{
      key: string;
      name: string;
      value: any;
      type: string;
      scope: string;
      source: string;
      timestamp: number;
      size: number;
      preview: string;
      highlighted: boolean;
    }> = [];

    // Global variables
    Object.entries(variables.global).forEach(([name, varData]) => {
      result.push({
        key: `global_${name}`,
        name,
        value: varData.value,
        type: varData.type,
        scope: 'global',
        source: varData.source,
        timestamp: varData.timestamp,
        size: varData.size || 0,
        preview: varData.preview || '',
        highlighted: highlightedVariables.has(name)
      });
    });

    // Node local variables
    Object.entries(variables.nodeLocal).forEach(([nodeId, nodeVars]) => {
      Object.entries(nodeVars).forEach(([name, varData]) => {
        result.push({
          key: `local_${nodeId}_${name}`,
          name: `${nodeId}.${name}`,
          value: varData.value,
          type: varData.type,
          scope: 'local',
          source: varData.source,
          timestamp: varData.timestamp,
          size: varData.size || 0,
          preview: varData.preview || '',
          highlighted: highlightedVariables.has(name)
        });
      });
    });

    // Temporary variables
    Object.entries(variables.temporary).forEach(([name, varData]) => {
      result.push({
        key: `temp_${name}`,
        name,
        value: varData.value,
        type: varData.type,
        scope: 'temporary',
        source: varData.source,
        timestamp: varData.timestamp,
        size: varData.size || 0,
        preview: varData.preview || '',
        highlighted: highlightedVariables.has(name)
      });
    });

    return result;
  }, [variables, highlightedVariables]);

  // Filter variables based on search and filters
  const filteredVariables = useMemo(() => {
    return flatVariables.filter(variable => {
      const matchesSearch = variable.name.toLowerCase().includes(searchText.toLowerCase()) ||
        variable.preview.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = filterType === 'all' || variable.type === filterType;
      const matchesScope = filterScope === 'all' || variable.scope === filterScope;

      return matchesSearch && matchesType && matchesScope;
    });
  }, [flatVariables, searchText, filterType, filterScope]);

  // Table columns
  const columns: ColumnsType<typeof filteredVariables[0]> = [
    {
      title: '变量名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <div className={`flex items-center gap-2 ${record.highlighted ? 'animate-pulse' : ''}`}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedVariable(record.key);
              setDetailVisible(true);
            }}
          />
          <Text strong className={record.highlighted ? 'text-blue-600' : ''}>
            {text}
          </Text>
          {record.highlighted && <Badge status="processing" />}
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => {
        const colors = {
          string: 'green',
          number: 'blue',
          boolean: 'orange',
          object: 'purple',
          array: 'cyan',
          undefined: 'gray',
          null: 'gray'
        };
        return <Tag color={colors[type as keyof typeof colors] || 'default'}>{type}</Tag>;
      },
    },
    {
      title: '作用域',
      dataIndex: 'scope',
      key: 'scope',
      width: 80,
      render: (scope) => {
        const icons = {
          global: <DatabaseOutlined />,
          local: <BranchesOutlined />,
          temporary: <ClockCircleOutlined />
        };
        const colors = {
          global: 'blue',
          local: 'green',
          temporary: 'orange'
        };
        return (
          <Tag icon={icons[scope as keyof typeof icons]} color={colors[scope as keyof typeof colors]}>
            {scope}
          </Tag>
        );
      },
    },
    {
      title: '预览',
      dataIndex: 'preview',
      key: 'preview',
      ellipsis: true,
      render: (text) => (
        <Text className="font-mono text-xs text-gray-600">
          {text}
        </Text>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source) => (
        <Tag className="text-xs">{source}</Tag>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 80,
      render: (size) => (
        <Text className="text-xs text-gray-500">
          {size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`}
        </Text>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      render: (timestamp) => (
        <Text className="text-xs text-gray-500">
          {new Date(timestamp).toLocaleTimeString()}
        </Text>
      ),
    },
  ];

  // Clear all variables
  const handleClearVariables = () => {
    setVariables({
      global: {},
      nodeLocal: {},
      temporary: {}
    });
    setVariableHistory({});
    setHighlightedVariables(new Set());
  };

  // Export variables
  const handleExportVariables = () => {
    const exportData = {
      variables: variables,
      history: variableHistory,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `variables-export-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get variable statistics
  const variableStats = useMemo(() => {
    const total = flatVariables.length;
    const byType = flatVariables.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byScope = flatVariables.reduce((acc, v) => {
      acc[v.scope] = (acc[v.scope] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byType, byScope };
  }, [flatVariables]);

  // Render variable detail view
  const renderVariableDetail = () => {
    if (!selectedVariable) return null;

    const variable = flatVariables.find(v => v.key === selectedVariable);
    if (!variable) return null;

    const history = variableHistory[variable.name.split('.').pop() || variable.name];

    return (
      <div className="space-y-4">
        <div>
          <Title level={5}>变量详情</Title>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <Text strong>名称:</Text>
              <div className="mt-1">
                <Text className="font-mono">{variable.name}</Text>
              </div>
            </div>
            <div>
              <Text strong>类型:</Text>
              <div className="mt-1">
                <Tag color="blue">{variable.type}</Tag>
              </div>
            </div>
            <div>
              <Text strong>作用域:</Text>
              <div className="mt-1">
                <Tag color="green">{variable.scope}</Tag>
              </div>
            </div>
            <div>
              <Text strong>来源节点:</Text>
              <div className="mt-1">
                <Tag>{variable.source}</Tag>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Text strong>当前值:</Text>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <pre className="text-sm overflow-auto max-h-40">
              {JSON.stringify(variable.value, null, 2)}
            </pre>
          </div>
        </div>

        {history && history.changes.length > 0 && (
          <div>
            <Text strong>变更历史:</Text>
            <Timeline className="mt-3">
              {history.changes.slice().reverse().map((change, index) => (
                <Timeline.Item
                  key={index}
                  color={change.changeType === 'created' ? 'green' : 'blue'}
                  dot={
                    change.changeType === 'created' ?
                      <CheckCircleOutlined /> :
                      <InfoCircleOutlined />
                  }
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Text strong className="text-xs">
                        {change.changeType === 'created' ? '创建' : '更新'}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {new Date(change.timestamp).toLocaleString()}
                      </Text>
                      <Tag>{change.nodeId}</Tag>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <pre>{JSON.stringify(change.value, null, 2)}</pre>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </div>
    );
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <FunctionOutlined className="text-blue-500" />
          <span>变量监视器</span>
          <Badge count={variableStats.total} style={{ backgroundColor: '#52c41a' }} />
        </div>
      }
      open={visible}
      onClose={onClose}
      width={1000}
      extra={
        <Space>
          <Tooltip title="自动更新">
            <Switch
              checked={autoUpdate}
              onChange={setAutoUpdate}
              checkedChildren="自动"
              unCheckedChildren="手动"
              size="small"
            />
          </Tooltip>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportVariables}
            size="small"
            disabled={flatVariables.length === 0}
          >
            导出
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={handleClearVariables}
            size="small"
            disabled={flatVariables.length === 0}
          >
            清空
          </Button>
        </Space>
      }
    >
      <div className="space-y-4">
        {/* Statistics Panel */}
        <Card size="small" className="bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{variableStats.total}</div>
              <div className="text-xs text-gray-600">总变量数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{variableStats.byScope.global || 0}</div>
              <div className="text-xs text-gray-600">全局变量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{variableStats.byScope.local || 0}</div>
              <div className="text-xs text-gray-600">局部变量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{variableStats.byScope.temporary || 0}</div>
              <div className="text-xs text-gray-600">临时变量</div>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card size="small">
          <div className="flex flex-wrap items-center gap-3">
            <Search
              placeholder="搜索变量名或值..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              size="small"
            />
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              size="small"
              placeholder="类型筛选"
            >
              <Option value="all">所有类型</Option>
              <Option value="string">字符串</Option>
              <Option value="number">数字</Option>
              <Option value="boolean">布尔值</Option>
              <Option value="object">对象</Option>
              <Option value="array">数组</Option>
            </Select>
            <Select
              value={filterScope}
              onChange={setFilterScope}
              style={{ width: 120 }}
              size="small"
              placeholder="作用域筛选"
            >
              <Option value="all">所有作用域</Option>
              <Option value="global">全局</Option>
              <Option value="local">局部</Option>
              <Option value="temporary">临时</Option>
            </Select>
          </div>
        </Card>

        {/* Execution Status */}
        {executionState && (
          <Alert
            message={
              <div className="flex items-center gap-2">
                <PlayCircleOutlined className={executionState.status === 'running' ? 'animate-spin text-blue-500' : ''} />
                <span>
                  执行状态: {executionState.status}
                  {executionState.currentNode && ` | 当前节点: ${executionState.currentNode}`}
                </span>
              </div>
            }
            type={executionState.status === 'running' ? 'info' : 'success'}
            showIcon={false}
            className="border-dashed"
          />
        )}

        {/* Variables Table */}
        <Card size="small" title="变量列表">
          {filteredVariables.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无变量数据"
              className="py-8"
            />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredVariables}
              size="small"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 个变量`
              }}
              scroll={{ x: 800 }}
              rowClassName={(record) => record.highlighted ? 'bg-blue-50' : ''}
            />
          )}
        </Card>
      </div>

      {/* Variable Detail Drawer */}
      <Drawer
        title="变量详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={600}
        placement="right"
      >
        {renderVariableDetail()}
      </Drawer>
    </Drawer>
  );
};

export default VariableMonitor;