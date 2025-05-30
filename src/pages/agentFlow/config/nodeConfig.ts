import { Position } from '@xyflow/react';

// 连接点样式配置
export const HANDLE_STYLES = {
  // 入口连接点 - 蓝色系
  TARGET: {
    width: '20px',
    height: '20px',
    backgroundColor: '#3b82f6', // blue-500
    border: '3px solid #ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  },
  // 出口连接点 - 绿色系
  SOURCE: {
    width: '20px',
    height: '20px',
    backgroundColor: '#10b981', // emerald-500
    border: '3px solid #ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
  },
  // 条件节点的多出口连接点
  CONDITION_TRUE: {
    width: '20px',
    height: '20px',
    backgroundColor: '#22c55e', // green-500
    border: '3px solid #ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
  },
  CONDITION_FALSE: {
    width: '20px',
    height: '20px',
    backgroundColor: '#ef4444', // red-500
    border: '3px solid #ffffff',
    borderRadius: '50%',
    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
  },
};

// 节点类型配置
export interface NodeTypeConfig {
  type: string;
  label: string;
  iconName: string; // 改为字符串，存储图标名称
  color: string;
  bgColor: string;
  borderColor: string;
  iconBgColor: string;
  description?: string;
  hasTarget?: boolean;
  hasSource?: boolean;
  hasMultipleOutputs?: boolean;
}

// 节点类型定义
export const NODE_TYPE_CONFIGS: Record<string, NodeTypeConfig> = {
  // AI处理节点
  aiDialogNode: {
    type: 'aiDialogNode',
    label: 'AI对话',
    iconName: 'RobotOutlined',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconBgColor: 'bg-blue-100',
    description: '与AI模型进行对话交互',
    hasTarget: true,
    hasSource: true,
  },
  aiSummaryNode: {
    type: 'aiSummaryNode',
    label: 'AI摘要',
    iconName: 'FileTextOutlined',
    color: '#06b6d4',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    iconBgColor: 'bg-cyan-100',
    description: '对文本内容进行智能摘要',
    hasTarget: true,
    hasSource: true,
  },
  aiExtractNode: {
    type: 'aiExtractNode',
    label: 'AI提取',
    iconName: 'ThunderboltOutlined',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    iconBgColor: 'bg-purple-100',
    description: '从文本中提取关键信息',
    hasTarget: true,
    hasSource: true,
  },
  aiJsonNode: {
    type: 'aiJsonNode',
    label: 'AI-JSON',
    iconName: 'CodeOutlined',
    color: '#ec4899',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    iconBgColor: 'bg-pink-100',
    description: 'AI处理JSON数据格式',
    hasTarget: true,
    hasSource: true,
  },

  // 数据处理节点
  databaseNode: {
    type: 'databaseNode',
    label: '数据库',
    iconName: 'DatabaseOutlined',
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconBgColor: 'bg-emerald-100',
    description: '数据库查询和操作',
    hasTarget: true,
    hasSource: true,
  },
  knowledgeBaseNode: {
    type: 'knowledgeBaseNode',
    label: '知识库',
    iconName: 'CloudOutlined',
    color: '#84cc16',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-300',
    iconBgColor: 'bg-lime-100',
    description: '知识库检索和查询',
    hasTarget: true,
    hasSource: true,
  },
  bingNode: {
    type: 'bingNode',
    label: 'Bing搜索',
    iconName: 'SearchOutlined',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconBgColor: 'bg-amber-100',
    description: '使用Bing进行网络搜索',
    hasTarget: true,
    hasSource: true,
  },
  httpNode: {
    type: 'httpNode',
    label: 'HTTP请求',
    iconName: 'GlobalOutlined',
    color: '#6366f1',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    iconBgColor: 'bg-indigo-100',
    description: 'HTTP API调用',
    hasTarget: true,
    hasSource: true,
  },

  // 控制节点
  startNode: {
    type: 'startNode',
    label: '开始',
    iconName: 'PlayCircleOutlined',
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-400',
    iconBgColor: 'bg-emerald-100',
    description: '工作流的起始节点',
    hasTarget: false,
    hasSource: true,
  },
  endNode: {
    type: 'endNode',
    label: '结束',
    iconName: 'StopOutlined',
    color: '#ef4444',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
    iconBgColor: 'bg-red-100',
    description: '工作流的结束节点',
    hasTarget: true,
    hasSource: false,
  },
  responseNode: {
    type: 'responseNode',
    label: '响应输出',
    iconName: 'MessageOutlined',
    color: '#22c55e',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    iconBgColor: 'bg-green-100',
    description: '返回预设的固定回答',
    hasTarget: true,
    hasSource: false,
  },

  // 逻辑控制节点
  conditionNode: {
    type: 'conditionNode',
    label: '条件判断',
    iconName: 'BranchesOutlined',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconBgColor: 'bg-amber-100',
    description: '条件判断和分支节点',
    hasTarget: true,
    hasSource: false,
    hasMultipleOutputs: true,
  },
  decisionNode: {
    type: 'decisionNode',
    label: '决策节点',
    iconName: 'BranchesOutlined',
    color: '#f97316',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    iconBgColor: 'bg-orange-100',
    description: '多条件决策分支',
    hasTarget: true,
    hasSource: false,
    hasMultipleOutputs: true,
  },

  // 基础节点
  basicNode: {
    type: 'basicNode',
    label: '基础节点',
    iconName: 'SettingOutlined',
    color: '#6b7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    iconBgColor: 'bg-gray-100',
    description: '通用的基础处理节点',
    hasTarget: true,
    hasSource: true,
  },
  processNode: {
    type: 'processNode',
    label: '处理节点',
    iconName: 'SettingOutlined',
    color: '#7c3aed',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    iconBgColor: 'bg-violet-100',
    description: '数据处理和转换节点',
    hasTarget: true,
    hasSource: true,
  },
  customNode: {
    type: 'customNode',
    label: '自定义节点',
    iconName: 'SettingOutlined',
    color: '#4f46e5',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    iconBgColor: 'bg-indigo-100',
    description: '可自定义功能的节点',
    hasTarget: true,
    hasSource: true,
  },
  jsonExtractor: {
    type: 'jsonExtractor',
    label: 'JSON提取器',
    iconName: 'CodeOutlined',
    color: '#db2777',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    iconBgColor: 'bg-pink-100',
    description: '提取和处理JSON数据',
    hasTarget: true,
    hasSource: true,
  },
};

// 获取节点配置的辅助函数
export const getNodeConfig = (nodeType: string): NodeTypeConfig => {
  return NODE_TYPE_CONFIGS[nodeType] || NODE_TYPE_CONFIGS.basicNode;
};

// 连接点位置配置
export const HANDLE_POSITIONS = {
  TARGET_TOP: Position.Top,
  SOURCE_BOTTOM: Position.Bottom,
  SOURCE_LEFT: Position.Left,
  SOURCE_RIGHT: Position.Right,
};

// 连接点ID生成器
export const generateHandleId = (nodeId: string, type: 'source' | 'target', position?: string) => {
  return `${nodeId}-${type}${position ? `-${position}` : ''}`;
};

// 验证连接是否有效
export const isValidConnection = (sourceType: string, targetType: string): boolean => {
  // 开始节点不能作为目标
  if (targetType === 'startNode') return false;
  
  // 结束节点不能作为源
  if (sourceType === 'endNode' || sourceType === 'responseNode') return false;
  
  return true;
};