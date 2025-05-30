import { 
  NodeType, 
  NodeDefinition, 
  NodeCategory, 
  DataType, 
  NodeStatus 
} from '@/types/agentFlow';

// AI对话节点定义
const aiDialogNodeDefinition: NodeDefinition = {
  type: NodeType.AI_DIALOG,
  label: 'AI对话',
  description: '与AI模型进行对话交互',
  category: 'ai',
  icon: 'RobotOutlined',
  color: 'blue',
  
  defaultConfig: {
    label: 'AI对话',
    status: NodeStatus.IDLE,
    parameters: {
      model: 'gpt-3.5-turbo',
      userMessage: '',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 1000,
      stream: false,
      timeout: 30
    },
    style: {
      backgroundColor: '#e3f2fd',
      borderColor: '#2196f3',
      color: '#1976d2'
    }
  },
  
  parameterDefinitions: [
    {
      key: 'model',
      label: 'AI模型',
      type: DataType.STRING,
      required: true,
      defaultValue: 'gpt-3.5-turbo',
      description: '选择要使用的AI模型',
      options: [
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
        { label: 'Claude-3', value: 'claude-3' }
      ],
      group: 'basic'
    },
    {
      key: 'userMessage',
      label: '用户消息',
      type: DataType.STRING,
      required: true,
      defaultValue: '',
      description: '发送给AI的用户消息内容',
      group: 'basic'
    },
    {
      key: 'systemPrompt',
      label: '系统提示',
      type: DataType.STRING,
      required: false,
      defaultValue: '',
      description: '系统级别的提示信息，用于设定AI的行为模式',
      group: 'basic'
    },
    {
      key: 'temperature',
      label: '温度',
      type: DataType.NUMBER,
      required: false,
      defaultValue: 0.7,
      description: '控制输出的随机性，0-1之间',
      validation: { min: 0, max: 1 },
      group: 'advanced'
    },
    {
      key: 'maxTokens',
      label: '最大令牌数',
      type: DataType.NUMBER,
      required: false,
      defaultValue: 1000,
      description: '限制输出的最大长度',
      validation: { min: 1, max: 4000 },
      group: 'advanced'
    },
    {
      key: 'stream',
      label: '流式输出',
      type: DataType.BOOLEAN,
      required: false,
      defaultValue: false,
      description: '是否启用流式输出',
      group: 'advanced'
    },
    {
      key: 'timeout',
      label: '超时时间(秒)',
      type: DataType.NUMBER,
      required: false,
      defaultValue: 30,
      description: '请求超时时间',
      validation: { min: 5, max: 300 },
      group: 'advanced'
    }
  ],
  
  inputDefinitions: [
    {
      name: 'input',
      dataType: DataType.STRING,
      required: true,
      description: '输入文本或上下文'
    }
  ],
  
  outputDefinitions: [
    {
      name: 'output',
      dataType: DataType.STRING,
      required: true,
      description: 'AI生成的回复内容'
    }
  ]
};

