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
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./index.css";
import { nodeTypes } from "./components/nodes";
import { Button, Dropdown, Menu, message, Tooltip } from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  DownOutlined,
  ExportOutlined,
  ImportOutlined,
  UndoOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import PropertiesPanel from "./components/PropertiesPanel";
import NodePanel from "./components/NodePanel";

// 节点分类数据
const nodeCategories = [
  {
    key: "basic",
    label: "基础节点",
    children: [
      { key: "basicNode", label: "基础节点" },
      { key: "startNode", label: "开始节点" },
      { key: "endNode", label: "结束节点" },
    ],
  },
  {
    key: "process",
    label: "处理节点",
    children: [
      { key: "processNode", label: "处���节点" },
      { key: "decisionNode", label: "判断节点" },
    ],
  },
  {
    key: "ai",
    label: "AI节点",
    children: [
      { key: "aiDialogNode", label: "AI对话" }, // 添加AI对话节点
      { key: "conditionNode", label: "条件节点" },
      { key: "customNode", label: "自定义节点" },
      { key: "jsonExtractor", label: "JSON提取器" },
    ],
  },
  {
    key: "data",
    label: "数据节点",
    children: [
      { key: "databaseNode", label: "数据库节点" },
      { key: "knowledgeBaseNode", label: "知识库节点" },
    ],
  },
];

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

