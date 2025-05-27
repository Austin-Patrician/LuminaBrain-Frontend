import React from "react";

interface NodeType {
  type: string;
  label: string;
  icon: string;
}

interface NodeGroup {
  title: string;
  nodes: NodeType[];
}

const NODE_GROUPS: NodeGroup[] = [
  {
    title: "AI处理节点",
    nodes: [
      { type: "aiDialogNode", label: "AI对话", icon: "🤖" },
      { type: "aiSummaryNode", label: "摘要总结", icon: "📝" },
      { type: "aiExtractNode", label: "内容提取", icon: "📄" },
      { type: "aiJsonNode", label: "Json提取器", icon: "🔧" },
    ],
  },
  {
    title: "数据节点",
    nodes: [
      { type: "dbNode", label: "数据库", icon: "🗄️" },
      { type: "knowledgeNode", label: "知识库", icon: "📚" },
      { type: "bingNode", label: "Bing搜索", icon: "🔍" },
    ],
  },
  {
    title: "响应节点",
    nodes: [
      { type: "responseNode", label: "固定回答", icon: "💬" },
    ],
  },
  {
    title: "基础节点",
    nodes: [
      { type: "startNode", label: "开始", icon: "🏁" },
      { type: "endNode", label: "结束", icon: "⏹️" },
    ],
  },
];

function NodePanel() {
  // 拖拽开始
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div>
      <div className="node-panel-title">节点面板</div>
      {NODE_GROUPS.map((group) => (
        <div className="node-panel-group" key={group.title}>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>{group.title}</div>
          {group.nodes.map((node) => (
            <div
              className="node-panel-item"
              key={node.type}
              draggable
              onDragStart={(e) => onDragStart(e, node.type)}
            >
              <span className="node-panel-item-icon">{node.icon}</span>
              {node.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default NodePanel;
