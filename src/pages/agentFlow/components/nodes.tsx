import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { CloseCircleFilled, RobotOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Select, Input, Slider, Tooltip, Button } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

// 删除按钮的节点包装器
const NodeWrapper = ({ children, id, isStart = false, isEnd = false }: {
  children: React.ReactNode;
  id: string;
  isStart?: boolean;
  isEnd?: boolean;
}) => {
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

// 通用节点组件
export const DefaultNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || '节点')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// 文本节点
export const TextNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || '文本')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// 图片节点
export const ImageNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || '图片')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// 开始节点
export const StartNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id} isStart={true}>
      <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-green-200">
            {String(data?.label || '开始')}
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-green-500" />
      </div>
    </NodeWrapper>
  );
};

// 结束节点
export const EndNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id} isEnd={true}>
      <div className="px-4 py-2 shadow-md rounded-md bg-red-100 border-2 border-red-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-red-200">
            {String(data?.label || '结束')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-red-500" />
      </div>
    </NodeWrapper>
  );
};

// LLM节点
export const LLMNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || 'LLM')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// HTTP节点
export const HttpNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || 'HTTP')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// JavaScript节点
export const JavaScriptNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || 'JS')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// 判断节点
export const ConditionNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || '判断')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// 知识库节点
export const KnowledgeNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <div className="flex">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
            {String(data?.label || '知识库')}
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </NodeWrapper>
  );
};

// AI对话节点 - 简化版本，配置移到右侧属性面板
export const AIDialogNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <NodeWrapper id={id}>
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
        <div className="flex items-center gap-2">
          <div className="rounded-full w-12 h-12 flex justify-center items-center bg-blue-100">
            <RobotOutlined className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-800">AI对话</div>
            <div className="text-xs text-gray-500 truncate max-w-32">
              {data?.model || 'gpt-3.5-turbo'}
            </div>
          </div>
        </div>
        <Handle type="target" position={Position.Top} className="w-16 !bg-blue-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-blue-500" />
      </div>
    </NodeWrapper>
  );
};

// 导出所有自定义节点类型
export const nodeTypes = {
  basicNode: DefaultNode,
  processNode: DefaultNode,
  decisionNode: DefaultNode,
  startNode: StartNode,
  endNode: EndNode,
  conditionNode: DefaultNode,
  customNode: DefaultNode,
  jsonExtractor: DefaultNode,
  databaseNode: DefaultNode,
  knowledgeBaseNode: DefaultNode,
  aiDialogNode: AIDialogNode,
};
