import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { nodeTypes } from "./components/nodes";
import { Button, message, Tooltip, Modal, Input, Form, Select, Tag } from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  DeleteOutlined,
  UndoOutlined,
  RedoOutlined,
  RobotOutlined,
  DatabaseOutlined,
  BranchesOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  FileTextOutlined,
  SearchOutlined,
  CloudOutlined,
  MessageOutlined,
  LeftOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import PropertiesPanel from "./components/PropertiesPanel";
import NodePanel from "./components/NodePanel";
import { flowService, FlowDataRaw } from "../../api/services/flowService";
import { useNavigate, useSearchParams } from "react-router";
import DebugPanel from "./components/DebugPanel";
import WorkflowExecutor, { DebugNodeResult } from "./services/workflowExecutor";
import ReactMarkdown from 'react-markdown';

const { TextArea } = Input;
const { Option } = Select;

// 生成36位GUID的工具函数
const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 获取节点默认属性的函数
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
        model: '', // 移除默认值，让用户必须选择
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

// 节点图标映射函数
const getNodeIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    aiDialogNode: <RobotOutlined />,
    aiSummaryNode: <FileTextOutlined />,
    aiExtractNode: <ThunderboltOutlined />,
    aiJsonNode: <SettingOutlined />,
    databaseNode: <DatabaseOutlined />,
    knowledgeBaseNode: <CloudOutlined />,
    bingNode: <SearchOutlined />,
    responseNode: <MessageOutlined />,
    startNode: <PlayCircleOutlined />,
    endNode: <StopOutlined />,
    basicNode: <ThunderboltOutlined />,
    processNode: <SettingOutlined />,
    decisionNode: <BranchesOutlined />,
    conditionNode: <BranchesOutlined />,
    customNode: <SettingOutlined />,
    jsonExtractor: <SettingOutlined />,
  };
  return iconMap[type] || <ThunderboltOutlined />;
};

// 节点颜色映射函数
const getNodeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    aiDialogNode: "blue",
    aiSummaryNode: "cyan",
    aiExtractNode: "purple",
    aiJsonNode: "magenta",
    databaseNode: "teal",
    knowledgeBaseNode: "lime",
    bingNode: "orange",
    responseNode: "green",
    startNode: "emerald",
    endNode: "red",
    basicNode: "blue",
    processNode: "green",
    decisionNode: "yellow",
    conditionNode: "orange",
    customNode: "indigo",
    jsonExtractor: "pink",
  };
  return colorMap[type] || "gray";
};

