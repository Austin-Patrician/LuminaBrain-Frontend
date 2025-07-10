import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Node,
  Edge,
  ReactFlowInstance,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { message } from 'antd';

interface FlowEditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdges: string[];
  reactFlowInstance: ReactFlowInstance | null;
  initialized: boolean;
}

interface FlowEditorActions {
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: Connection) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onSelectionChange: (params: { nodes: Node[]; edges: Edge[] }) => void;
  onPaneClick: () => void;
  onInit: (instance: ReactFlowInstance) => void;
  onNodeDataChange: (nodeId: string, newData: any) => void;
  onNodeLabelChange: (nodeId: string, newLabel: string) => void;
  onNodesDelete: (deleted: Node[]) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

interface UseFlowEditorProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onStateChange?: (state: FlowEditorState) => void;
  reactFlowWrapper?: React.RefObject<HTMLDivElement>;
}

export const useFlowEditor = ({
  initialNodes,
  initialEdges,
  onStateChange,
  reactFlowWrapper,
}: UseFlowEditorProps): FlowEditorState & FlowEditorActions => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [initialized, setInitialized] = useState(false);

  const ignoreHistoryRef = useRef(false);

  // 状态变化通知
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        nodes,
        edges,
        selectedNode,
        selectedEdges,
        reactFlowInstance,
        initialized,
      });
    }
  }, [nodes, edges, selectedNode, selectedEdges, reactFlowInstance, initialized, onStateChange]);

  // 初始化
  useEffect(() => {
    setTimeout(() => {
      setInitialized(true);
    }, 100);
  }, []);

  // ReactFlow 初始化回调
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    setTimeout(() => {
      instance.fitView({ padding: 0.2 });
    }, 50);
  }, []);

  // 节点变更处理
  const onNodesChange = useCallback((changes: any) => {
    if (ignoreHistoryRef.current) {
      setNodes((nds) => applyNodeChanges(changes, nds));
      return;
    }

    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  // 边缘变更处理
  const onEdgesChange = useCallback((changes: any) => {
    if (ignoreHistoryRef.current) {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      return;
    }

    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  // 连接处理
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#1677ff', strokeWidth: 2 },
        },
        eds
      )
    );
  }, []);

  // 节点点击
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdges([]);
  }, []);

  // 连线点击
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdges([edge.id]);
    setSelectedNode(null);
  }, []);

  // 选中状态改变
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    if (params.nodes.length > 0) {
      setSelectedNode(params.nodes[0]);
      setSelectedEdges([]);
    } else if (params.edges.length > 0) {
      setSelectedEdges(params.edges.map((edge) => edge.id));
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
      setSelectedEdges([]);
    }
  }, []);

  // 点击空白处
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdges([]);
  }, []);

  // 节点数据更改
  const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );

    // 同时更新选中节点状态
    setSelectedNode((selected) => {
      if (selected && selected.id === nodeId) {
        return {
          ...selected,
          data: { ...selected.data, ...newData },
        };
      }
      return selected;
    });
  }, []);

  // 节点标签更改
  const onNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label: newLabel },
          };
        }
        return node;
      })
    );

    // 同时更新选中节点状态
    setSelectedNode((selected) => {
      if (selected && selected.id === nodeId) {
        return {
          ...selected,
          data: { ...selected.data, label: newLabel },
        };
      }
      return selected;
    });
  }, []);

  // 删除节点时自动删除相关边
  const onNodesDelete = useCallback((deleted: Node[]) => {
    setEdges((eds) =>
      eds.filter((e) => !deleted.some((n) => n.id === e.source || n.id === e.target))
    );
    setSelectedNode(null);
  }, []);

  // 拖拽相关
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance || !reactFlowWrapper?.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('node/label');

      if (!type) return;

      // 获取放置位置
      const mouseX = event.clientX - reactFlowBounds.left;
      const mouseY = event.clientY - reactFlowBounds.top;

      let position;
      if (
        mouseX >= 0 &&
        mouseX <= reactFlowBounds.width &&
        mouseY >= 0 &&
        mouseY <= reactFlowBounds.height
      ) {
        position = reactFlowInstance.screenToFlowPosition({
          x: mouseX,
          y: mouseY,
        });
      } else {
        const centerX = reactFlowBounds.width / 2;
        const centerY = reactFlowBounds.height / 2;
        position = reactFlowInstance.screenToFlowPosition({
          x: centerX,
          y: centerY,
        });
      }

      // 创建新节点
      const newNode = {
        id: generateGUID(),
        type,
        position,
        data: getDefaultNodeData(type, label || type),
      };

      setNodes((nds) => nds.concat(newNode));
      message.success(`添加了 ${label} 节点`);
    },
    [reactFlowInstance, reactFlowWrapper]
  );

  return {
    // State
    nodes,
    edges,
    selectedNode,
    selectedEdges,
    reactFlowInstance,
    initialized,
    // Actions
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onEdgeClick,
    onSelectionChange,
    onPaneClick,
    onInit,
    onNodeDataChange,
    onNodeLabelChange,
    onNodesDelete,
    onDragOver,
    onDrop,
  };
};

// 辅助函数
const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getDefaultNodeData = (nodeType: string, label: string) => {
  const baseData = {
    label: label,
    description: '',
  };

  switch (nodeType) {
    case 'aiDialogNode':
    case 'aiSummaryNode':
    case 'aiExtractNode':
    case 'aiJsonNode':
      return {
        ...baseData,
        model: '',
        systemPrompt: '',
        userMessage: '',
        temperature: 0.7,
        maxTokens: 1000,
        stream: false,
      };

    case 'databaseNode':
      return {
        ...baseData,
        dbType: 'mysql',
        connectionString: '',
        query: '',
        timeout: 30,
      };

    case 'knowledgeBaseNode':
      return {
        ...baseData,
        knowledgeBaseId: '',
        searchQuery: '',
        topK: 5,
        similarityThreshold: 0.7,
      };

    case 'bingNode':
      return {
        ...baseData,
        searchQuery: '',
        maxResults: 10,
        safeSearch: 'moderate',
      };

    case 'decisionNode':
    case 'conditionNode':
      return {
        ...baseData,
        condition: '',
        conditionType: 'javascript',
        trueBranch: '',
        falseBranch: '',
      };

    case 'jsonExtractor':
      return {
        ...baseData,
        jsonPath: '',
        extractMode: 'single',
        defaultValue: '',
      };

    case 'responseNode':
      return {
        ...baseData,
        responseTemplate: '',
        responseFormat: 'text',
        statusCode: 200,
      };

    case 'startNode':
      return {
        ...baseData,
        triggerType: 'manual',
        scheduleTime: '',
      };

    case 'endNode':
      return {
        ...baseData,
        outputFormat: 'json',
        returnCode: 0,
      };

    default:
      return {
        ...baseData,
        nodeType: nodeType,
        configurable: true,
      };
  }
};
