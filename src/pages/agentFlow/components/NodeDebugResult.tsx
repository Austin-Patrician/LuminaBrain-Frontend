import React from 'react';
import { Badge, Tooltip, Tag } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { DebugNodeResult } from '../services/workflowExecutor';

interface NodeDebugResultProps {
  result?: DebugNodeResult;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  showDetails?: boolean;
  onShowMarkdown?: () => void;
}

const NodeDebugResult: React.FC<NodeDebugResultProps> = ({
  result,
  position = 'top-right',
  showDetails = false,
  onShowMarkdown
}) => {
  if (!result) return null;

  // 获取状态颜色和图标
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: '#52c41a', icon: <CheckCircleOutlined />, text: '完成' };
      case 'failed':
        return { color: '#ff4d4f', icon: <ExclamationCircleOutlined />, text: '失败' };
      case 'running':
        return { color: '#1677ff', icon: <LoadingOutlined spin />, text: '执行中' };
      case 'waiting_input':
        return { color: '#faad14', icon: <ClockCircleOutlined />, text: '等待输入' };
      default:
        return { color: '#d9d9d9', icon: <ClockCircleOutlined />, text: '等待' };
    }
  };

  const statusConfig = getStatusConfig(result.status);

  // 获取位置样式
  const getPositionStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 1000,
      pointerEvents: 'auto' as const
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyle, top: -8, right: -8 };
      case 'bottom-right':
        return { ...baseStyle, bottom: -8, right: -8 };
      case 'top-left':
        return { ...baseStyle, top: -8, left: -8 };
      case 'bottom-left':
        return { ...baseStyle, bottom: -8, left: -8 };
      default:
        return { ...baseStyle, top: -8, right: -8 };
    }
  };

  const renderContent = () => {
    if (showDetails) {
      return (
        <div
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48 max-w-64"
          style={getPositionStyle()}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {statusConfig.icon}
              <span className="text-xs font-medium">{statusConfig.text}</span>
            </div>
            <span className="text-xs text-gray-500">{result.duration}ms</span>
          </div>

          {result.markdownOutput && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">有输出结果</span>
              <Tooltip title="查看详细结果">
                <EyeOutlined
                  className="text-blue-500 cursor-pointer hover:text-blue-700"
                  onClick={onShowMarkdown}
                />
              </Tooltip>
            </div>
          )}

          {result.error && (
            <div className="mt-1">
              <Tag color="error" size="small">错误</Tag>
              <div className="text-xs text-red-500 mt-1 max-h-12 overflow-hidden">
                {result.error}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <Tooltip
        title={
          <div>
            <div>状态: {statusConfig.text}</div>
            <div>耗时: {result.duration}ms</div>
            {result.error && <div className="text-red-300">错误: {result.error}</div>}
            {result.markdownOutput && <div>有输出结果可查看</div>}
          </div>
        }
        placement="topRight"
      >
        <Badge
          count={statusConfig.icon}
          style={{
            backgroundColor: statusConfig.color,
            ...getPositionStyle()
          }}
          size="small"
        />
      </Tooltip>
    );
  };

  return renderContent();
};

export default NodeDebugResult;