import React from "react";
import { Handle, Position } from "@xyflow/react";

interface NodeData {
  label?: string;
  [key: string]: any;
}

interface NodeProps {
  data: NodeData;
}

// 通用样式
const nodeBox: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  background: "#fff",
  minWidth: 120,
  minHeight: 40,
  padding: 10,
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: 14,
  fontWeight: 500,
};

export function StartNode({ data }: NodeProps) {
  return (
    <div style={{ ...nodeBox, border: "2px solid #1677ff", color: "#1677ff" }}>
      <span>🏁 {data.label || "开始"}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function EndNode({ data }: NodeProps) {
  return (
    <div style={{ ...nodeBox, border: "2px solid #faad14", color: "#faad14" }}>
      <span>⏹️ {data.label || "结束"}</span>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export function AiDialogNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>🤖 {data.label || "AI对话"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function AiSummaryNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>📝 {data.label || "摘要总结"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function AiExtractNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>📄 {data.label || "内容提取"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function AiJsonNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>🔧 {data.label || "Json提取器"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function DbNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>🗄️ {data.label || "数据库"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function KnowledgeNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>📚 {data.label || "知识库"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function BingNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>🔍 {data.label || "Bing搜索"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
export function ResponseNode({ data }: NodeProps) {
  return (
    <div style={nodeBox}>
      <span>💬 {data.label || "固定回答"}</span>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  aiDialogNode: AiDialogNode,
  aiSummaryNode: AiSummaryNode,
  aiExtractNode: AiExtractNode,
  aiJsonNode: AiJsonNode,
  dbNode: DbNode,
  knowledgeNode: KnowledgeNode,
  bingNode: BingNode,
  responseNode: ResponseNode,
};
