import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, Typography, Tag, Space } from 'antd';
import { RobotOutlined, MessageOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface AIDialogNodeData {
  label: string;
  model?: string;
  userMessage?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  description?: string;
}

const AIDialogNode: React.FC<NodeProps<AIDialogNodeData>> = ({ data, selected }) => {
  const {
    label = 'AI对话',
    model = 'gpt-3.5-turbo',
    userMessage = '',
    systemPrompt = '',
    temperature = 0.7,
    description = '',
  } = data || {};

  // 获取模型显示名称
  const getModelDisplayName = (model: string) => {
    const modelMap: Record<string, string> = {
      'gpt-3.5-turbo': 'GPT-3.5',
      'gpt-4': 'GPT-4',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'claude-3': 'Claude-3',
    };
    return modelMap[model] || model;
  };

  return (
    <Card
      size="small"
      className={`min-w-[250px] max-w-[300px] shadow-lg ${selected ? 'ring-2 ring-blue-500' : ''
        }`}
      bodyStyle={{ padding: '12px' }}
    >
      <Handle type="target" position={Position.Left} />

      <div className="flex items-start gap-2 mb-3">
        <RobotOutlined className="text-blue-500 text-lg mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Text strong className="text-sm truncate">{label}</Text>
            <Tag color="blue">
              {getModelDisplayName(model)}
            </Tag>
          </div>
          {description && (
            <Paragraph
              className="text-xs text-gray-600 mb-2"
              ellipsis={{ rows: 2, tooltip: description }}
            >
              {description}
            </Paragraph>
          )}
        </div>
      </div>

      <Space direction="vertical" size="small" className="w-full">
        {/* 显示配置摘要 */}
        <div className="text-xs text-gray-500 space-y-1">
          {userMessage && (
            <div className="flex items-center gap-1">
              <MessageOutlined />
              <Text className="text-xs truncate" title={userMessage}>
                用户消息: {userMessage.length > 20 ? `${userMessage.slice(0, 20)}...` : userMessage}
              </Text>
            </div>
          )}

          {systemPrompt && (
            <div className="flex items-center gap-1">
              <Text className="text-xs text-orange-600">
                系统提示: {systemPrompt.length > 20 ? `${systemPrompt.slice(0, 20)}...` : systemPrompt}
              </Text>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Text className="text-xs">温度: {temperature}</Text>
            <Text className="text-xs text-green-600">点击配置详细参数</Text>
          </div>
        </div>
      </Space>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export default AIDialogNode;