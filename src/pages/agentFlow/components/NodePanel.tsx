import React from "react";
import { Collapse } from "antd";
import { NODE_TYPE_CONFIGS } from "../config/nodeConfig";
import * as Icons from '@ant-design/icons';

const { Panel } = Collapse;

// 图标映射函数
const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? React.createElement(IconComponent) : React.createElement(Icons.SettingOutlined);
};

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

// 从配置中生成节点分类数据
const generateNodeCategories = (): NodeCategory[] => {
  return [
    {
      key: "ai",
      label: "AI处理节点",
      children: [
        {
          type: "aiDialogNode",
          label: NODE_TYPE_CONFIGS.aiDialogNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.aiDialogNode.iconName),
          color: NODE_TYPE_CONFIGS.aiDialogNode.color,
          description: NODE_TYPE_CONFIGS.aiDialogNode.description
        },
        {
          type: "aiSummaryNode",
          label: NODE_TYPE_CONFIGS.aiSummaryNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.aiSummaryNode.iconName),
          color: NODE_TYPE_CONFIGS.aiSummaryNode.color,
          description: NODE_TYPE_CONFIGS.aiSummaryNode.description
        },
        {
          type: "aiExtractNode",
          label: NODE_TYPE_CONFIGS.aiExtractNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.aiExtractNode.iconName),
          color: NODE_TYPE_CONFIGS.aiExtractNode.color,
          description: NODE_TYPE_CONFIGS.aiExtractNode.description
        },
        {
          type: "aiJsonNode",
          label: NODE_TYPE_CONFIGS.aiJsonNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.aiJsonNode.iconName),
          color: NODE_TYPE_CONFIGS.aiJsonNode.color,
          description: NODE_TYPE_CONFIGS.aiJsonNode.description
        },
      ],
    },
    {
      key: "data",
      label: "数据节点",
      children: [
        {
          type: "databaseNode",
          label: NODE_TYPE_CONFIGS.databaseNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.databaseNode.iconName),
          color: NODE_TYPE_CONFIGS.databaseNode.color,
          description: NODE_TYPE_CONFIGS.databaseNode.description
        },
        {
          type: "knowledgeBaseNode",
          label: NODE_TYPE_CONFIGS.knowledgeBaseNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.knowledgeBaseNode.iconName),
          color: NODE_TYPE_CONFIGS.knowledgeBaseNode.color,
          description: NODE_TYPE_CONFIGS.knowledgeBaseNode.description
        },
        {
          type: "bingNode",
          label: NODE_TYPE_CONFIGS.bingNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.bingNode.iconName),
          color: NODE_TYPE_CONFIGS.bingNode.color,
          description: NODE_TYPE_CONFIGS.bingNode.description
        },
        {
          type: "httpNode",
          label: NODE_TYPE_CONFIGS.httpNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.httpNode.iconName),
          color: NODE_TYPE_CONFIGS.httpNode.color,
          description: NODE_TYPE_CONFIGS.httpNode.description
        },
      ],
    },
    {
      key: "control",
      label: "控制节点",
      children: [
        {
          type: "startNode",
          label: NODE_TYPE_CONFIGS.startNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.startNode.iconName),
          color: NODE_TYPE_CONFIGS.startNode.color,
          description: NODE_TYPE_CONFIGS.startNode.description
        },
        {
          type: "endNode",
          label: NODE_TYPE_CONFIGS.endNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.endNode.iconName),
          color: NODE_TYPE_CONFIGS.endNode.color,
          description: NODE_TYPE_CONFIGS.endNode.description
        },
        {
          type: "responseNode",
          label: NODE_TYPE_CONFIGS.responseNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.responseNode.iconName),
          color: NODE_TYPE_CONFIGS.responseNode.color,
          description: NODE_TYPE_CONFIGS.responseNode.description
        },
        {
          type: "conditionNode",
          label: NODE_TYPE_CONFIGS.conditionNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.conditionNode.iconName),
          color: NODE_TYPE_CONFIGS.conditionNode.color,
          description: NODE_TYPE_CONFIGS.conditionNode.description
        },
        {
          type: "decisionNode",
          label: NODE_TYPE_CONFIGS.decisionNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.decisionNode.iconName),
          color: NODE_TYPE_CONFIGS.decisionNode.color,
          description: NODE_TYPE_CONFIGS.decisionNode.description
        },
      ],
    },
    {
      key: "basic",
      label: "基础节点",
      children: [
        {
          type: "basicNode",
          label: NODE_TYPE_CONFIGS.basicNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.basicNode.iconName),
          color: NODE_TYPE_CONFIGS.basicNode.color,
          description: NODE_TYPE_CONFIGS.basicNode.description
        },
        {
          type: "processNode",
          label: NODE_TYPE_CONFIGS.processNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.processNode.iconName),
          color: NODE_TYPE_CONFIGS.processNode.color,
          description: NODE_TYPE_CONFIGS.processNode.description
        },
        {
          type: "customNode",
          label: NODE_TYPE_CONFIGS.customNode.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.customNode.iconName),
          color: NODE_TYPE_CONFIGS.customNode.color,
          description: NODE_TYPE_CONFIGS.customNode.description
        },
        {
          type: "jsonExtractor",
          label: NODE_TYPE_CONFIGS.jsonExtractor.label,
          icon: getIconComponent(NODE_TYPE_CONFIGS.jsonExtractor.iconName),
          color: NODE_TYPE_CONFIGS.jsonExtractor.color,
          description: NODE_TYPE_CONFIGS.jsonExtractor.description
        },
      ],
    },
  ];
};

interface NodePanelProps {
  categories?: NodeCategory[];
}

function NodePanel({ categories }: NodePanelProps) {
  const nodeCategories = categories || generateNodeCategories();

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
          defaultActiveKey={nodeCategories.map(cat => cat.key)}
          ghost
          size="small"
          className="bg-transparent"
        >
          {nodeCategories.map((category) => (
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
                    className="group flex items-center p-3 rounded-lg border-2 border-dashed border-gray-200
                      bg-white hover:bg-gray-50 hover:border-blue-300 hover:shadow-md
                      cursor-grab active:cursor-grabbing transition-all duration-200
                      transform hover:scale-105 active:scale-95"
                    style={{
                      '--node-color': node.color,
                    } as React.CSSProperties}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                  >
                    {/* 节点图标 */}
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full mr-3
                        bg-blue-100 group-hover:bg-blue-200 transition-colors duration-200"
                      style={{ color: node.color }}
                    >
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
            <li>• 🔵 蓝色连接点为入口，🟢 绿色为出口</li>
            <li>• 连接节点构建处理流程</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NodePanel;
