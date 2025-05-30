import { NodeTypeDefinition, NodeType, DataType, ConfigSchema } from '../types/agentFlow';

// 所有节点类型的统一定义配置
export const NODE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
  // 开始节点
  [NodeType.START]: {
    type: NodeType.START,
    label: '开始',
    category: 'control',
    icon: 'play-circle',
    color: '#52c41a',
    description: '流程开始节点',
    inputs: [],
    outputs: [
      { name: 'output', type: 'object', description: '初始数据' }
    ],
    defaultConfig: {
      initialData: {}
    },
    configSchema: [
      {
        key: 'initialData',
        label: '初始数据',
        type: 'textarea',
        placeholder: '请输入JSON格式的初始数据',
        description: '流程开始时的初始数据'
      }
    ]
  },

  // 结束节点
  [NodeType.END]: {
    type: NodeType.END,
    label: '结束',
    category: 'control',
    icon: 'stop-circle',
    color: '#ff4d4f',
    description: '流程结束节点',
    inputs: [
      { name: 'input', type: 'object', required: true, description: '最终结果' }
    ],
    outputs: [],
    defaultConfig: {
      saveResult: true,
      resultFormat: 'json'
    },
    configSchema: [
      {
        key: 'saveResult',
        label: '保存结果',
        type: 'switch',
        defaultValue: true,
        description: '是否保存执行结果'
      },
      {
        key: 'resultFormat',
        label: '结果格式',
        type: 'select',
        defaultValue: 'json',
        options: [
          { label: 'JSON', value: 'json' },
          { label: '文本', value: 'text' },
          { label: 'HTML', value: 'html' }
        ]
      }
    ]
  },

  // AI对话节点
  [NodeType.AI_DIALOG]: {
    type: NodeType.AI_DIALOG,
    label: 'AI对话',
    category: 'ai',
    icon: 'message-circle',
    color: '#1890ff',
    description: 'AI对话处理节点',
    inputs: [
      { name: 'userMessage', type: 'string', required: true, description: '用户消息' },
      { name: 'context', type: 'object', description: '上下文信息' }
    ],
    outputs: [
      { name: 'response', type: 'string', description: 'AI回复' },
      { name: 'metadata', type: 'object', description: '响应元数据' }
    ],
    defaultConfig: {
      model: 'gpt-3.5-turbo',
      systemPrompt: '你是一个有用的AI助手',
      temperature: 0.7,
      maxTokens: 1000,
      stream: false
    },
    configSchema: [
      {
        key: 'model',
        label: 'AI模型',
        type: 'select',
        required: true,
        options: [
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'GPT-4', value: 'gpt-4' },
          { label: 'Claude', value: 'claude-3' }
        ]
      },
      {
        key: 'systemPrompt',
        label: '系统提示词',
        type: 'textarea',
        placeholder: '请输入系统提示词',
        description: '定义AI的角色和行为'
      },
      {
        key: 'temperature',
        label: '创造性',
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        defaultValue: 0.7,
        description: '控制回复的随机性'
      },
      {
        key: 'maxTokens',
        label: '最大令牌数',
        type: 'number',
        min: 1,
        max: 4000,
        defaultValue: 1000
      },
      {
        key: 'stream',
        label: '流式输出',
        type: 'switch',
        defaultValue: false
      }
    ]
  },

  // AI总结节点
  [NodeType.AI_SUMMARY]: {
    type: NodeType.AI_SUMMARY,
    label: 'AI总结',
    category: 'ai',
    icon: 'file-text',
    color: '#722ed1',
    description: '文本总结节点',
    inputs: [
      { name: 'text', type: 'string', required: true, description: '待总结文本' },
      { name: 'summaryLength', type: 'string', description: '总结长度要求' }
    ],
    outputs: [
      { name: 'summary', type: 'string', description: '总结结果' },
      { name: 'keyPoints', type: 'array', description: '关键点' }
    ],
    defaultConfig: {
      model: 'gpt-3.5-turbo',
      summaryStyle: 'bullet_points',
      maxLength: 200,
      language: 'zh-CN'
    },
    configSchema: [
      {
        key: 'model',
        label: 'AI模型',
        type: 'select',
        required: true,
        options: [
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'GPT-4', value: 'gpt-4' }
        ]
      },
      {
        key: 'summaryStyle',
        label: '总结风格',
        type: 'select',
        options: [
          { label: '要点列表', value: 'bullet_points' },
          { label: '段落总结', value: 'paragraph' },
          { label: '关键词', value: 'keywords' }
        ]
      },
      {
        key: 'maxLength',
        label: '最大长度',
        type: 'number',
        min: 50,
        max: 1000,
        defaultValue: 200
      },
      {
        key: 'language',
        label: '输出语言',
        type: 'select',
        options: [
          { label: '中文', value: 'zh-CN' },
          { label: '英文', value: 'en-US' }
        ]
      }
    ]
  },

  // 知识库查询节点
  [NodeType.KNOWLEDGE_BASE]: {
    type: NodeType.KNOWLEDGE_BASE,
    label: '知识库查询',
    category: 'data',
    icon: 'database',
    color: '#fa8c16',
    description: '知识库检索节点',
    inputs: [
      { name: 'query', type: 'string', required: true, description: '查询文本' },
      { name: 'filters', type: 'object', description: '过滤条件' }
    ],
    outputs: [
      { name: 'results', type: 'array', description: '检索结果' },
      { name: 'metadata', type: 'object', description: '检索元数据' }
    ],
    defaultConfig: {
      knowledgeBaseId: '',
      topK: 5,
      similarityThreshold: 0.7,
      includeMetadata: true
    },
    configSchema: [
      {
        key: 'knowledgeBaseId',
        label: '知识库ID',
        type: 'select',
        required: true,
        placeholder: '请选择知识库'
      },
      {
        key: 'topK',
        label: '返回数量',
        type: 'number',
        min: 1,
        max: 20,
        defaultValue: 5
      },
      {
        key: 'similarityThreshold',
        label: '相似度阈值',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.1,
        defaultValue: 0.7
      },
      {
        key: 'includeMetadata',
        label: '包含元数据',
        type: 'switch',
        defaultValue: true
      }
    ]
  },

  // 条件判断节点
  [NodeType.CONDITION]: {
    type: NodeType.CONDITION,
    label: '条件判断',
    category: 'logic',
    icon: 'git-branch',
    color: '#13c2c2',
    description: '条件分支节点',
    inputs: [
      { name: 'input', type: 'object', required: true, description: '输入数据' }
    ],
    outputs: [
      { name: 'true', type: 'object', description: '条件为真时的输出' },
      { name: 'false', type: 'object', description: '条件为假时的输出' }
    ],
    defaultConfig: {
      condition: 'input.value > 0',
      conditionType: 'javascript'
    },
    configSchema: [
      {
        key: 'conditionType',
        label: '条件类型',
        type: 'select',
        options: [
          { label: 'JavaScript表达式', value: 'javascript' },
          { label: 'JSONPath', value: 'jsonpath' },
          { label: '简单比较', value: 'simple' }
        ]
      },
      {
        key: 'condition',
        label: '条件表达式',
        type: 'textarea',
        required: true,
        placeholder: '例如: input.value > 0',
        description: '请输入条件表达式'
      }
    ]
  },

  // HTTP请求节点
  [NodeType.BASIC]: {
    type: NodeType.BASIC,
    label: 'HTTP请求',
    category: 'data',
    icon: 'globe',
    color: '#f759ab',
    description: 'HTTP请求节点',
    inputs: [
      { name: 'url', type: 'string', description: '请求URL' },
      { name: 'body', type: 'object', description: '请求体' },
      { name: 'headers', type: 'object', description: '请求头' }
    ],
    outputs: [
      { name: 'response', type: 'object', description: '响应数据' },
      { name: 'status', type: 'number', description: '状态码' }
    ],
    defaultConfig: {
      method: 'GET',
      url: '',
      timeout: 30000,
      retryCount: 3
    },
    configSchema: [
      {
        key: 'method',
        label: '请求方法',
        type: 'select',
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
        type: 'input',
        required: true,
        placeholder: 'https://api.example.com/data'
      },
      {
        key: 'timeout',
        label: '超时时间(ms)',
        type: 'number',
        defaultValue: 30000
      },
      {
        key: 'retryCount',
        label: '重试次数',
        type: 'number',
        min: 0,
        max: 5,
        defaultValue: 3
      }
    ]
  },

  // JSON提取器节点
  [NodeType.JSON_EXTRACTOR]: {
    type: NodeType.JSON_EXTRACTOR,
    label: 'JSON提取器',
    category: 'data',
    icon: 'code',
    color: '#eb2f96',
    description: 'JSON数据提取节点',
    inputs: [
      { name: 'json', type: 'object', required: true, description: 'JSON数据' }
    ],
    outputs: [
      { name: 'extracted', type: 'object', description: '提取的数据' }
    ],
    defaultConfig: {
      jsonPath: '$.data',
      extractMode: 'single',
      defaultValue: null
    },
    configSchema: [
      {
        key: 'jsonPath',
        label: 'JSONPath表达式',
        type: 'input',
        required: true,
        placeholder: '$.data.items[0].name',
        description: '使用JSONPath语法提取数据'
      },
      {
        key: 'extractMode',
        label: '提取模式',
        type: 'select',
        options: [
          { label: '单个值', value: 'single' },
          { label: '多个值', value: 'multiple' },
          { label: '全部匹配', value: 'all' }
        ]
      },
      {
        key: 'defaultValue',
        label: '默认值',
        type: 'textarea',
        placeholder: '提取失败时的默认值'
      }
    ]
  },

  // 响应节点
  [NodeType.RESPONSE]: {
    type: NodeType.RESPONSE,
    label: '响应输出',
    category: 'output',
    icon: 'send',
    color: '#52c41a',
    description: '响应输出节点',
    inputs: [
      { name: 'data', type: 'object', required: true, description: '响应数据' }
    ],
    outputs: [],
    defaultConfig: {
      responseFormat: 'json',
      template: '{{ data }}',
      statusCode: 200
    },
    configSchema: [
      {
        key: 'responseFormat',
        label: '响应格式',
        type: 'select',
        options: [
          { label: 'JSON', value: 'json' },
          { label: '文本', value: 'text' },
          { label: 'HTML', value: 'html' },
          { label: 'Markdown', value: 'markdown' }
        ]
      },
      {
        key: 'template',
        label: '响应模板',
        type: 'textarea',
        placeholder: '使用 {{ variable }} 语法引用变量',
        description: '响应内容模板'
      },
      {
        key: 'statusCode',
        label: 'HTTP状态码',
        type: 'number',
        min: 200,
        max: 599,
        defaultValue: 200
      }
    ]
  }
};

// 节点分类定义
export const NODE_CATEGORIES = [
  {
    key: 'control',
    label: '控制节点',
    description: '流程控制相关节点',
    icon: 'settings',
    nodes: [NodeType.START, NodeType.END]
  },
  {
    key: 'ai',
    label: 'AI节点',
    description: '人工智能处理节点',
    icon: 'brain',
    nodes: [NodeType.AI_DIALOG, NodeType.AI_SUMMARY, NodeType.AI_EXTRACT, NodeType.AI_JSON]
  },
  {
    key: 'data',
    label: '数据节点',
    description: '数据处理和获取节点',
    icon: 'database',
    nodes: [NodeType.DATABASE, NodeType.KNOWLEDGE_BASE, NodeType.BING_SEARCH, NodeType.BASIC, NodeType.JSON_EXTRACTOR]
  },
  {
    key: 'logic',
    label: '逻辑节点',
    description: '逻辑处理和判断节点',
    icon: 'git-branch',
    nodes: [NodeType.CONDITION, NodeType.DECISION]
  },
  {
    key: 'output',
    label: '输出节点',
    description: '结果输出节点',
    icon: 'send',
    nodes: [NodeType.RESPONSE]
  }
];