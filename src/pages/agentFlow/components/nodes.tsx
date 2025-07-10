import React from 'react';
import { NodeProps } from '@xyflow/react';
import UniversalNode from './UniversalNode';

// 使用通用节点组件创建具体的节点类型

// AI对话节点
export const AIDialogNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="aiDialogNode" />;
};

// AI摘要节点
export const AISummaryNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="aiSummaryNode" />;
};

// AI提取节点
export const AIExtractNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="aiExtractNode" />;
};

// AI JSON节点
export const AIJsonNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="aiJsonNode" />;
};

// 数据库节点
export const DatabaseNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="databaseNode" />;
};

// 知识库节点
export const KnowledgeBaseNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="knowledgeBaseNode" />;
};

// Bing搜索节点
export const BingNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="bingNode" />;
};

// HTTP请求节点
export const HttpNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="httpNode" />;
};

// 开始节点
export const StartNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="startNode" />;
};

// 结束节点
export const EndNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="endNode" />;
};

// 响应输出节点
export const ResponseNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="responseNode" />;
};

// 条件判断节点
export const ConditionNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="conditionNode" />;
};

// 决策节点
export const DecisionNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="decisionNode" />;
};

// 基础节点
export const BasicNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="basicNode" />;
};

// 处理节点
export const ProcessNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="processNode" />;
};

// 自定义节点
export const CustomNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="customNode" />;
};

// JSON提取器节点
export const JsonExtractorNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="jsonExtractor" />;
};

// JSON处理节点
export const JsonProcessNode: React.FC<NodeProps> = (props) => {
  return <UniversalNode {...props} nodeType="jsonProcessNode" />;
};

// 兼容旧的组件名称
export const DefaultNode = BasicNode;
export const TextNode = BasicNode;
export const ImageNode = BasicNode;
export const LLMNode = AIDialogNode;
export const JavaScriptNode = CustomNode;
export const KnowledgeNode = KnowledgeBaseNode;

// 导出所有自定义节点类型映射
export const nodeTypes = {
  // AI处理节点
  aiDialogNode: AIDialogNode,
  aiSummaryNode: AISummaryNode,
  aiExtractNode: AIExtractNode,
  aiJsonNode: AIJsonNode,

  // 数据处理节点
  databaseNode: DatabaseNode,
  knowledgeBaseNode: KnowledgeBaseNode,
  bingNode: BingNode,
  httpNode: HttpNode,

  // 控制节点
  startNode: StartNode,
  endNode: EndNode,
  responseNode: ResponseNode,

  // 逻辑控制节点
  conditionNode: ConditionNode,
  decisionNode: DecisionNode,

  // 基础节点
  basicNode: BasicNode,
  processNode: ProcessNode,
  customNode: CustomNode,
  jsonExtractor: JsonExtractorNode,
  jsonProcessNode: JsonProcessNode,

  // 兼容旧的节点类型名称
  knowledgeNode: KnowledgeBaseNode,
  llmNode: AIDialogNode,
  textNode: BasicNode,
  imageNode: BasicNode,
  defaultNode: BasicNode,
  javascriptNode: CustomNode,
};