// 知识库节点定义
const knowledgeBaseNodeDefinition: NodeDefinition = {
  type: NodeType.KNOWLEDGE_BASE,
  label: '知识库',
  description: '从知识库中检索相关信息',
  category: 'data',
  icon: 'CloudOutlined',
  color: 'green',
  
  defaultConfig: {
    label: '知识库',
    status: NodeStatus.IDLE,
    parameters: {
      knowledgeBaseId: '',
      query: '',
      topK: 5,
      threshold: 0.7,
      searchType: 'semantic'
    },
    style: {
      backgroundColor: '#e8f5e8',
      borderColor: '#4caf50',
      color: '#388e3c'
    }
  },
  
  parameterDefinitions: [
    {
      key: 'knowledgeBaseId',
      label: '知识库ID',
      type: DataType.STRING,
      required: true,
      defaultValue: '',
      description: '要查询的知识库标识',
      group: 'basic'
    },
    {
      key: 'query',
      label: '查询内容',
      type: DataType.STRING,
      required: true,
      defaultValue: '',
      description: '要在知识库中搜索的内容',
      group: 'basic'
    },
    {
      key: 'topK',
      label: '返回数量',
      type: DataType.NUMBER,
      required: false,
      defaultValue: 5,
      description: '返回最相关的结果数量',
      validation: { min: 1, max: 20 },
      group: 'advanced'
    },
    {
      key: 'threshold',
      label: '相似度阈值',
      type: DataType.NUMBER,
      required: false,
      defaultValue: 0.7,
      description: '结果相似度的最低阈值',
      validation: { min: 0, max: 1 },
      group: 'advanced'
    },
    {
      key: 'searchType',
      label: '搜索类型',
      type: DataType.STRING,
      required: false,
      defaultValue: 'semantic',
      description: '搜索算法类型',
      options: [
        { label: '语义搜索', value: 'semantic' },
        { label: '关键词搜索', value: 'keyword' },
        { label: '混合搜索', value: 'hybrid' }
      ],
      group: 'advanced'
    }
  ],
  
  inputDefinitions: [
    {
      name: 'query',
      dataType: DataType.STRING,
      required: true,
      description: '搜索查询'
    }
  ],
  
  outputDefinitions: [
    {
      name: 'results',
      dataType: DataType.ARRAY,
      required: true,
      description: '搜索结果列表'
    }
  ]
};

// 条件判断节点定义
const conditionNodeDefinition: NodeDefinition = {
  type: NodeType.CONDITION,
  label: '条件判断',
  description: '根据条件进行分支判断',
  category: 'logic',
  icon: 'BranchesOutlined',
  color: 'orange',
  
  defaultConfig: {
    label: '条件判断',
    status: NodeStatus.IDLE,
    parameters: {
      condition: '',
      operator: 'equals',
      value: '',
      caseSensitive: false
    },
    style: {
      backgroundColor: '#fff3e0',
      borderColor: '#ff9800',
      color: '#f57c00'
    }
  },
  
  parameterDefinitions: [
    {
      key: 'condition',
      label: '条件表达式',
      type: DataType.STRING,
      required: true,
      defaultValue: '',
      description: '要判断的条件表达式',
      group: 'basic'
    },
    {
      key: 'operator',
      label: '比较操作符',
      type: DataType.STRING,
      required: true,
      defaultValue: 'equals',
      description: '条件比较的操作符',
      options: [
        { label: '等于', value: 'equals' },
        { label: '不等于', value: 'notEquals' },
        { label: '包含', value: 'contains' },
        { label: '大于', value: 'greaterThan' },
        { label: '小于', value: 'lessThan' },
        { label: '为空', value: 'isEmpty' },
        { label: '不为空', value: 'isNotEmpty' }
      ],
      group: 'basic'
    },
    {
      key: 'value',
      label: '比较值',
      type: DataType.STRING,
      required: false,
      defaultValue: '',
      description: '用于比较的目标值',
      group: 'basic'
    },
    {
      key: 'caseSensitive',
      label: '区分大小写',
      type: DataType.BOOLEAN,
      required: false,
      defaultValue: false,
      description: '字符串比较时是否区分大小写',
      group: 'advanced'
    }
  ],
  
  inputDefinitions: [
    {
      name: 'input',
      dataType: DataType.ANY,
      required: true,
      description: '要判断的输入值'
    }
  ],
  
  outputDefinitions: [
    {
      name: 'true',
      dataType: DataType.ANY,
      required: false,
      description: '条件为真时的输出'
    },
    {
      name: 'false',
      dataType: DataType.ANY,
      required: false,
      description: '条件为假时的输出'
    }
  ]
};

