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
    <div style={{ position: 'relative' }}>
      {!isStart && !isEnd && (
        <div className="node-delete-btn" onClick={handleDelete}>
          <CloseCircleFilled />
        </div>
      )}
      {children}
    </div>
  );
};

// 基础节点
const BasicNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-blue-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// 处理节点
const ProcessNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-green-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// 判断节点
const DecisionNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-yellow-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} id="a" />
      <Handle type="source" position={Position.Right} id="b" />
    </div>
  </NodeWrapper>
);

// 开始节点
const StartNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data} isStart={true}>
    <div className="p-3 rounded-md bg-purple-100 border-2 border-purple-500 shadow-md">
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// 结束节点
const EndNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data} isEnd={true}>
    <div className="p-3 rounded-md bg-red-100 border-2 border-red-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
    </div>
  </NodeWrapper>
);

// 条件节点
const ConditionNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-orange-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} id="true" />
      <Handle type="source" position={Position.Right} id="false" />
    </div>
  </NodeWrapper>
);

// 自定义节点
const CustomNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-indigo-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// JSON提取器节点
const JsonExtractorNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-pink-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// 数据库节点
const DatabaseNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-cyan-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// 知识库节点
const KnowledgeBaseNode = ({ id, data }: NodeProps) => (
  <NodeWrapper id={id} data={data}>
    <div className="p-3 rounded-md bg-white border-2 border-lime-500 shadow-md">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  </NodeWrapper>
);

// AI对话节点
const AIDialogNode = ({ id, data, selected }: NodeProps) => {
  // 从数据中获取参数，如果不存在则使用默认值
  const [localData, setLocalData] = useState({
    inputSource: data.inputSource || '上一步结果',
    model: data.model || 'gpt-3.5-turbo',
    systemPrompt: data.systemPrompt || '',
    temperature: data.temperature || 0.7,
    fixedInput: data.fixedInput || '',
    ...data
  });

  const { setNodes } = useReactFlow();
  const [isExpanded, setIsExpanded] = useState(false);

  // 同步外部数据变化到本地状态
  useEffect(() => {
    setLocalData(prev => ({
      ...prev,
      inputSource: data.inputSource || '上一步结果',
      model: data.model || 'gpt-3.5-turbo',
      systemPrompt: data.systemPrompt || '',
      temperature: data.temperature || 0.7,
      fixedInput: data.fixedInput || '',
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
        className="ai-dialog-node-container"
        onClick={stopPropagation}
        style={{
          width: 300,
          background: 'white',
          border: selected ? '2px solid #1677ff' : '1px solid #d9d9d9',
          boxShadow: selected ? '0 0 0 2px rgba(22, 119, 255, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
          position: 'relative',
        }}
      >
        {/* 输入连接点 */}
        <Handle
          type="target"
          position={Position.Left}
          style={{
            top: '50%',
            background: '#1677ff',
            border: '2px solid white',
            width: '12px',
            height: '12px'
          }}
        />

        {/* 头部 */}
        <div
          className="ai-dialog-node-header"
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)',
            borderBottom: '1px solid #e6f4ff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '4px 4px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <RobotOutlined style={{ color: '#1677ff', marginRight: '8px' }} />
            <span style={{ fontWeight: 600, color: '#1677ff' }}>AI对话</span>
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
            />
          </Tooltip>
        </div>

        {/* 内容区域 */}
        <div style={{ padding: '16px' }}>
          <Form layout="vertical" size="small">
            {/* 基础配置 */}
            <Form.Item label="输入来源" style={{ marginBottom: 12 }}>
              <Select
                value={localData.inputSource}
                style={{ width: '100%' }}
                onChange={handleSelectChange('inputSource')}
                onClick={handleSelectClick}
                dropdownMatchSelectWidth={false}
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
              >
                <Option value="上一步结果">上一步结果</Option>
                <Option value="用户输入">用户输入</Option>
                <Option value="固定值">固定值</Option>
                <Option value="混合输入">混合输入</Option>
              </Select>
            </Form.Item>

            {localData.inputSource === '固定值' && (
              <Form.Item label="固定输入内容" style={{ marginBottom: 12 }}>
                <TextArea
                  rows={2}
                  value={localData.fixedInput}
                  onChange={handleInputChange('fixedInput')}
                  placeholder="输入固定的提示内容..."
                  onClick={stopPropagation}
                />
              </Form.Item>
            )}

            <Form.Item label="AI模型" style={{ marginBottom: 12 }}>
              <Select
                value={localData.model}
                style={{ width: '100%' }}
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
            </Form.Item>

            {/* 展开后显示详细配置 */}
            {isExpanded && (
              <>
                <Form.Item label="系统提示词" style={{ marginBottom: 12 }}>
                  <TextArea
                    rows={4}
                    value={localData.systemPrompt}
                    onChange={handleInputChange('systemPrompt')}
                    placeholder="输入系统提示词..."
                    onClick={stopPropagation}
                  />
                </Form.Item>

                <Form.Item label={`温度: ${localData.temperature}`} style={{ marginBottom: 0 }}>
                  <div onClick={stopPropagation}>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={localData.temperature}
                      onChange={handleSliderChange('temperature')}
                    />
                  </div>
                </Form.Item>
              </>
            )}
          </Form>
        </div>

        {/* 输出连接点 */}
        <Handle
          type="source"
          position={Position.Right}
          style={{
            top: '50%',
            background: '#52c41a',
            border: '2px solid white',
            width: '12px',
            height: '12px'
          }}
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
