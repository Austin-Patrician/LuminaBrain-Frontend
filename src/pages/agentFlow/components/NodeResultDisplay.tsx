import React, { useState } from 'react';
import { Card, Tag, Button, Tooltip, Modal, Progress } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { DebugNodeResult } from '../services/workflowExecutor';

interface NodeResultDisplayProps {
  result?: DebugNodeResult;
  compact?: boolean;
  showDetails?: boolean;
}

const NodeResultDisplay: React.FC<NodeResultDisplayProps> = ({
  result,
  compact = false,
  showDetails = true
}) => {
  const [markdownModalVisible, setMarkdownModalVisible] = useState(false);

  if (!result) {
    return null;
  }

  const getStatusIcon = () => {
    switch (result.status) {
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'failed':
        return <ExclamationCircleOutlined className="text-red-500" />;
      case 'running':
        return <LoadingOutlined className="text-blue-500" />;
      case 'waiting_input':
        return <UserOutlined className="text-yellow-500" />;
      default:
        return <ClockCircleOutlined className="text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'processing';
      case 'waiting_input': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = () => {
    switch (result.status) {
      case 'completed': return '执行完成';
      case 'failed': return '执行失败';
      case 'running': return '执行中...';
      case 'waiting_input': return '等待输入';
      default: return '等待执行';
    }
  };

  const showMarkdown = () => {
    if (result.markdownOutput) {
      setMarkdownModalVisible(true);
    }
  };

  // 紧凑模式 - 只显示状态图标和简单信息
  if (compact) {
    return (
      <div className="absolute -top-2 -right-2 z-10">
        <Tooltip
          title={
            <div>
              <div>状态: {getStatusText()}</div>
              <div>耗时: {result.duration}ms</div>
              {result.error && <div className="text-red-300">错误: {result.error}</div>}
            </div>
          }
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
              ${result.status === 'completed' ? 'bg-green-100 border-2 border-green-500' :
                result.status === 'failed' ? 'bg-red-100 border-2 border-red-500' :
                  result.status === 'running' ? 'bg-blue-100 border-2 border-blue-500' :
                    result.status === 'waiting_input' ? 'bg-yellow-100 border-2 border-yellow-500' :
                      'bg-gray-100 border-2 border-gray-400'}`}
          >
            {getStatusIcon()}
          </div>
        </Tooltip>

        {result.markdownOutput && (
          <Tooltip title="查看执行结果">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={showMarkdown}
              className="absolute -bottom-6 -right-1 w-5 h-5 p-0 text-xs bg-white border border-gray-300 rounded-full shadow-sm"
            />
          </Tooltip>
        )}

        {/* Markdown结果模态框 */}
        <Modal
          title="节点执行结果"
          open={markdownModalVisible}
          onCancel={() => setMarkdownModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setMarkdownModalVisible(false)}>
              关闭
            </Button>
          ]}
          width={800}
        >
          <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded border">
            <ReactMarkdown>{result.markdownOutput}</ReactMarkdown>
          </div>
        </Modal>
      </div>
    );
  }

  // 详细模式 - 显示完整的执行结果信息
  return (
    <div className="mt-3">
      <Card
        size="small"
        className={`border-l-4 ${result.status === 'completed' ? 'border-l-green-500 bg-green-50' :
            result.status === 'failed' ? 'border-l-red-500 bg-red-50' :
              result.status === 'running' ? 'border-l-blue-500 bg-blue-50' :
                result.status === 'waiting_input' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-gray-500 bg-gray-50'
          }`}
        bodyStyle={{ padding: '8px 12px' }}
      >
        <div className="space-y-2">
          {/* 状态行 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Tag color={getStatusColor()} size="small">
                {getStatusText()}
              </Tag>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {result.duration}ms
              </span>
              {result.markdownOutput && showDetails && (
                <Tooltip title="查看详细结果">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={showMarkdown}
                    className="p-0 w-6 h-6"
                  />
                </Tooltip>
              )}
            </div>
          </div>

          {/* 运行中的进度条 */}
          {result.status === 'running' && (
            <Progress
              size="small"
              status="active"
              showInfo={false}
              className="mb-1"
            />
          )}

          {/* 输入信息 */}
          {showDetails && result.input && Object.keys(result.input).length > 0 && (
            <div className="text-xs">
              <span className="text-gray-600">输入: </span>
              <span className="font-mono bg-gray-100 px-1 rounded">
                {JSON.stringify(result.input, null, 0).slice(0, 30)}
                {JSON.stringify(result.input, null, 0).length > 30 ? '...' : ''}
              </span>
            </div>
          )}

          {/* 输出信息 */}
          {showDetails && result.output && (
            <div className="text-xs">
              <span className="text-gray-600">输出: </span>
              <span className="font-mono bg-gray-100 px-1 rounded">
                {typeof result.output === 'string'
                  ? result.output.slice(0, 30) + (result.output.length > 30 ? '...' : '')
                  : JSON.stringify(result.output, null, 0).slice(0, 30) +
                  (JSON.stringify(result.output, null, 0).length > 30 ? '...' : '')
                }
              </span>
            </div>
          )}

          {/* 错误信息 */}
          {result.error && (
            <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
              <span className="font-medium">错误: </span>
              {result.error}
            </div>
          )}

          {/* 等待用户输入提示 */}
          {result.status === 'waiting_input' && (
            <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
              <UserOutlined className="mr-1" />
              等待用户输入...
            </div>
          )}

          {/* 执行时间 */}
          {showDetails && (
            <div className="text-xs text-gray-400 border-t border-gray-200 pt-1">
              {new Date(result.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </Card>

      {/* Markdown结果模态框 */}
      <Modal
        title={`节点执行结果 - ${result.nodeType}`}
        open={markdownModalVisible}
        onCancel={() => setMarkdownModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMarkdownModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div className="space-y-3">
          {/* 执行信息摘要 */}
          <div className="bg-gray-50 p-3 rounded border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">节点ID:</span>
                <span className="ml-2 font-mono">{result.nodeId}</span>
              </div>
              <div>
                <span className="text-gray-600">执行状态:</span>
                <Tag color={getStatusColor()} size="small" className="ml-2">
                  {getStatusText()}
                </Tag>
              </div>
              <div>
                <span className="text-gray-600">执行时间:</span>
                <span className="ml-2">{new Date(result.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">耗时:</span>
                <span className="ml-2">{result.duration}ms</span>
              </div>
            </div>
          </div>

          {/* Markdown内容 */}
          <div className="max-h-96 overflow-y-auto bg-white p-4 rounded border">
            <ReactMarkdown
              components={{
                // 自定义样式
                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-800">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-700">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-gray-600">{children}</h3>,
                p: ({ children }) => <p className="mb-2 text-gray-600 leading-relaxed">{children}</p>,
                code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
                pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm">{children}</pre>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-gray-600">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-gray-600">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                table: ({ children }) => <table className="w-full border-collapse border border-gray-300 mb-3">{children}</table>,
                th: ({ children }) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-medium">{children}</th>,
                td: ({ children }) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
              }}
            >
              {result.markdownOutput}
            </ReactMarkdown>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NodeResultDisplay;