// 开始节点定义
const startNodeDefinition: NodeDefinition = {
  type: NodeType.START,
  label: '开始',
  description: '工作流的起始节点',
  category: 'control',
  icon: 'PlayCircleOutlined',
  color: 'green',
  
  defaultConfig: {
    label: '开始',
    status: NodeStatus.IDLE,
    parameters: {
      inputSchema: '',
      description: '工作流开始'
    },
    style: {
      backgroundColor: '#e8f5e8',
      borderColor: '#4caf50',
      color: '#388e3c'
    }
  },
  
  parameterDefinitions: [
    {
      key: 'inputSchema',
      label: '输入结构',
      type: DataType.STRING,
      required: false,
      defaultValue: '',
      description: '定义工作流的输入数据结构',
      group: 'basic'
    },
    {
      key: 'description',
      label: '描述',
      type: DataType.STRING,
      required: false,
      defaultValue: '工作流开始',
      description: '节点描述信息',
      group: 'basic'
    }
  ],
  
  inputDefinitions: [],
  
  outputDefinitions: [
    {
      name: 'output',
      dataType: DataType.ANY,
      required: true,
      description: '工作流的初始输出'
    }
  ]
};

// 结束节点定义
const endNodeDefinition: NodeDefinition = {
  type: NodeType.END,
  label: '结束',
  description: '工作流的结束节点',
  category: 'control',
  icon: 'StopOutlined',
  color: 'red',
  
  defaultConfig: {
    label: '结束',
    status: NodeStatus.IDLE,
    parameters: {
      outputSchema: '',
      description: '工作流结束'
    },
    style: {
      backgroundColor: '#ffebee',
      borderColor: '#f44336',
      color: '#d32f2f'
    }
  },
  
  parameterDefinitions: [
    {
      key: 'outputSchema',
      label: '输出结构',
      type: DataType.STRING,
      required: false,
      defaultValue: '',
      description: '定义工作流的最终输出数据结构',
      group: 'basic'
    },
    {
      key: 'description',
      label: '描述',
      type: DataType.STRING,
      required: false,
      defaultValue: '工作流结束',
      description: '节点描述信息',
      group: 'basic'
    }
  ],
  
  inputDefinitions: [
    {
      name: 'input',
      dataType: DataType.ANY,
      required: true,
      description: '工作流的最终输入'
    }
  ],
  
  outputDefinitions: []
};

// 响应节点定义
const responseNodeDefinition: NodeDefinition = {
  type: NodeType.RESPONSE,
  label: '固定回答',
  description: '返回预设的固定回答',
  category: 'response',
  icon: 'MessageOutlined',
  color: 'purple',
  
  defaultConfig: {
    label: '固定回答',
    status: NodeStatus.IDLE,
    parameters: {
      content: '',
      contentType: 'text',
      variables: {}
    },
    style: {
      backgroundColor: '#f3e5f5',
      borderColor: '#9c27b0',
      color: '#7b1fa2'
    }
  },
  
  parameterDefinitions: [
    {
      key: 'content',
      label: '回答内容',
      type: DataType.STRING,
      required: true,
      defaultValue: '',
      description: '要返回的固定回答内容',
      group: 'basic'
    },
    {
      key: 'contentType',
      label: '内容类型',
      type: DataType.STRING,
      required: false,
      defaultValue: 'text',
      description: '回答内容的格式类型',
      options: [
        { label: '纯文本', value: 'text' },
        { label: 'JSON', value: 'json' },
        { label: 'HTML', value: 'html' },
        { label: 'Markdown', value: 'markdown' }
      ],
      group: 'basic'
    },
    {
      key: 'variables',
      label: '变量替换',
      type: DataType.OBJECT,
      required: false,
      defaultValue: {},
      description: '内容中的变量替换映射',
      group: 'advanced'
    }
  ],
  
  inputDefinitions: [
    {
      name: 'context',
      dataType: DataType.ANY,
      required: false,
      description: '上下文信息（可用于变量替换）'
    }
  ],
  
  outputDefinitions: [
    {
      name: 'response',
      dataType: DataType.STRING,
      required: true,
      description: '格式化后的回答内容'
    }
  ]
};

