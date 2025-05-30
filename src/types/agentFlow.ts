// Agent Flow 相关类型定义

// 节点类别枚举
export enum NodeCategory {
  BASIC = 'basic',
  AI = 'ai', 
  DATA = 'data',
  LOGIC = 'logic',
  IO = 'io',
  TRANSFORM = 'transform'
}

// 节点类型枚举 - 统一管理所有节点类型
export enum NodeType {
  // 基础节点
  START = 'startNode',
  END = 'endNode',
  BASIC = 'basicNode',
  
  // AI节点
  AI_DIALOG = 'aiDialogNode',
  LLM = 'llmNode',
  AI_EXTRACT = 'aiExtractNode',
  
  // 数据节点
  DATABASE = 'databaseNode',
  KNOWLEDGE_BASE = 'knowledgeBaseNode',
  BING_SEARCH = 'bingNode',
  
  // 逻辑节点
  CONDITION = 'conditionNode',
  DECISION = 'decisionNode',
  SWITCH = 'switchNode',
  
  // 输入输出节点
  HTTP = 'httpNode',
  API_CALL = 'apiCallNode',
  WEBHOOK = 'webhookNode',
  
  // 转换节点
  JSON_EXTRACTOR = 'jsonExtractor',
  DATA_MAPPER = 'dataMapperNode',
  TEXT_PROCESSOR = 'textProcessorNode',
  JAVASCRIPT = 'javascriptNode'
}

// 节点配置接口
export interface NodeConfig {
  type: NodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultData: Record<string, any>;
  inputs?: HandleConfig[];
  outputs?: HandleConfig[];
  properties?: PropertyConfig[];
}

// 连接点配置
export interface HandleConfig {
  id: string;
  label: string;
  type: 'source' | 'target';
  position: 'top' | 'bottom' | 'left' | 'right';
  required?: boolean;
}

