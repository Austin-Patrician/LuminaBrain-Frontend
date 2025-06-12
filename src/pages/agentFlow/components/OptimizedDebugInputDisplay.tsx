import React from 'react';
import { Card, Collapse, Tag, Typography } from 'antd';
import {
  SettingOutlined,
  UserOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { DebugNodeInput } from '../services/workflowExecutor';

const { Text } = Typography;
const { Panel } = Collapse;

interface OptimizedDebugInputDisplayProps {
  input: DebugNodeInput;
  compact?: boolean;
}

const OptimizedDebugInputDisplay: React.FC<OptimizedDebugInputDisplayProps> = ({
  input,
  compact = false
}) => {
  // 渲染节点基本信息
  const renderNodeInfo = () => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-500">节点ID:</span>
        <div className="font-medium break-all">{input.nodeInfo.nodeId}</div>
      </div>
      <div>
        <span className="text-gray-500">节点类型:</span>
        <Tag color="blue">{input.nodeInfo.nodeType}</Tag>
      </div>
      {input.nodeInfo.label && (
        <div>
          <span className="text-gray-500">节点名称:</span>
          <div className="font-medium">{input.nodeInfo.label}</div>
        </div>
      )}
      {input.nodeInfo.inputSource && (
        <div>
          <span className="text-gray-500">输入来源:</span>
          <div className="font-medium">{input.nodeInfo.inputSource}</div>
        </div>
      )}
    </div>
  );

  // 渲染节点配置
  const renderNodeConfig = () => {
    if (!input.nodeConfig || Object.keys(input.nodeConfig).length === 0) {
      return <div className="text-gray-500 text-sm">无特殊配置</div>;
    }

    return (
      <div className="space-y-2">
        {Object.entries(input.nodeConfig).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2 text-sm">
            <span className="text-gray-500 min-w-20">{key}:</span>
            <div className="flex-1">
              {typeof value === 'object' ? (
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <span className="font-mono">{String(value)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染上下文数据
  const renderContextData = () => {
    const { userInput, previousNodeResults, systemVariables } = input.contextData;

    if (!userInput && !previousNodeResults && !systemVariables) {
      return <div className="text-gray-500 text-sm">无上下文数据</div>;
    }

    return (
      <div className="space-y-3">
        {/* 用户输入 */}
        {userInput && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserOutlined className="text-blue-500" />
              <Text strong className="text-sm">用户输入</Text>
            </div>
            <div className="bg-blue-50 p-3 rounded border">
              <Text code>{userInput}</Text>
            </div>
          </div>
        )}

        {/* 前置节点结果 */}
        {previousNodeResults && Object.keys(previousNodeResults).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DatabaseOutlined className="text-green-500" />
              <Text strong className="text-sm">前置节点结果</Text>
            </div>
            <div className="space-y-2">
              {Object.entries(previousNodeResults).map(([nodeId, result]) => (
                <Card key={nodeId} size="small" className="bg-green-50">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">节点 {nodeId}</div>
                    {result.output && (
                      <div>
                        <Text className="text-xs text-gray-600">输出:</Text>
                        <div className="mt-1">
                          {typeof result.output === 'string' ? (
                            <Text code className="text-xs">{result.output}</Text>
                          ) : (
                            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-20">
                              {JSON.stringify(result.output, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                    {result.markdownOutput && result.markdownOutput !== result.output && (
                      <div>
                        <Text className="text-xs text-gray-600">格式化输出:</Text>
                        <div className="bg-white p-2 rounded text-xs mt-1 max-h-20 overflow-auto">
                          {result.markdownOutput}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 系统变量 */}
        {systemVariables && Object.keys(systemVariables).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SettingOutlined className="text-purple-500" />
              <Text strong className="text-sm">系统变量</Text>
            </div>
            <div className="bg-purple-50 p-3 rounded border">
              <pre className="text-xs overflow-auto max-h-20">
                {JSON.stringify(systemVariables, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染执行元数据
  const renderExecutionMeta = () => (
    <div className="grid grid-cols-2 gap-4 text-sm">
      {input.executionMeta.executionId && (
        <div>
          <span className="text-gray-500">执行ID:</span>
          <div className="font-mono text-xs">{input.executionMeta.executionId}</div>
        </div>
      )}
      {input.executionMeta.stepId && (
        <div>
          <span className="text-gray-500">步骤ID:</span>
          <div className="font-mono text-xs">{input.executionMeta.stepId}</div>
        </div>
      )}
      {input.executionMeta.workflowId && (
        <div>
          <span className="text-gray-500">工作流ID:</span>
          <div className="font-mono text-xs">{input.executionMeta.workflowId}</div>
        </div>
      )}
      <div>
        <span className="text-gray-500">执行时间:</span>
        <div className="text-xs">{new Date(input.executionMeta.timestamp).toLocaleString()}</div>
      </div>
    </div>
  );

  if (compact) {
    // 紧凑模式：只显示关键信息
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-600">
          节点: <Tag>{input.nodeInfo.nodeType}</Tag>
          {input.nodeInfo.label && <span className="ml-1">{input.nodeInfo.label}</span>}
        </div>
        {input.contextData.userInput && (
          <div className="bg-blue-50 p-2 rounded text-xs">
            <UserOutlined className="mr-1 text-blue-500" />
            用户输入: {input.contextData.userInput}
          </div>
        )}
        {Object.keys(input.nodeConfig).length > 0 && (
          <div className="text-xs text-gray-600">
            配置: {Object.keys(input.nodeConfig).join(', ')}
          </div>
        )}
      </div>
    );
  }

  // 完整模式：分类展示所有信息
  return (
    <div className="space-y-4">
      <Collapse size="small" ghost defaultActiveKey={['info', 'context']}>
        <Panel
          header={
            <div className="flex items-center gap-2">
              <InfoCircleOutlined className="text-blue-500" />
              <span>节点信息</span>
            </div>
          }
          key="info"
        >
          {renderNodeInfo()}
        </Panel>

        <Panel
          header={
            <div className="flex items-center gap-2">
              <SettingOutlined className="text-green-500" />
              <span>节点配置</span>
            </div>
          }
          key="config"
        >
          {renderNodeConfig()}
        </Panel>

        <Panel
          header={
            <div className="flex items-center gap-2">
              <DatabaseOutlined className="text-purple-500" />
              <span>运行时数据</span>
            </div>
          }
          key="context"
        >
          {renderContextData()}
        </Panel>

        <Panel
          header={
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-gray-500" />
              <span>执行元数据</span>
            </div>
          }
          key="meta"
        >
          {renderExecutionMeta()}
        </Panel>
      </Collapse>
    </div>
  );
};

export default OptimizedDebugInputDisplay;
