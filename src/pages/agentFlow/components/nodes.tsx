import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { CloseCircleFilled, RobotOutlined, SaveOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Card, Select, Input, Slider, Form, Typography, Space, Tooltip, Button, Divider, Checkbox, message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

// 添加删除按钮的节点包装器
const NodeWrapper = ({ children, id, data, isStart = false, isEnd = false }: any) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();

    // 删除节点和相关连线
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  return (
    <div className="relative group">
      {!isStart && !isEnd && (
        <div
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full 
                     flex items-center justify-center text-xs cursor-pointer opacity-0 
                     group-hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={handleDelete}
        >
          <CloseCircleFilled className="text-xs" />
        </div>
      )}
      {children}
    </div>
  );
};

// 基础节点 - 使用 Tailwind
const BasicNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-blue-500 shadow-lg shadow-blue-200' : 'border-blue-300 hover:border-blue-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 处理节点 - 使用 Tailwind
const ProcessNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-green-500 shadow-lg shadow-green-200' : 'border-green-300 hover:border-green-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 判断节点 - 菱形样式
const DecisionNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      relative p-4 bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-yellow-500 shadow-lg shadow-yellow-200' : 'border-yellow-300 hover:border-yellow-400'}
      transform rotate-45 w-24 h-24 flex items-center justify-center
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />
      <div className="text-xs font-medium text-gray-800 text-center transform -rotate-45">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 开始节点 - 椭圆形
const StartNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data} isStart={true}>
    <div className={`
      px-6 py-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 
      border-2 shadow-md transition-all duration-200 text-white
      ${selected ? 'border-green-700 shadow-lg shadow-green-200' : 'border-green-500 hover:from-green-500 hover:to-green-700'}
      min-w-[100px]
    `}>
      <div className="text-sm font-semibold text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-700 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 结束节点 - 椭圆形
const EndNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data} isEnd={true}>
    <div className={`
      px-6 py-3 rounded-full bg-gradient-to-r from-red-400 to-red-600 
      border-2 shadow-md transition-all duration-200 text-white
      ${selected ? 'border-red-700 shadow-lg shadow-red-200' : 'border-red-500 hover:from-red-500 hover:to-red-700'}
      min-w-[100px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-700 border-2 border-white"
      />
      <div className="text-sm font-semibold text-center">
        {data.label}
      </div>
    </div>
  </NodeWrapper>
);

// 条件节点
const ConditionNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-orange-500 shadow-lg shadow-orange-200' : 'border-orange-300 hover:border-orange-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 自定义节点
const CustomNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-indigo-500 shadow-lg shadow-indigo-200' : 'border-indigo-300 hover:border-indigo-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// JSON提取器节点
const JsonExtractorNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-pink-500 shadow-lg shadow-pink-200' : 'border-pink-300 hover:border-pink-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-pink-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-pink-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 数据库节点
const DatabaseNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-cyan-500 shadow-lg shadow-cyan-200' : 'border-cyan-300 hover:border-cyan-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-cyan-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-cyan-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// 知识库节点
const KnowledgeBaseNode = ({ id, data, selected }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className={`
      p-4 rounded-lg bg-white border-2 shadow-md transition-all duration-200
      ${selected ? 'border-lime-500 shadow-lg shadow-lime-200' : 'border-lime-300 hover:border-lime-400'}
      min-w-[120px]
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-lime-500 border-2 border-white"
      />
      <div className="text-sm font-medium text-gray-800 text-center">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-lime-500 border-2 border-white"
      />
    </div>
  </NodeWrapper>
);

