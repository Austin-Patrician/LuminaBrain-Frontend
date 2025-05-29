import React from "react";
import { Collapse, Typography } from "antd";
import {
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
} from "@ant-design/icons";

const { Panel } = Collapse;
const { Text } = Typography;

interface NodeType {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface NodeCategory {
  key: string;
  label: string;
  children: NodeType[];
}

// 节点图标和颜色映射
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

// 默认节点分类数据
const DEFAULT_NODE_GROUPS: NodeCategory[] = [
  {
    key: "ai",
    label: "AI处理节点",
    children: [
      { type: "aiDialogNode", label: "AI对话22", icon: getNodeIcon("aiDialogNode"), color: getNodeColor("aiDialogNode"), description: "与AI模型进行对话交互" },
      { type: "aiSummaryNode", label: "摘要总结", icon: getNodeIcon("aiSummaryNode"), color: getNodeColor("aiSummaryNode"), description: "对文本内容进行智能摘要" },
      { type: "aiExtractNode", label: "内容提取", icon: getNodeIcon("aiExtractNode"), color: getNodeColor("aiExtractNode"), description: "从文本中提取关键信息" },
      { type: "jsonExtractor", label: "JSON提取器", icon: getNodeIcon("jsonExtractor"), color: getNodeColor("jsonExtractor"), description: "提取和处理JSON数据" },
    ],
  },
  {
    key: "data",
    label: "数据节点",
    children: [
      { type: "databaseNode", label: "数据库", icon: getNodeIcon("databaseNode"), color: getNodeColor("databaseNode"), description: "数据库查询和操作" },
      { type: "knowledgeBaseNode", label: "知识库", icon: getNodeIcon("knowledgeBaseNode"), color: getNodeColor("knowledgeBaseNode"), description: "知识库检索和查询" },
      { type: "bingNode", label: "Bing搜索", icon: getNodeIcon("bingNode"), color: getNodeColor("bingNode"), description: "使用Bing进行网络搜索" },
    ],
  },
  {
    key: "response",
    label: "响应节点",
    children: [
      { type: "responseNode", label: "固定回答", icon: getNodeIcon("responseNode"), color: getNodeColor("responseNode"), description: "返回预设的固定回答" },
    ],
  },
  {
    key: "basic",
    label: "基础节点",
    children: [
      { type: "startNode", label: "开始", icon: getNodeIcon("startNode"), color: getNodeColor("startNode"), description: "工作流的起始节点" },
      { type: "endNode", label: "结束", icon: getNodeIcon("endNode"), color: getNodeColor("endNode"), description: "工作流的结束节点" },
      { type: "basicNode", label: "基础节点", icon: getNodeIcon("basicNode"), color: getNodeColor("basicNode"), description: "通用的基础处理节点" },
      { type: "processNode", label: "处理节点", icon: getNodeIcon("processNode"), color: getNodeColor("processNode"), description: "数据处理和转换节点" },
      { type: "decisionNode", label: "判断节点", icon: getNodeIcon("decisionNode"), color: getNodeColor("decisionNode"), description: "条件判断和分支节点" },
      { type: "conditionNode", label: "条件节点", icon: getNodeIcon("conditionNode"), color: getNodeColor("conditionNode"), description: "逻辑条件处理节点" },
      { type: "customNode", label: "自定义节点", icon: getNodeIcon("customNode"), color: getNodeColor("customNode"), description: "可自定义功能的节点" },
    ],
  },
];

interface NodePanelProps {
  categories?: NodeCategory[];
}

function NodePanel({ categories = DEFAULT_NODE_GROUPS }: NodePanelProps) {
  // 拖拽开始事件处理
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string, label: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.setData("node/label", label);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex flex-col h-full">
      {/* 面板标题 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">节点面板</h3>
        <p className="text-sm text-gray-500">拖拽节点到画布中创建工作流</p>
      </div>

      {/* 节点分类列表 */}
      <div className="flex-1 overflow-y-auto">
        <Collapse
          defaultActiveKey={categories.map(cat => cat.key)}
          ghost
          size="small"
          className="bg-transparent"
        >
          {categories.map((category) => (
            <Panel
              header={
                <span className="text-sm font-medium text-gray-700">
                  {category.label}
                </span>
              }
              key={category.key}
              className="!border-none"
            >
              <div className="space-y-2">
                {category.children.map((node) => (
                  <div
                    key={node.type}
                    className={`
                      group flex items-center p-3 rounded-lg border-2 border-dashed border-gray-200
                      bg-white hover:bg-gray-50 hover:border-${node.color}-300 hover:shadow-md
                      cursor-grab active:cursor-grabbing transition-all duration-200
                      transform hover:scale-105 active:scale-95
                    `}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                  >
                    {/* 节点图标 */}
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full mr-3
                      bg-${node.color}-100 text-${node.color}-600 group-hover:bg-${node.color}-200
                      transition-colors duration-200
                    `}>
                      {node.icon}
                    </div>

                    {/* 节点信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 mb-1">
                        {node.label}
                      </div>
                      {node.description && (
                        <div className="text-xs text-gray-500 truncate">
                          {node.description}
                        </div>
                      )}
                    </div>

                    {/* 拖拽提示图标 */}
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>

      {/* 底部提示 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-700">
          <div className="font-medium mb-1">💡 使用提示:</div>
          <ul className="space-y-1 text-blue-600">
            <li>• 拖拽节点到画布创建工作流</li>
            <li>• 点击节点可在右侧编辑属性</li>
            <li>• 连接节点构建处理流程</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NodePanel;