// 所有节点定义
export const nodeDefinitions: Record<NodeType, NodeDefinition> = {
  [NodeType.AI_DIALOG]: aiDialogNodeDefinition,
  [NodeType.KNOWLEDGE_BASE]: knowledgeBaseNodeDefinition,
  [NodeType.CONDITION]: conditionNodeDefinition,
  [NodeType.START]: startNodeDefinition,
  [NodeType.END]: endNodeDefinition,
  [NodeType.RESPONSE]: responseNodeDefinition,
  
  // 其他节点的简化定义（可以后续完善）
  [NodeType.AI_SUMMARY]: {
    ...aiDialogNodeDefinition,
    type: NodeType.AI_SUMMARY,
    label: '摘要总结',
    description: '对文本内容进行智能摘要'
  },
  [NodeType.AI_EXTRACT]: {
    ...aiDialogNodeDefinition,
    type: NodeType.AI_EXTRACT,
    label: '内容提取',
    description: '从文本中提取关键信息'
  },
  [NodeType.AI_JSON]: {
    ...aiDialogNodeDefinition,
    type: NodeType.AI_JSON,
    label: 'JSON提取器',
    description: '提取和处理JSON数据'
  },
  [NodeType.DATABASE]: {
    ...knowledgeBaseNodeDefinition,
    type: NodeType.DATABASE,
    label: '数据库',
    description: '数据库查询和操作'
  },
  [NodeType.BING_SEARCH]: {
    ...knowledgeBaseNodeDefinition,
    type: NodeType.BING_SEARCH,
    label: 'Bing搜索',
    description: '使用Bing进行网络搜索'
  },
  [NodeType.DECISION]: {
    ...conditionNodeDefinition,
    type: NodeType.DECISION,
    label: '决策节点',
    description: '多分支决策判断'
  },
  [NodeType.BASIC]: {
    ...startNodeDefinition,
    type: NodeType.BASIC,
    label: '基础节点',
    description: '通用的基础处理节点'
  },
  [NodeType.PROCESS]: {
    ...startNodeDefinition,
    type: NodeType.PROCESS,
    label: '处理节点',
    description: '数据处理和转换节点'
  },
  [NodeType.CUSTOM]: {
    ...startNodeDefinition,
    type: NodeType.CUSTOM,
    label: '自定义节点',
    description: '可自定义功能的节点'
  },
  [NodeType.JSON_EXTRACTOR]: {
    ...aiDialogNodeDefinition,
    type: NodeType.JSON_EXTRACTOR,
    label: 'JSON提取器',
    description: '提取和处理JSON数据'
  }
};

// 节点分类配置
export const nodeCategories: NodeCategory[] = [
  {
    key: 'control',
    label: '控制节点',
    description: '流程控制相关节点',
    icon: 'ControlOutlined',
    nodes: [
      nodeDefinitions[NodeType.START],
      nodeDefinitions[NodeType.END]
    ]
  },
  {
    key: 'ai',
    label: 'AI处理节点',
    description: 'AI和机器学习相关节点',
    icon: 'RobotOutlined',
    nodes: [
      nodeDefinitions[NodeType.AI_DIALOG],
      nodeDefinitions[NodeType.AI_SUMMARY],
      nodeDefinitions[NodeType.AI_EXTRACT],
      nodeDefinitions[NodeType.AI_JSON]
    ]
  },
  {
    key: 'data',
    label: '数据节点',
    description: '数据获取和处理节点',
    icon: 'DatabaseOutlined',
    nodes: [
      nodeDefinitions[NodeType.DATABASE],
      nodeDefinitions[NodeType.KNOWLEDGE_BASE],
      nodeDefinitions[NodeType.BING_SEARCH]
    ]
  },
  {
    key: 'logic',
    label: '逻辑节点',
    description: '逻辑判断和分支节点',
    icon: 'BranchesOutlined',
    nodes: [
      nodeDefinitions[NodeType.CONDITION],
      nodeDefinitions[NodeType.DECISION]
    ]
  },
  {
    key: 'response',
    label: '响应节点',
    description: '输出和响应相关节点',
    icon: 'MessageOutlined',
    nodes: [
      nodeDefinitions[NodeType.RESPONSE]
    ]
  },
  {
    key: 'basic',
    label: '基础节点',
    description: '通用基础处理节点',
    icon: 'SettingOutlined',
    nodes: [
      nodeDefinitions[NodeType.BASIC],
      nodeDefinitions[NodeType.PROCESS],
      nodeDefinitions[NodeType.CUSTOM],
      nodeDefinitions[NodeType.JSON_EXTRACTOR]
    ]
  }
];