export default function AgentFlowPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [nodePanelVisible, setNodePanelVisible] = useState(false);

  // 添加历史记录相关状态
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const ignoreHistoryRef = useRef(false);

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

  // 自定义节点变更处理函数，记录历史
  const handleNodesChange = useCallback(
    (changes: any) => {
      if (ignoreHistoryRef.current) {
        onNodesChange(changes);
        return;
      }

      setNodes((nds) => {
        const newNodes = applyNodeChanges(changes, nds);

        // 添加新状态到历史记录
        const currentHistory = history.slice(0, historyIndex + 1);
        setHistory([...currentHistory, { nodes: newNodes, edges }]);
        setHistoryIndex(historyIndex + 1);

        return newNodes;
      });
    },
    [edges, history, historyIndex, onNodesChange, setNodes]
  );

  // 自定义边缘变更处理函数，记录历史
  const handleEdgesChange = useCallback(
    (changes: any) => {
      if (ignoreHistoryRef.current) {
        onEdgesChange(changes);
        return;
      }

      setEdges((eds) => {
        const newEdges = applyEdgeChanges(changes, eds);

        // 添加新状态到历史记录
        const currentHistory = history.slice(0, historyIndex + 1);
        setHistory([...currentHistory, { nodes, edges: newEdges }]);
        setHistoryIndex(historyIndex + 1);

        return newEdges;
      });
    },
    [nodes, history, historyIndex, onEdgesChange, setEdges]
  );

  // 自定义连接处理函数，记录历史
  const handleConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ ...params, type: "smoothstep" }, eds);

        // 添加新状态到历史记录
        const currentHistory = history.slice(0, historyIndex + 1);
        setHistory([...currentHistory, { nodes, edges: newEdges }]);
        setHistoryIndex(historyIndex + 1);

        return newEdges;
      });
    },
    [nodes, history, historyIndex, setEdges]
  );

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

  // 处理拖放功能
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // 处理拖放放置
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const label = event.dataTransfer.getData("node/label");

      if (!type) {
        return;
      }

      // 获取放置位置
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // 创建新节点
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: label || type },
      };

      setNodes((nds) => nds.concat(newNode));
      message.success(`添加了 ${label} 节点`);
    },
    [reactFlowInstance, setNodes]
  );

  // 添加新节点
  const handleAddNode = (nodeType: string, label: string) => {
    if (!reactFlowInstance) return;

    // 获取视口中心位置
    const center = reactFlowInstance.getViewport();
    const position = reactFlowInstance.project({
      x: window.innerWidth / 2 - center.x / center.zoom,
      y: window.innerHeight / 3 - center.y / center.zoom,
    });

    // 创建新节点
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: { label },
    };

    setNodes((nds) => {
      const newNodes = nds.concat(newNode);

      // 添加新状态到历史记录
      const currentHistory = history.slice(0, historyIndex + 1);
      setHistory([...currentHistory, { nodes: newNodes, edges }]);
      setHistoryIndex(historyIndex + 1);

      return newNodes;
    });

    message.success(`添加了 ${label} 节点`);
  };

  // 删除选中节点
  const handleDeleteSelectedNode = () => {
    if (selectedNode) {
      if (selectedNode.deletable === false) {
        message.warning("该节点不允许删除");
        return;
      }

      const newNodes = nodes.filter((node) => node.id !== selectedNode.id);
      const newEdges = edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id);

      // 添加新状态到历史记录
      const currentHistory = history.slice(0, historyIndex + 1);
      setHistory([...currentHistory, { nodes: newNodes, edges: newEdges }]);
      setHistoryIndex(historyIndex + 1);

      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNode(null);

      message.success("节点已删除");
    } else {
      message.info("请先选择要删除的节点");
    }
  };

  // 保存工作流
  const handleSaveFlow = () => {
    const flow = reactFlowInstance?.toObject();
    console.log("保存工作流:", flow);
    message.success("工作流已保存");
    // 这里添加实际的保存逻辑
  };

  // 实现撤销功能
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      ignoreHistoryRef.current = true;
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      setTimeout(() => {
        ignoreHistoryRef.current = false;
      }, 0);
    } else {
      message.info("没有可撤销的操作");
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // 实现重做功能
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      ignoreHistoryRef.current = true;
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      setTimeout(() => {
        ignoreHistoryRef.current = false;
      }, 0);
    } else {
      message.info("没有可重做的操作");
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // 切换节点面板显示状态
  const toggleNodePanel = () => {
    setNodePanelVisible(!nodePanelVisible);
  };

  return (
    <ReactFlowProvider>
      <div className="agent-flow-container">
        {/* 顶部功能区 */}
        <div className="agent-flow-header">
          <div className="agent-flow-title">
            <h1>工作流设计器</h1>
          </div>
          <div className="agent-flow-actions">
            {/* 替换原来的两个按钮为一个切换节点面板的按钮 */}
            <Tooltip title={nodePanelVisible ? "关闭节点面板" : "打开节点面板"}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={toggleNodePanel}
              >
                节点面板
              </Button>
            </Tooltip>

            <Tooltip title="删除选中节点">
              <Button
                icon={<DeleteOutlined />}
                onClick={handleDeleteSelectedNode}
                disabled={!selectedNode || selectedNode.deletable === false}
                danger
              />
            </Tooltip>

            <Tooltip title="保存工作流">
              <Button icon={<SaveOutlined />} onClick={handleSaveFlow} />
            </Tooltip>

            <Tooltip title="撤销">
              <Button
                icon={<UndoOutlined />}
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              />
            </Tooltip>

            <Tooltip title="重做">
              <Button
                icon={<RedoOutlined />}
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              />
            </Tooltip>

            <Tooltip title="导入">
              <Button icon={<ImportOutlined />} />
            </Tooltip>

            <Tooltip title="导出">
              <Button icon={<ExportOutlined />} />
            </Tooltip>
          </div>
        </div>

        {/* 主体面板区 */}
        <div className="agent-flow-body">
          {/* 节点面板 - 可拖拽区域 */}
          {nodePanelVisible && (
            <div className="agent-flow-node-panel">
              <NodePanel categories={nodeCategories} />
            </div>
          )}

          {/* 流程设计画布 */}
          <div className="agent-flow-canvas" ref={reactFlowWrapper}>
            {initialized && (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onInit={onInit}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodesDelete={onNodesDelete}
                onDragOver={onDragOver}
                onDrop={onDrop}
                defaultEdgeOptions={{ type: "smoothstep" }}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
              >
                <Background variant="dots" gap={16} size={1} />
                <Controls />
                <MiniMap style={{ height: 120 }} zoomable pannable />
              </ReactFlow>
            )}
          </div>

          {/* 属性面板 */}
          <div className="agent-flow-properties">
            <PropertiesPanel node={selectedNode} onChange={onNodeDataChange} />
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