// AI对话节点 - 完全重写使用 Tailwind
const AIDialogNode = ({ id, data, selected }: NodeProps) => {
  // 从数据中获取参数，如果不存在则使用默认值
  const [localData, setLocalData] = useState({
    inputSource: data.inputSource || '用户消息',
    model: data.model || 'gpt-3.5-turbo',
    systemPrompt: data.systemPrompt || '',
    temperature: data.temperature || 0.7,
    fixedInput: data.fixedInput || '',
    userMessage: data.userMessage || '',
    ...data
  });

  const { setNodes } = useReactFlow();
  const [isExpanded, setIsExpanded] = useState(false);

  // 同步外部数据变化到本地状态
  useEffect(() => {
    setLocalData(prev => ({
      ...prev,
      inputSource: data.inputSource || '用户消息',
      model: data.model || 'gpt-3.5-turbo',
      systemPrompt: data.systemPrompt || '',
      temperature: data.temperature || 0.7,
      fixedInput: data.fixedInput || '',
      userMessage: data.userMessage || '',
    }));
  }, [data]);

  // 处理参数变更并立即保存到节点数据
  const handleChange = (key: string, value: any) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);

    // 立即更新节点数据
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  };

  // 防止事件冒泡到ReactFlow
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSelectChange = (key: string) => (value: any, e: any) => {
    if (e) {
      e.stopPropagation();
    }
    handleChange(key, value);
  };

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.stopPropagation();
    handleChange(key, e.target.value);
  };

  const handleSliderChange = (key: string) => (value: number) => {
    handleChange(key, value);
  };

  // 防止事件冒泡
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <NodeWrapper id={id} data={data}>
      <div
        className={`
          w-80 bg-white rounded-lg shadow-lg border-2 transition-all duration-200 overflow-hidden
          ${selected ? 'border-blue-500 shadow-xl shadow-blue-200' : 'border-gray-200 hover:border-blue-300'}
        `}
        onClick={stopPropagation}
      >
        {/* 输入连接点 */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-blue-500 border-2 border-white left-0 top-1/2 transform -translate-y-1/2"
        />

        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <RobotOutlined className="text-blue-600 mr-2 text-lg" />
            <span className="font-semibold text-blue-800">AI对话</span>
          </div>
          <Tooltip title={isExpanded ? "收起配置" : "展开配置"}>
            <Button
              type="text"
              size="small"
              icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
              onClick={(e) => {
                stopPropagation(e);
                setIsExpanded(!isExpanded);
              }}
              className="text-blue-600 hover:bg-blue-100"
            />
          </Tooltip>
        </div>

        {/* 内容区域 */}
        <div className="p-4 space-y-3">
          {/* 基础配置 */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">数据来源</label>
            <Select
              value={localData.inputSource}
              size="small"
              className="w-full"
              onChange={handleSelectChange('inputSource')}
              onClick={handleSelectClick}
              dropdownMatchSelectWidth={false}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
            >
              <Option value="用户消息">用户消息</Option>
              <Option value="上一个节点执行结果">上一个节点执行结果</Option>
            </Select>
          </div>

          {/* 当选择"用户消息"时显示用户消息输入框 */}
          {localData.inputSource === '用户消息' && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">用户消息内容</label>
              <TextArea
                rows={3}
                size="small"
                value={localData.userMessage}
                onChange={handleInputChange('userMessage')}
                placeholder="输入用户消息内容..."
                onClick={stopPropagation}
                className="text-xs"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">AI模型</label>
            <Select
              value={localData.model}
              size="small"
              className="w-full"
              onChange={handleSelectChange('model')}
              onClick={handleSelectClick}
              dropdownMatchSelectWidth={false}
              getPopupContainer={(trigger) => trigger.parentElement || document.body}
            >
              <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
              <Option value="gpt-4">GPT-4</Option>
              <Option value="gpt-4-turbo">GPT-4 Turbo</Option>
              <Option value="claude-3-opus">Claude 3 Opus</Option>
              <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
              <Option value="llama-3">Llama 3</Option>
            </Select>
          </div>

          {/* 展开后显示详细配置 */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">系统提示词</label>
                <TextArea
                  rows={3}
                  size="small"
                  value={localData.systemPrompt}
                  onChange={handleInputChange('systemPrompt')}
                  placeholder="输入系统提示词，例如：你是一个专业的AI助手..."
                  onClick={stopPropagation}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">
                  温度参数: {localData.temperature}
                </label>
                <div onClick={stopPropagation}>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={localData.temperature}
                    onChange={handleSliderChange('temperature')}
                    className="w-full"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  控制AI回答的创造性，0为确定性回答，1为高创造性
                </div>
              </div>

              {/* 数据来源详细说明 */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-700">
                  <div className="font-medium mb-1">💡 数据来源说明:</div>
                  <ul className="space-y-1 text-blue-600">
                    <li>• <strong>用户消息</strong>: 使用上面输入的固定用户消息</li>
                    <li>• <strong>上一个节点执行结果</strong>: 使用前一个节点的输出作为用户消息</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输出连接点 */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-green-500 border-2 border-white right-0 top-1/2 transform -translate-y-1/2"
        />
      </div>
    </NodeWrapper>
  );
};

// 导出所有自定义节点类型
export const nodeTypes = {
  basicNode: BasicNode,
  processNode: ProcessNode,
  decisionNode: DecisionNode,
  startNode: StartNode,
  endNode: EndNode,
  conditionNode: ConditionNode,
  customNode: CustomNode,
  jsonExtractor: JsonExtractorNode,
  databaseNode: DatabaseNode,
  knowledgeBaseNode: KnowledgeBaseNode,
  aiDialogNode: AIDialogNode,
};