// 属性配置
export interface PropertyConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'slider' | 'json';
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// 节点注册表 - 统一的节点配置中心
export const NODE_REGISTRY: Record<NodeType, NodeConfig> = {
  [NodeType.START]: {
    type: NodeType.START,
    category: NodeCategory.BASIC,
    label: '开始',
    description: '流程开始节点',
    icon: 'play-circle',
    color: '#52c41a',
    defaultData: { label: '开始' },
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },
  
  [NodeType.END]: {
    type: NodeType.END,
    category: NodeCategory.BASIC,
    label: '结束',
    description: '流程结束节点',
    icon: 'stop',
    color: '#ff4d4f',
    defaultData: { label: '结束' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }]
  },
  
  [NodeType.AI_DIALOG]: {
    type: NodeType.AI_DIALOG,
    category: NodeCategory.AI,
    label: 'AI对话',
    description: '与AI模型进行对话交互',
    icon: 'robot',
    color: '#1677ff',
    defaultData: {
      label: 'AI对话',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: '你是一个有帮助的AI助手。'
    },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }],
    properties: [
      {
        key: 'model',
        label: 'AI模型',
        type: 'select',
        required: true,
        defaultValue: 'gpt-3.5-turbo',
        options: [
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'Claude-3', value: 'claude-3' }
        ]
      },
      {
        key: 'systemPrompt',
        label: '系统提示',
        type: 'textarea',
        defaultValue: '你是一个有帮助的AI助手。'
      },
      {
        key: 'temperature',
        label: '创造性',
        type: 'slider',
        defaultValue: 0.7,
        validation: { min: 0, max: 2 }
      },
      {
        key: 'maxTokens',
        label: '最大令牌数',
        type: 'number',
        defaultValue: 2000,
        validation: { min: 1, max: 4000 }
      }
    ]
  },
  
  [NodeType.HTTP]: {
    type: NodeType.HTTP,
    category: NodeCategory.IO,
    label: 'HTTP请求',
    description: '发送HTTP请求',
    icon: 'api',
    color: '#722ed1',
    defaultData: {
      label: 'HTTP请求',
      method: 'GET',
      url: '',
      headers: {},
      body: ''
    },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }],
    properties: [
      {
        key: 'method',
        label: '请求方法',
        type: 'select',
        required: true,
        defaultValue: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ]
      },
      {
        key: 'url',
        label: '请求URL',
        type: 'text',
        required: true,
        validation: { pattern: '^https?://.+', message: '请输入有效的URL' }
      },
      {
        key: 'headers',
        label: '请求头',
        type: 'json',
        defaultValue: {}
      },
      {
        key: 'body',
        label: '请求体',
        type: 'textarea'
      }
    ]
  },
  
  [NodeType.CONDITION]: {
    type: NodeType.CONDITION,
    category: NodeCategory.LOGIC,
    label: '条件判断',
    description: '根据条件进行分支判断',
    icon: 'branches',
    color: '#fa8c16',
    defaultData: {
      label: '条件判断',
      condition: '',
      operator: 'equals'
    },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [
      { id: 'true', label: '真', type: 'source', position: 'bottom' },
      { id: 'false', label: '假', type: 'source', position: 'bottom' }
    ],
    properties: [
      {
        key: 'condition',
        label: '条件表达式',
        type: 'text',
        required: true
      },
      {
        key: 'operator',
        label: '操作符',
        type: 'select',
        defaultValue: 'equals',
        options: [
          { label: '等于', value: 'equals' },
          { label: '不等于', value: 'not_equals' },
          { label: '大于', value: 'greater' },
          { label: '小于', value: 'less' },
          { label: '包含', value: 'contains' }
        ]
      }
    ]
  },
  
  [NodeType.JSON_EXTRACTOR]: {
    type: NodeType.JSON_EXTRACTOR,
    category: NodeCategory.TRANSFORM,
    label: 'JSON提取器',
    description: '从JSON数据中提取特定字段',
    icon: 'code',
    color: '#13c2c2',
    defaultData: {
      label: 'JSON提取器',
      jsonPath: '$',
      outputKey: 'result'
    },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }],
    properties: [
      {
        key: 'jsonPath',
        label: 'JSONPath表达式',
        type: 'text',
        required: true,
        defaultValue: '$'
      },
      {
        key: 'outputKey',
        label: '输出键名',
        type: 'text',
        required: true,
        defaultValue: 'result'
      }
    ]
  },

  // 继续添加其他节点类型...
  [NodeType.BASIC]: {
    type: NodeType.BASIC,
    category: NodeCategory.BASIC,
    label: '基础节点',
    description: '基础功能节点',
    icon: 'node-index',
    color: '#666666',
    defaultData: { label: '基础节点' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.LLM]: {
    type: NodeType.LLM,
    category: NodeCategory.AI,
    label: 'LLM模型',
    description: '大语言模型处理节点',
    icon: 'experiment',
    color: '#eb2f96',
    defaultData: { label: 'LLM模型' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.AI_EXTRACT]: {
    type: NodeType.AI_EXTRACT,
    category: NodeCategory.AI,
    label: 'AI提取',
    description: 'AI智能数据提取',
    icon: 'scissor',
    color: '#f759ab',
    defaultData: { label: 'AI提取' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.DATABASE]: {
    type: NodeType.DATABASE,
    category: NodeCategory.DATA,
    label: '数据库',
    description: '数据库查询和操作',
    icon: 'database',
    color: '#52c41a',
    defaultData: { label: '数据库' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.KNOWLEDGE_BASE]: {
    type: NodeType.KNOWLEDGE_BASE,
    category: NodeCategory.DATA,
    label: '知识库',
    description: '知识库检索和查询',
    icon: 'book',
    color: '#1890ff',
    defaultData: { label: '知识库' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.BING_SEARCH]: {
    type: NodeType.BING_SEARCH,
    category: NodeCategory.DATA,
    label: 'Bing搜索',
    description: '使用Bing进行网络搜索',
    icon: 'search',
    color: '#faad14',
    defaultData: { label: 'Bing搜索' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.DECISION]: {
    type: NodeType.DECISION,
    category: NodeCategory.LOGIC,
    label: '判断节点',
    description: '条件判断和分支节点',
    icon: 'fork',
    color: '#fa541c',
    defaultData: { label: '判断节点' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.SWITCH]: {
    type: NodeType.SWITCH,
    category: NodeCategory.LOGIC,
    label: '开关节点',
    description: '多路径切换节点',
    icon: 'swap',
    color: '#fa8c16',
    defaultData: { label: '开关节点' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.API_CALL]: {
    type: NodeType.API_CALL,
    category: NodeCategory.IO,
    label: 'API调用',
    description: 'RESTful API调用节点',
    icon: 'api',
    color: '#722ed1',
    defaultData: { label: 'API调用' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.WEBHOOK]: {
    type: NodeType.WEBHOOK,
    category: NodeCategory.IO,
    label: 'Webhook',
    description: 'Webhook接收和发送',
    icon: 'link',
    color: '#13c2c2',
    defaultData: { label: 'Webhook' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.DATA_MAPPER]: {
    type: NodeType.DATA_MAPPER,
    category: NodeCategory.TRANSFORM,
    label: '数据映射',
    description: '数据字段映射和转换',
    icon: 'swap',
    color: '#52c41a',
    defaultData: { label: '数据映射' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.TEXT_PROCESSOR]: {
    type: NodeType.TEXT_PROCESSOR,
    category: NodeCategory.TRANSFORM,
    label: '文本处理',
    description: '文本清洗和格式化',
    icon: 'file-text',
    color: '#1890ff',
    defaultData: { label: '文本处理' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  },

  [NodeType.JAVASCRIPT]: {
    type: NodeType.JAVASCRIPT,
    category: NodeCategory.TRANSFORM,
    label: 'JavaScript',
    description: '自定义JavaScript代码执行',
    icon: 'code',
    color: '#fadb14',
    defaultData: { label: 'JavaScript' },
    inputs: [{ id: 'in', label: '输入', type: 'target', position: 'top' }],
    outputs: [{ id: 'out', label: '输出', type: 'source', position: 'bottom' }]
  }
};

// 工具函数：根据类别获取节点列表
export const getNodesByCategory = (category: NodeCategory): NodeConfig[] => {
  return Object.values(NODE_REGISTRY).filter(node => node.category === category);
};

// 工具函数：获取节点配置
export const getNodeConfig = (type: NodeType): NodeConfig | undefined => {
  return NODE_REGISTRY[type];
};

// 工具函数：获取节点图标
export const getNodeIcon = (type: string): string => {
  const nodeType = type as NodeType;
  return getNodeConfig(nodeType)?.icon || 'node-index';
};

// 工具函数：获取节点颜色
export const getNodeColor = (type: string): string => {
  const nodeType = type as NodeType;
  return getNodeConfig(nodeType)?.color || '#666666';
};

// 工具函数：获取节点默认数据
export const getDefaultNodeData = (type: string, customLabel?: string): Record<string, any> => {
  const nodeType = type as NodeType;
  const config = getNodeConfig(nodeType);
  if (!config) return { label: customLabel || '未知节点' };
  
  return {
    ...config.defaultData,
    ...(customLabel ? { label: customLabel } : {})
  };
};