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
  Switch
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  StopOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

interface Breakpoint {
  id: string;
  nodeId: string;
  nodeType: string;
  condition?: string;
  enabled: boolean;
  hitCount: number;
  createdAt: number;
}

interface BreakpointManagerProps {
  breakpoints: Breakpoint[];
  availableNodes: Array<{ id: string; type: string; label: string }>;
  onAddBreakpoint: (nodeId: string, condition?: string) => void;
  onRemoveBreakpoint: (id: string) => void;
  onToggleBreakpoint: (id: string, enabled: boolean) => void;
  onClearAllBreakpoints: () => void;
}

const BreakpointManager: React.FC<BreakpointManagerProps> = ({
  breakpoints,
  availableNodes,
  onAddBreakpoint,
  onRemoveBreakpoint,
  onToggleBreakpoint,
  onClearAllBreakpoints
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddBreakpoint = () => {
    if (!selectedNodeId) return;

    onAddBreakpoint(selectedNodeId, condition.trim() || undefined);
    setSelectedNodeId('');
    setCondition('');
  };

  const getNodeLabel = (nodeId: string) => {
    const node = availableNodes.find(n => n.id === nodeId);
    return node ? `${node.label} (${node.type})` : nodeId;
  };

  const enabledBreakpoints = breakpoints.filter(bp => bp.enabled);
  const disabledBreakpoints = breakpoints.filter(bp => !bp.enabled);

  return (
    <Card
      size="small"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StopOutlined className="text-red-500" />
            <span>断点管理</span>
            <Tag color="blue">{enabledBreakpoints.length}</Tag>
          </div>
          {breakpoints.length > 0 && (
            <Popconfirm
              title="确定要清除所有断点吗？"
              onConfirm={onClearAllBreakpoints}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" danger ghost>
                清除全部
              </Button>
            </Popconfirm>
          )}
        </div>
      }
      className="breakpoint-manager"
    >
      {/* 添加断点 */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Select
            placeholder="选择节点"
            value={selectedNodeId}
            onChange={setSelectedNodeId}
            className="flex-1"
            showSearch
            optionFilterProp="children"
          >
            {availableNodes.map(node => (
              <Option key={node.id} value={node.id}>
                {node.label} ({node.type})
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddBreakpoint}
            disabled={!selectedNodeId}
          >
            添加
          </Button>
        </div>

        {/* 高级选项 */}
        <div className="flex items-center gap-2">
          <Switch
            size="small"
            checked={showAdvanced}
            onChange={setShowAdvanced}
          />
          <Text className="text-xs text-gray-500">高级选项</Text>
        </div>

        {showAdvanced && (
          <div className="space-y-2">
            <Input
              placeholder="条件表达式 (可选，如: output.length > 10)"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              size="small"
            />
            <Text className="text-xs text-gray-400 block">
              💡 条件表达式示例:
              <br />• output.length {'>'} 10 (输出长度大于10)
              <br />• input.includes('error') (输入包含error)
              <br />• Math.random() {'>'} 0.5 (50%概率触发)
            </Text>
          </div>
        )}
      </div>

      {/* 断点列表 */}
      {breakpoints.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无断点"
          className="py-4"
        />
      ) : (
        <div className="space-y-3">
          {/* 已启用的断点 */}
          {enabledBreakpoints.length > 0 && (
            <div>
              <Text strong className="text-xs text-green-600 block mb-2">
                已启用 ({enabledBreakpoints.length})
              </Text>
              <List
                size="small"
                dataSource={enabledBreakpoints}
                renderItem={breakpoint => (
                  <List.Item
                    className="px-3 py-2 bg-green-50 border border-green-200 rounded"
                    actions={[
                      <Tooltip title="禁用断点">
                        <Button
                          size="small"
                          icon={<StopOutlined />}
                          onClick={() => onToggleBreakpoint(breakpoint.id, false)}
                        />
                      </Tooltip>,
                      <Tooltip title="删除断点">
                        <Popconfirm
                          title="确定要删除此断点吗？"
                          onConfirm={() => onRemoveBreakpoint(breakpoint.id)}
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
                      title={
                        <div className="flex items-center gap-2">
                          <Text strong className="text-sm">
                            {getNodeLabel(breakpoint.nodeId)}
                          </Text>
                          <Tag color="green">
                            <StopOutlined className="mr-1" />
                            活跃
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          {breakpoint.condition && (
                            <div className="text-xs">
                              <Text type="secondary">条件: </Text>
                              <Text code className="text-xs">{breakpoint.condition}</Text>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>触发次数: {breakpoint.hitCount}</span>
                            <span>创建时间: {new Date(breakpoint.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}

          {/* 已禁用的断点 */}
          {disabledBreakpoints.length > 0 && (
            <div>
              <Text strong className="text-xs text-gray-500 block mb-2">
                已禁用 ({disabledBreakpoints.length})
              </Text>
              <List
                size="small"
                dataSource={disabledBreakpoints}
                renderItem={breakpoint => (
                  <List.Item
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded opacity-60"
                    actions={[
                      <Tooltip title="启用断点">
                        <Button
                          size="small"
                          icon={<PlayCircleOutlined />}
                          onClick={() => onToggleBreakpoint(breakpoint.id, true)}
                        />
                      </Tooltip>,
                      <Tooltip title="删除断点">
                        <Popconfirm
                          title="确定要删除此断点吗？"
                          onConfirm={() => onRemoveBreakpoint(breakpoint.id)}
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
                      title={
                        <div className="flex items-center gap-2">
                          <Text className="text-sm text-gray-500">
                            {getNodeLabel(breakpoint.nodeId)}
                          </Text>
                          <Tag color="default">
                            已禁用
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          {breakpoint.condition && (
                            <div className="text-xs">
                              <Text type="secondary">条件: </Text>
                              <Text code className="text-xs">{breakpoint.condition}</Text>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>触发次数: {breakpoint.hitCount}</span>
                            <span>创建时间: {new Date(breakpoint.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      {breakpoints.length > 0 && (
        <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-start gap-2">
            <InfoCircleOutlined className="text-blue-500 mt-0.5" />
            <div className="text-xs text-blue-700">
              <div className="font-medium mb-1">断点说明:</div>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>断点会在指定节点执行前暂停工作流</li>
                <li>可以设置条件表达式来控制断点触发时机</li>
                <li>暂停时可以检查节点的输入输出数据</li>
                <li>支持临时禁用断点而不删除配置</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BreakpointManager;