// 节点分类数据 - 修复为正确的数据结构
const nodeCategories = [
  {
    key: "ai",
    label: "AI处理节点",
    children: [
      { type: "aiDialogNode", label: "AI对话", icon: getNodeIcon("aiDialogNode"), color: getNodeColor("aiDialogNode"), description: "与AI模型进行对话交互" },
      { type: "aiSummaryNode", label: "摘要总结", icon: getNodeIcon("aiSummaryNode"), color: getNodeColor("aiSummaryNode"), description: "对文本内容进行智能摘要" },
      { type: "aiExtractNode", label: "内容提取", icon: getNodeIcon("aiExtractNode"), color: getNodeColor("aiExtractNode"), description: "从文本中提取关键信息" },
      { type: "aiJsonNode", label: "JSON处理", icon: getNodeIcon("aiJsonNode"), color: getNodeColor("aiJsonNode"), description: "AI处理JSON数据格式" },
    ],
  },
  {
    key: "data",
    label: "数据处理节点",
    children: [
      { type: "databaseNode", label: "数据库查询", icon: getNodeIcon("databaseNode"), color: getNodeColor("databaseNode"), description: "执行数据库查询操作" },
      { type: "knowledgeBaseNode", label: "知识库检索", icon: getNodeIcon("knowledgeBaseNode"), color: getNodeColor("knowledgeBaseNode"), description: "从知识库中检索相关信息" },
      { type: "bingNode", label: "必应搜索", icon: getNodeIcon("bingNode"), color: getNodeColor("bingNode"), description: "使用必应进行网络搜索" },
    ],
  },
  {
    key: "control",
    label: "控制节点",
    children: [
      { type: "startNode", label: "开始", icon: getNodeIcon("startNode"), color: getNodeColor("startNode"), description: "工作流开始节点" },
      { type: "endNode", label: "结束", icon: getNodeIcon("endNode"), color: getNodeColor("endNode"), description: "工作流结束节点" },
      { type: "responseNode", label: "响应输出", icon: getNodeIcon("responseNode"), color: getNodeColor("responseNode"), description: "输出最终响应结果" },
    ],
  },
  {
    key: "basic",
    label: "基础节点",
    children: [
      { type: "basicNode", label: "基础节点", icon: getNodeIcon("basicNode"), color: getNodeColor("basicNode"), description: "基础功能节点" },
      { type: "processNode", label: "处理节点", icon: getNodeIcon("processNode"), color: getNodeColor("processNode"), description: "数据处理和转换节点" },
      { type: "decisionNode", label: "判断节点", icon: getNodeIcon("decisionNode"), color: getNodeColor("decisionNode"), description: "条件判断和分支节点" },
      { type: "conditionNode", label: "条件节点", icon: getNodeIcon("conditionNode"), color: getNodeColor("conditionNode"), description: "逻辑条件处理节点" },
      { type: "customNode", label: "自定义节点", icon: getNodeIcon("customNode"), color: getNodeColor("customNode"), description: "可自定义功能的节点" },
      { type: "jsonExtractor", label: "JSON提取器", icon: getNodeIcon("jsonExtractor"), color: getNodeColor("jsonExtractor"), description: "从JSON中提取特定数据" },
    ],
  },
];

// Define initial nodes with proper typing and GUID IDs
const initialNodes: Node[] = [
  {
    id: generateGUID(),
    type: "startNode",
    position: { x: 100, y: 200 },
    data: getDefaultNodeData("startNode", "开始"),
    deletable: false,
  },
  {
    id: generateGUID(),
    type: "endNode",
    position: { x: 700, y: 200 },
    data: getDefaultNodeData("endNode", "结束"),
    deletable: false,
  },
];

// Define initial edges with proper typing
const initialEdges: Edge[] = [];

const snapGrid: [number, number] = [20, 20];
const defaultViewport = { x: 0, y: 0, zoom: 1 };

const AgentFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('id');

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]); // 添加选中连线状态
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [nodePanelVisible, setNodePanelVisible] = useState(true);

  // 流程保存相关状态
  const [currentFlow, setCurrentFlow] = useState<FlowDataRaw | null>(null);
  const [isFlowModified, setIsFlowModified] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 添加历史记录相关状态
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const ignoreHistoryRef = useRef(false);

  // 调试相关状态
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [debugResults, setDebugResults] = useState<Record<string, DebugNodeResult>>({});
  const isDebugMode = Object.keys(debugResults).length > 0;

  // Markdown查看器状态
  const [markdownViewerVisible, setMarkdownViewerVisible] = useState(false);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState('');

  // WorkflowExecutor实例
  const workflowExecutorRef = useRef<WorkflowExecutor>(new WorkflowExecutor());

  // 页面加载时检查是否有流程ID，如果有则加载流程
  useEffect(() => {
    if (flowId) {
      loadFlow(flowId);
    }
  }, [flowId]);

  // 监听节点和边的变化，标记为已修改
  useEffect(() => {
    if (initialized && currentFlow) {
      setIsFlowModified(true);
    }
  }, [nodes, edges, initialized]);

  // 加载流程数据
  const loadFlow = async (id: string) => {
    setLoading(true);
    try {
      const flowData = await flowService.getFlowById(id);
      setCurrentFlow(flowData);

      if (flowData.nodes && flowData.edges) {
        setNodes(flowData.nodes);
        setEdges(flowData.edges);

        // 重置历史记录
        setHistory([{ nodes: flowData.nodes, edges: flowData.edges }]);
        setHistoryIndex(0);

        // 如果有视口信息，应用它
        if (flowData.viewport && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.setViewport(flowData.viewport!);
          }, 100);
        }
      }

      setIsFlowModified(false);
      message.success('流程加载成功');
    } catch (error) {
      message.error('流程加载失败');
      console.error('Load flow error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 验证流程配置的函数
  const validateFlowConfiguration = (nodes: Node[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 检查AI节点是否选择了AI模型
    const aiNodeTypes = ['aiDialogNode', 'aiSummaryNode', 'aiExtractNode', 'aiJsonNode'];

    nodes.forEach((node) => {
      if (aiNodeTypes.includes(node.type || '')) {
        const nodeData = node.data || {};

        // 检查AI模型是否为空，确保model是字符串类型
        if (!nodeData.model || (typeof nodeData.model === 'string' && nodeData.model.trim() === '')) {
          errors.push(`节点"${nodeData.label || node.type}"未选择AI模型`);
        }

        // 可以添加其他必填字段的验证
        // if (!nodeData.systemPrompt || nodeData.systemPrompt.trim() === '') {
        //   errors.push(`节点"${nodeData.label || node.type}"未设置系统提示词`);
        // }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // 保存流程
  const saveFlow = async (flowData: Partial<FlowDataRaw>) => {
    if (!reactFlowInstance) return;

    const flowObject = reactFlowInstance.toObject();

    // 确保必需字段有值
    if (!flowData.name) {
      message.error('流程名称不能为空');
      return;
    }

    // 验证流程配置
    const validation = validateFlowConfiguration(flowObject.nodes);
    if (!validation.isValid) {
      Modal.error({
        title: '流程配置验证失败',
        content: (
          <div>
            <p>请修复以下问题后再保存：</p>
            <ul className="mt-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-red-600">• {error}</li>
              ))}
            </ul>
          </div>
        ),
        okText: '知道了',
      });
      return;
    }

    const saveData: FlowDataRaw = {
      name: flowData.name,
      description: flowData.description || '',
      nodes: flowObject.nodes,
      edges: flowObject.edges,
      viewport: flowObject.viewport,
      nodeCount: flowObject.nodes.length,
      connectionCount: flowObject.edges.length,
      tags: flowData.tags || [],
    };

    setLoading(true);
    try {
      let result;
      if (currentFlow?.id) {
        // 更新现有流程
        result = await flowService.updateFlow(currentFlow.id, saveData);
        message.success('流程保存成功');
      } else {
        // 创建新流程
        result = await flowService.createFlow(saveData);
        message.success('流程创建成功');

        console.log('New flow created with ID:', result);
        // 更新URL，添加流程ID
        navigate(`/agentFlow/editor?id=${result}`, { replace: true });
      }

      setCurrentFlow(result);
      setIsFlowModified(false);

      // 保存成功后更新历史记录，防止继续显示未保存状态
      setHistory([{ nodes: flowObject.nodes, edges: flowObject.edges }]);
      setHistoryIndex(0);

    } catch (error) {
      message.error(currentFlow?.id ? '流程保存失败' : '流程创建失败');
      console.error('Save flow error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发布流程
  const publishFlow = async () => {
    if (!currentFlow?.id) {
      message.warning('请先保存流程');
      return;
    }

    try {
      await flowService.publishFlow(currentFlow.id);
      setCurrentFlow({ ...currentFlow, status: 'published' });
      message.success('流程发布成功');
      setPublishModalVisible(false);
    } catch (error) {
      message.error('流程发布失败');
      console.error('Publish flow error:', error);
    }
  };

  // 返回流程列表
  const handleBackToList = () => {
    if (isFlowModified) {
      Modal.confirm({
        title: '未保存的更改',
        content: '您有未保存的更改，确定要离开吗？',
        onOk: () => navigate('/agentFlow/list'),
        okText: '确定',
        cancelText: '取消',
      });
    } else {
      navigate('/agentFlow/list');
    }
  };

  // 快速保存
  const handleQuickSave = async () => {
    if (!currentFlow) {
      // 新流程直接打开保存对话框
      setSaveModalVisible(true);
      return;
    }

    // 现有流程快速保存
    await saveFlow({
      name: currentFlow.name,
      description: currentFlow.description,
      tags: currentFlow.tags,
    });
  };


  // 添加历史记录的辅助函数
  const addToHistory = useCallback((newState: { nodes: Node[]; edges: Edge[] }) => {
    const currentHistory = history.slice(0, historyIndex + 1);
    setHistory([...currentHistory, newState]);
    setHistoryIndex(historyIndex + 1);
  }, [history, historyIndex]);

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
        const newEdges = addEdge({
          ...params,
          type: "smoothstep",
          animated: true,
          style: { stroke: '#1677ff', strokeWidth: 2 }
        }, eds);

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
    setSelectedEdges([]); // 清除连线选中状态
  }, []);

  // 连线点击事件处理
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdges([edge.id]);
    setSelectedNode(null); // 清除节点选中状态
  }, []);

  // 选中状态改变处理
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    // 更新选中的节点
    if (params.nodes.length > 0) {
      setSelectedNode(params.nodes[0]);
      setSelectedEdges([]);
    } else if (params.edges.length > 0) {
      setSelectedEdges(params.edges.map(edge => edge.id));
      setSelectedNode(null);
    } else {
      setSelectedNode(null);
      setSelectedEdges([]);
    }
  }, []);

  // 点击空白处清除选中
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdges([]);
  }, []);

  // 节点数据更改处理函数
  const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: { ...node.data, ...newData }
          };
          return updatedNode;
        }
        return node;
      })
    );

    // 同时更新选中节点状态
    setSelectedNode((selected) => {
      if (selected && selected.id === nodeId) {
        return {
          ...selected,
          data: { ...selected.data, ...newData }
        };
      }
      return selected;
    });

    // 保存到历史记录
    const newFlowData = {
      nodes: nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData }
          };
        }
        return node;
      }),
      edges
    };

    addToHistory(newFlowData);
  }, [nodes, edges, addToHistory]);

  // 节点名称更改处理函数
  const onNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: { ...node.data, label: newLabel }
          };
          return updatedNode;
        }
        return node;
      })
    );

    // 同时更新选中节点状态
    setSelectedNode((selected) => {
      if (selected && selected.id === nodeId) {
        return {
          ...selected,
          data: { ...selected.data, label: newLabel }
        };
      }
      return selected;
    });

    // 保存到历史记录
    const newFlowData = {
      nodes: nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label: newLabel }
          };
        }
        return node;
      }),
      edges
    };

    addToHistory(newFlowData);
  }, [nodes, edges, addToHistory]);

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
      let position;

      // 检查是否是从节点面板拖拽（没有具体的鼠标位置或位置在画布外）
      const mouseX = event.clientX - reactFlowBounds.left;
      const mouseY = event.clientY - reactFlowBounds.top;

      // 如果鼠标位置在画布边界内，使用鼠标位置
      if (mouseX >= 0 && mouseX <= reactFlowBounds.width &&
        mouseY >= 0 && mouseY <= reactFlowBounds.height) {
        position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      } else {
        // 否则将节点放置在当前视图的中央
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
    [reactFlowInstance, setNodes]
  );

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

  // 切换调试面板显示/隐藏
  const toggleDebugPanel = () => {
    console.log('Toggle debug panel clicked, current state:', debugPanelVisible);
    setDebugPanelVisible(!debugPanelVisible);
    console.log('Debug panel state will change to:', !debugPanelVisible);
  };

  // 显示Markdown结果
  const handleShowMarkdownResult = (result: DebugNodeResult) => {
    setCurrentMarkdownContent(result.markdownOutput || '');
    setMarkdownViewerVisible(true);
  };

  // 删除选中元素
  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      handleDeleteSelectedNode();
    } else if (selectedEdges.length > 0) {
      handleDeleteSelectedEdges();
    }
  }, [selectedNode, selectedEdges]);

  // 删除选中节点
  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNode) {
      message.info("请先选择要删除的节点");
      return;
    }

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
  }, [selectedNode, nodes, edges, history, historyIndex, setNodes, setEdges]);

  // 删除选中连线
  const handleDeleteSelectedEdges = useCallback(() => {
    if (selectedEdges.length === 0) {
      message.info("请先选择要删除的连线");
      return;
    }

    const newEdges = edges.filter((edge) => !selectedEdges.includes(edge.id));

    // 添加新状态到历史记录
    const currentHistory = history.slice(0, historyIndex + 1);
    setHistory([...currentHistory, { nodes, edges: newEdges }]);
    setHistoryIndex(historyIndex + 1);

    setEdges(newEdges);
    setSelectedEdges([]);

    message.success(`已删除 ${selectedEdges.length} 条连线`);
  }, [selectedEdges, edges, nodes, history, historyIndex, setEdges]);

  // 保存流程模态框
  const saveModal = (
    <Modal
      title="保存流程"
      open={saveModalVisible}
      onCancel={() => setSaveModalVisible(false)}
      footer={null}
      width={600}
    >
      <Form
        layout="vertical"
        initialValues={{
          name: currentFlow?.name || '',
          description: currentFlow?.description || '',
          tags: currentFlow?.tags || [],
        }}
        onFinish={async (values) => {
          await saveFlow(values);
          setSaveModalVisible(false);
        }}
      >
        <Form.Item
          label="流程名称"
          name="name"
          rules={[
            { required: true, message: '请输入流程名称' },
            { min: 2, message: '流程名称至少2个字符' },
            { max: 50, message: '流程名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="请输入流程名称" />
        </Form.Item>

        <Form.Item
          label="流程描述"
          name="description"
          rules={[
            { max: 200, message: '描述不能超过200个字符' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="请输入流程描述（可选）"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label="标签"
          name="tags"
          help="添加标签便于分类和搜索"
        >
          <Select
            mode="tags"
            placeholder="输入标签并按回车添加"
            tokenSeparators={[',']}
            maxTagCount={5}
            maxTagTextLength={10}
          >
            <Option value="AI对话">AI对话</Option>
            <Option value="数据处理">数据处理</Option>
            <Option value="自动化">自动化</Option>
            <Option value="客服">客服</Option>
            <Option value="分析">分析</Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={() => setSaveModalVisible(false)}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </div>
      </Form>
    </Modal>
  );

  // 发布流程模态框
  const publishModal = (
    <Modal
      title="发布流程"
      open={publishModalVisible}
      onCancel={() => setPublishModalVisible(false)}
      onOk={publishFlow}
      okText="发布"
      cancelText="取消"
      confirmLoading={loading}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-lg">⚠️</div>
            <div>
              <div className="font-medium text-yellow-800 mb-1">发布前请确认</div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 流程配置已经完整且正确</li>
                <li>• 所有节点都已正确连接</li>
                <li>• 已测试流程的执行逻辑</li>
                <li>• 发布后流程将可被其他用户使用</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 space-y-2">
            <div><strong>流程名称：</strong>{currentFlow?.name}</div>
            <div><strong>节点数量：</strong>{nodes.length} 个</div>
            <div><strong>连接数量：</strong>{edges.length} 个</div>
            <div><strong>当前状态：</strong>
              <Tag color={currentFlow?.status === 'published' ? 'success' : 'default'} className="ml-2">
                {currentFlow?.status === 'draft' ? '草稿' :
                  currentFlow?.status === 'published' ? '已发布' : '已归档'}
              </Tag>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );

  // 配置WorkflowExecutor
  useEffect(() => {
    console.log('Configuring executor for main page integration');
  }, []);

  // 创建带有调试数据的节点
  const enhancedNodes = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        debugResult: debugResults[node.id],
        isDebugMode,
        onShowMarkdownResult: handleShowMarkdownResult,
      },
    }));
  }, [nodes, debugResults, isDebugMode]);

  // 创建带有选中状态的连线
  const enhancedEdges = useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      selected: selectedEdges.includes(edge.id),
      style: {
        ...edge.style,
        stroke: selectedEdges.includes(edge.id) ? '#ff6b6b' : '#1677ff',
        strokeWidth: selectedEdges.includes(edge.id) ? 3 : 2,
      },
    }));
  }, [edges, selectedEdges]);

  // 添加键盘事件监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDeleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNode, selectedEdges, handleDeleteSelected]);

  // 渲染组件
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
        {/* 顶部功能栏 - 使用 Tailwind 类 */}
        <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center shadow-sm">
          <div className="flex items-center gap-6">
            {/* 返回按钮和标题 */}
            <div className="flex items-center gap-3">
              <Tooltip title="返回流程列表">
                <Button
                  icon={<LeftOutlined />}
                  onClick={handleBackToList}
                  size="small"
                  className="flex items-center"
                />
              </Tooltip>

              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-800 mb-0">
                  {currentFlow?.name || '新建流程'}
                </h1>
                {isFlowModified && (
                  <Tooltip title="有未保存的更改">
                    <span className="text-orange-500 text-sm">●</span>
                  </Tooltip>
                )}
                {currentFlow && (
                  <Tooltip
                    title={
                      currentFlow.status === 'draft' ? '草稿' :
                        currentFlow.status === 'published' ? '已发布' :
                          currentFlow.status === 'archived' ? '已归档' : '未归档'
                    }
                  >
                    <div className={`w-3 h-3 rounded-full ${currentFlow.status === 'published' ? 'bg-green-500' :
                      currentFlow.status === 'draft' ? 'bg-blue-500' :
                        currentFlow.status === 'archived' ? 'bg-gray-500' : 'bg-gray-400'
                      }`} />
                  </Tooltip>
                )}
              </div>
            </div>

            {/* 节点面板控制按钮 */}
            <Tooltip title={nodePanelVisible ? "关闭节点面板" : "打开节点面板"}>
              <Button
                type={nodePanelVisible ? "primary" : "default"}
                icon={<PlusOutlined />}
                onClick={toggleNodePanel}
                className="flex items-center"
                size="small"
              >
                节点面板
              </Button>
            </Tooltip>

            {/* 调试面板控制按钮 */}
            <Tooltip title="打开调试面板">
              <Button
                type={debugPanelVisible ? "primary" : "default"}
                icon={<PlayCircleOutlined />}
                onClick={toggleDebugPanel}
                className="flex items-center"
                size="small"
              >
                调试面板
              </Button>
            </Tooltip>

            {/* 分隔线 */}
            <div className="h-6 w-px bg-gray-300" />

            {/* 编辑工具栏 */}
            <div className="flex items-center gap-2">
              <Tooltip title={
                selectedNode ? "删除选中节点" :
                  selectedEdges.length > 0 ? "删除选中连线" :
                    "删除选中元素"
              }>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteSelected}
                  disabled={!selectedNode && selectedEdges.length === 0}
                  danger
                  size="small"
                  className="flex items-center"
                />
              </Tooltip>

              <Tooltip title="撤销">
                <Button
                  icon={<UndoOutlined />}
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  size="small"
                  className="flex items-center"
                />
              </Tooltip>

              <Tooltip title="重做">
                <Button
                  icon={<RedoOutlined />}
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  size="small"
                  className="flex items-center"
                />
              </Tooltip>

              {/* 分隔线 */}
              <div className="h-6 w-px bg-gray-300 mx-1" />

              {/* 保存相关按钮 */}
              <Tooltip title={currentFlow ? "快速保存" : "保存为新流程"}>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleQuickSave}
                  loading={loading}
                  size="small"
                  className="flex items-center"
                >
                  保存
                </Button>
              </Tooltip>

              {currentFlow && (
                <Tooltip title="发布流程">
                  <Button
                    icon={<CheckCircleOutlined />}
                    onClick={() => setPublishModalVisible(true)}
                    disabled={currentFlow.status === 'published'}
                    size="small"
                    className="flex items-center"
                  >
                    发布
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* 主体区域 - 使用 Flexbox 布局 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 节点面板 - 左侧 */}
          {nodePanelVisible && (
            <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
              <NodePanel categories={nodeCategories} />
            </div>
          )}

          {/* 流程设计画布 - 中间 */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            {initialized && (
              <ReactFlow
                nodes={enhancedNodes}
                edges={enhancedEdges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
                onInit={onInit as any}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onSelectionChange={onSelectionChange}
                onPaneClick={onPaneClick}
                onNodesDelete={onNodesDelete}
                onDragOver={onDragOver}
                onDrop={onDrop}
                selectNodesOnDrag={true}
                multiSelectionKeyCode={['Meta', 'Ctrl']}
                deleteKeyCode={['Backspace', 'Delete']}
                defaultEdgeOptions={{
                  type: "smoothstep",
                  animated: true,
                  style: { stroke: '#1677ff', strokeWidth: 2 }
                }}
                snapToGrid={true}
                snapGrid={snapGrid}
                defaultViewport={defaultViewport}
                fitView
                minZoom={0.1}
                maxZoom={2}
                className={`bg-gray-50 ${isDebugMode ? 'debug-mode' : ''}`}
              >
                <Background
                  gap={20}
                  size={1}
                  className="bg-gray-50"
                  color="#e2e8f0"
                />
                <Controls className="bg-white border border-gray-200 rounded-lg shadow-lg" />
                <MiniMap
                  style={{ height: 120, width: 200 }}
                  className="bg-white border border-gray-200 rounded-lg shadow-lg"
                  nodeColor={(node) => {
                    if (isDebugMode) {
                      const debugResult = debugResults[node.id];
                      if (debugResult) {
                        switch (debugResult.status) {
                          case 'completed': return '#10b981';
                          case 'failed': return '#ef4444';
                          case 'running': return '#f59e0b';
                          case 'waiting_input': return '#eab308';
                          default: return '#6b7280';
                        }
                      }
                    }
                    switch (node.type) {
                      case 'startNode': return '#10b981';
                      case 'endNode': return '#ef4444';
                      case 'aiDialogNode': return '#3b82f6';
                      case 'processNode': return '#8b5cf6';
                      case 'decisionNode': return '#f59e0b';
                      default: return '#6b7280';
                    }
                  }}
                />

                {/* Panel 组件用于显示浮动信息 */}
                <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                  <div className="text-sm text-gray-600">
                    节点: {nodes.length} | 连线: {edges.length}
                    {isDebugMode && (
                      <>
                        <br />
                        调试中: {Object.values(debugResults).filter(r => r.status === 'completed').length} / {Object.keys(debugResults).length}
                      </>
                    )}
                  </div>
                </Panel>
              </ReactFlow>
            )}
          </div>

          {/* 属性面板 - 右侧，使用 PropertiesPanel 组件自身的拉伸功能 */}
          <PropertiesPanel
            node={selectedNode}
            edges={edges}
            onChange={onNodeDataChange}
            onLabelChange={onNodeLabelChange}
          />
        </div>
      </div>

      {/* 调试面板 */}
      <DebugPanel
        visible={debugPanelVisible}
        onClose={() => setDebugPanelVisible(false)}
        executor={workflowExecutorRef.current}
        nodes={nodes}
        edges={edges}
        onExecutionStateChange={(state) => {
          setDebugResults(state.results || {});
        }}
      />

      {/* Markdown查看器 */}
      <Modal
        title="节点执行结果"
        open={markdownViewerVisible}
        onCancel={() => setMarkdownViewerVisible(false)}
        footer={[
          <Button key="close" onClick={() => setMarkdownViewerVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        className="markdown-viewer-modal"
      >
        <div className="max-h-96 overflow-y-auto bg-white p-4 border rounded">
          <ReactMarkdown>{currentMarkdownContent}</ReactMarkdown>
        </div>
      </Modal>

      {/* 保存流程模态框 */}
      {saveModal}

      {/* 发布流程模态框 */}
      {publishModal}
    </ReactFlowProvider>
  );
};

export default AgentFlowPage;

