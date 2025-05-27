import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./index.css";
import NodePanel from "./components/NodePanel";
import PropertiesPanel from "./components/PropertiesPanel";
import { nodeTypes } from "./components/nodes";

// Define initial nodes with proper typing
const initialNodes: Node[] = [
  {
    id: "start",
    type: "startNode",
    position: { x: 100, y: 200 },
    data: { label: "开始" },
    deletable: false,
  },
  {
    id: "end",
    type: "endNode",
    position: { x: 700, y: 200 },
    data: { label: "结束" },
    deletable: false,
  },
];

// Define initial edges with proper typing
const initialEdges: Edge[] = [
  {
    id: "start-end",
    source: "start",
    target: "end",
    type: "smoothstep",
    animated: true,
  },
];

// Change to export default function pattern like in application/index.tsx
export default function AgentFlowPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize the flow after the component has mounted
  useEffect(() => {
    setTimeout(() => {
      setInitialized(true);
    }, 100);
  }, []);

  // Callback for ReactFlow initialization
  const onInit = useCallback(
    (instance: ReactFlowInstance) => {
      setReactFlowInstance(instance);
      // Apply fit view after initialization
      setTimeout(() => {
        instance.fitView({ padding: 0.2 });
      }, 50);
    },
    [setReactFlowInstance]
  );

  // 拖拽添加节点
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      // Use screenToFlowPosition instead of project
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const id = `${type}-${Date.now()}`;
      setNodes((nds) =>
        nds.concat({
          id,
          type,
          position,
          data: { label: type.replace(/Node$/, "") },
        })
      );
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 选中节点时显示属性面板
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // 点击空白处清除选中
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // 更新节点参数
  const onNodeDataChange = (id: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...data } } : node))
    );
  };

  // 删除节点时自动删除相关边
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setEdges((eds) => eds.filter((e) => !deleted.some((n) => n.id === e.source || n.id === e.target)));
      setSelectedNode(null);
    },
    [setEdges]
  );

  // 连线
  const onConnect = useCallback((params: Connection) =>
    setEdges((eds) => addEdge({ ...params, type: "smoothstep" }, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="agent-flow-root">
        <div className="node-panel-wrapper">
          <NodePanel />
        </div>
        <div className="flow-canvas-wrapper" ref={reactFlowWrapper}>
          {initialized && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              nodeTypes={nodeTypes}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onNodesDelete={onNodesDelete}
              defaultEdgeOptions={{ type: "smoothstep" }}
              fitView
              minZoom={0.1}
              maxZoom={1.5}
            >
              <Background variant="dots" gap={16} size={1} />
              <Controls />
              <Panel position="top-right">
                <span style={{ fontWeight: 500 }}>AI Agent 流程设计器</span>
              </Panel>
              <MiniMap style={{ height: 120 }} zoomable pannable />
            </ReactFlow>
          )}
        </div>
        <div className="properties-panel-wrapper">
          <PropertiesPanel node={selectedNode} onChange={onNodeDataChange} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

