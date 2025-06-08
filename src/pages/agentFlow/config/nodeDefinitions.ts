import { 
  NodeType, 
  NodeConfig, 
  PropertyConfig,
  NODE_REGISTRY 
} from '@/types/agentFlow';
import { INPUT_SOURCE_OPTIONS, INPUT_SOURCE } from '../constants/inputSource';

// 为每个节点添加通用的"输入参数"选择器
const createInputSourceProperty = (): PropertyConfig => ({
  key: 'inputSource',
  label: '输入参数',
  type: 'select',
  required: true,
  defaultValue: INPUT_SOURCE.PREVIOUS_RESULT,
  options: INPUT_SOURCE_OPTIONS.map(option => ({
    label: option.label,
    value: option.value
  }))
});

// 扩展现有的节点配置，添加输入参数选择器
export const enhancedNodeConfigs: Record<NodeType, NodeConfig> = {
  // 保留所有现有配置，并为每个节点添加输入参数选择器
  ...NODE_REGISTRY,
  
  [NodeType.AI_DIALOG]: {
    ...NODE_REGISTRY[NodeType.AI_DIALOG],
    properties: [
      createInputSourceProperty(),
      ...(NODE_REGISTRY[NodeType.AI_DIALOG].properties || [])
    ]
  },
  
  [NodeType.HTTP]: {
    ...NODE_REGISTRY[NodeType.HTTP],
    properties: [
      createInputSourceProperty(),
      ...(NODE_REGISTRY[NodeType.HTTP].properties || [])
    ]
  },
  
  [NodeType.CONDITION]: {
    ...NODE_REGISTRY[NodeType.CONDITION],
    properties: [
      createInputSourceProperty(),
      ...(NODE_REGISTRY[NodeType.CONDITION].properties || [])
    ]
  },
  
  [NodeType.JSON_EXTRACTOR]: {
    ...NODE_REGISTRY[NodeType.JSON_EXTRACTOR],
    properties: [
      createInputSourceProperty(),
      ...(NODE_REGISTRY[NodeType.JSON_EXTRACTOR].properties || [])
    ]
  },
  
  [NodeType.KNOWLEDGE_BASE]: {
    ...NODE_REGISTRY[NodeType.KNOWLEDGE_BASE],
    properties: [
      createInputSourceProperty(),
      {
        key: 'knowledgeBaseId',
        label: '知识库ID',
        type: 'text',
        required: true
      },
      {
        key: 'query',
        label: '查询内容',
        type: 'text',
        required: true
      },
      {
        key: 'topK',
        label: '返回数量',
        type: 'number',
        defaultValue: 5,
        validation: { min: 1, max: 20 }
      },
      {
        key: 'threshold',
        label: '相似度阈值',
        type: 'number',
        defaultValue: 0.7,
        validation: { min: 0, max: 1 }
      },
      {
        key: 'searchType',
        label: '搜索类型',
        type: 'select',
        defaultValue: 'semantic',
        options: [
          { label: '语义搜索', value: 'semantic' },
          { label: '关键词搜索', value: 'keyword' },
          { label: '混合搜索', value: 'hybrid' }
        ]
      }
    ]
  },
  
  [NodeType.LLM]: {
    ...NODE_REGISTRY[NodeType.LLM],
    properties: [
      createInputSourceProperty(),
      {
        key: 'model',
        label: 'LLM模型',
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
        key: 'prompt',
        label: '提示词',
        type: 'textarea',
        required: true
      },
      {
        key: 'temperature',
        label: '创造性',
        type: 'slider',
        defaultValue: 0.7,
        validation: { min: 0, max: 2 }
      }
    ]
  },
  
  [NodeType.AI_EXTRACT]: {
    ...NODE_REGISTRY[NodeType.AI_EXTRACT],
    properties: [
      createInputSourceProperty(),
      {
        key: 'extractType',
        label: '提取类型',
        type: 'select',
        required: true,
        defaultValue: 'text',
        options: [
          { label: '文本提取', value: 'text' },
          { label: '数据提取', value: 'data' },
          { label: '结构化提取', value: 'structured' }
        ]
      },
      {
        key: 'extractPrompt',
        label: '提取指令',
        type: 'textarea',
        required: true
      }
    ]
  },
  
  [NodeType.DATABASE]: {
    ...NODE_REGISTRY[NodeType.DATABASE],
    properties: [
      createInputSourceProperty(),
      {
        key: 'connectionString',
        label: '数据库连接',
        type: 'text',
        required: true
      },
      {
        key: 'query',
        label: 'SQL查询',
        type: 'textarea',
        required: true
      },
      {
        key: 'operation',
        label: '操作类型',
        type: 'select',
        defaultValue: 'select',
        options: [
          { label: '查询 (SELECT)', value: 'select' },
          { label: '插入 (INSERT)', value: 'insert' },
          { label: '更新 (UPDATE)', value: 'update' },
          { label: '删除 (DELETE)', value: 'delete' }
        ]
      }
    ]
  },
  
  [NodeType.BING_SEARCH]: {
    ...NODE_REGISTRY[NodeType.BING_SEARCH],
    properties: [
      createInputSourceProperty(),
      {
        key: 'query',
        label: '搜索关键词',
        type: 'text',
        required: true
      },
      {
        key: 'count',
        label: '结果数量',
        type: 'number',
        defaultValue: 10,
        validation: { min: 1, max: 50 }
      },
      {
        key: 'market',
        label: '搜索市场',
        type: 'select',
        defaultValue: 'zh-CN',
        options: [
          { label: '中国', value: 'zh-CN' },
          { label: '美国', value: 'en-US' },
          { label: '英国', value: 'en-GB' }
        ]
      }
    ]
  },
  
  [NodeType.DECISION]: {
    ...NODE_REGISTRY[NodeType.DECISION],
    properties: [
      createInputSourceProperty(),
      {
        key: 'conditions',
        label: '判断条件',
        type: 'textarea',
        required: true
      },
      {
        key: 'defaultPath',
        label: '默认路径',
        type: 'text',
        defaultValue: 'default'
      }
    ]
  },
  
  [NodeType.SWITCH]: {
    ...NODE_REGISTRY[NodeType.SWITCH],
    properties: [
      createInputSourceProperty(),
      {
        key: 'switchExpression',
        label: '切换表达式',
        type: 'text',
        required: true
      },
      {
        key: 'cases',
        label: '分支情况',
        type: 'json',
        defaultValue: {}
      }
    ]
  },
  
  [NodeType.API_CALL]: {
    ...NODE_REGISTRY[NodeType.API_CALL],
    properties: [
      createInputSourceProperty(),
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
        label: 'API地址',
        type: 'text',
        required: true
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
  
  [NodeType.WEBHOOK]: {
    ...NODE_REGISTRY[NodeType.WEBHOOK],
    properties: [
      createInputSourceProperty(),
      {
        key: 'webhookUrl',
        label: 'Webhook地址',
        type: 'text',
        required: true
      },
      {
        key: 'method',
        label: '请求方法',
        type: 'select',
        defaultValue: 'POST',
        options: [
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' }
        ]
      },
      {
        key: 'secret',
        label: '密钥',
        type: 'text'
      }
    ]
  },
  
  [NodeType.DATA_MAPPER]: {
    ...NODE_REGISTRY[NodeType.DATA_MAPPER],
    properties: [
      createInputSourceProperty(),
      {
        key: 'mappingRules',
        label: '映射规则',
        type: 'json',
        required: true,
        defaultValue: {}
      },
      {
        key: 'outputFormat',
        label: '输出格式',
        type: 'select',
        defaultValue: 'json',
        options: [
          { label: 'JSON', value: 'json' },
          { label: 'XML', value: 'xml' },
          { label: 'CSV', value: 'csv' }
        ]
      }
    ]
  },
  
  [NodeType.TEXT_PROCESSOR]: {
    ...NODE_REGISTRY[NodeType.TEXT_PROCESSOR],
    properties: [
      createInputSourceProperty(),
      {
        key: 'operation',
        label: '处理操作',
        type: 'select',
        required: true,
        defaultValue: 'clean',
        options: [
          { label: '清洗文本', value: 'clean' },
          { label: '格式化', value: 'format' },
          { label: '提取关键词', value: 'extract' },
          { label: '分词', value: 'tokenize' }
        ]
      },
      {
        key: 'parameters',
        label: '处理参数',
        type: 'json',
        defaultValue: {}
      }
    ]
  },
  
  [NodeType.JAVASCRIPT]: {
    ...NODE_REGISTRY[NodeType.JAVASCRIPT],
    properties: [
      createInputSourceProperty(),
      {
        key: 'code',
        label: 'JavaScript代码',
        type: 'textarea',
        required: true,
        defaultValue: '// 在这里编写您的代码\nfunction process(input) {\n  // 处理输入数据\n  return input;\n}'
      },
      {
        key: 'timeout',
        label: '超时时间(秒)',
        type: 'number',
        defaultValue: 30,
        validation: { min: 1, max: 300 }
      }
    ]
  },
  
  // 开始和结束节点不需要输入参数选择器
  [NodeType.START]: NODE_REGISTRY[NodeType.START],
  [NodeType.END]: NODE_REGISTRY[NodeType.END],
  [NodeType.BASIC]: {
    ...NODE_REGISTRY[NodeType.BASIC],
    properties: [
      createInputSourceProperty(),
      {
        key: 'operation',
        label: '基础操作',
        type: 'text',
        defaultValue: '基础处理'
      }
    ]
  }
};

// 导出增强后的节点配置
export default enhancedNodeConfigs;