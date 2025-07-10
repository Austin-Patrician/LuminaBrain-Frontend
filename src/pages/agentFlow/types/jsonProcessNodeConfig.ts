/**
 * JSON处理节点配置接口
 * 定义JSON处理节点的所有配置选项和类型
 */

// JSON处理操作类型
export type JsonProcessOperation = 
  | 'extract'        // 提取数据
  | 'transform'      // 转换结构
  | 'validate'       // 验证格式
  | 'merge'          // 合并对象
  | 'filter'         // 过滤数据
  | 'sort'           // 排序数组
  | 'aggregate'      // 聚合统计
  | 'format'         // 格式化输出
  | 'schema'         // 生成Schema
  | 'compress';      // 压缩结构

// JSON路径表达式类型
export type JsonPathType = 
  | 'jsonpath'       // JSONPath语法 ($.data.items[0])
  | 'javascript'     // JavaScript表达式
  | 'lodash'         // Lodash get/set语法
  | 'simple';        // 简单点号语法 (data.items.0)

// 数据类型映射
export type DataTypeMapping = {
  source: string;      // 源字段路径
  target: string;      // 目标字段名
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date' | 'auto';
  defaultValue?: any;  // 默认值
  required?: boolean;  // 是否必需
  transform?: string;  // 转换表达式
};

// 验证规则
export type ValidationRule = {
  field: string;       // 字段路径
  type: 'required' | 'type' | 'format' | 'range' | 'pattern' | 'custom';
  value?: any;         // 验证值
  message?: string;    // 错误消息
};

// 排序配置
export type SortConfig = {
  path: string;        // 排序字段路径
  order: 'asc' | 'desc'; // 排序方向
  type: 'string' | 'number' | 'date'; // 数据类型
};

// 聚合配置
export type AggregateConfig = {
  groupBy?: string;    // 分组字段
  operations: {
    field: string;     // 聚合字段
    operation: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'first' | 'last';
    alias?: string;    // 别名
  }[];
};

// 输出格式配置
export type OutputFormatConfig = {
  format: 'json' | 'csv' | 'xml' | 'yaml' | 'table';
  pretty?: boolean;    // 美化输出
  encoding?: 'utf8' | 'base64';
  compression?: 'none' | 'gzip' | 'deflate';
};

// 错误处理配置
export type ErrorHandlingConfig = {
  onError: 'throw' | 'skip' | 'default' | 'log';
  defaultValue?: any;
  logLevel?: 'error' | 'warn' | 'info';
  continueOnError?: boolean;
};

// JSON处理节点完整配置接口
export interface JsonProcessNodeConfig {
  nodeType: 'jsonProcessNode';
  
  // 基础配置
  operation: JsonProcessOperation;
  inputFormat: 'json' | 'string' | 'auto';
  outputFormat: OutputFormatConfig;
  
  // 数据提取配置
  extractConfig?: {
    pathType: JsonPathType;
    paths: string[];           // 提取路径列表
    includeMetadata?: boolean; // 包含元数据
    flattenArrays?: boolean;   // 展平数组
  };
  
  // 数据转换配置
  transformConfig?: {
    mappings: DataTypeMapping[];
    preserveOriginal?: boolean; // 保留原始字段
    mergeStrategy?: 'shallow' | 'deep' | 'replace';
    transformScript?: string;   // 自定义转换脚本
  };
  
  // 数据验证配置
  validateConfig?: {
    schema?: string;           // JSON Schema
    rules: ValidationRule[];
    strictMode?: boolean;      // 严格模式
    reportDetails?: boolean;   // 详细报告
  };
  
  // 数据合并配置
  mergeConfig?: {
    sources: string[];         // 合并源路径
    strategy: 'merge' | 'concat' | 'union' | 'intersect';
    conflictResolution?: 'first' | 'last' | 'merge' | 'error';
  };
  
  // 数据过滤配置
  filterConfig?: {
    conditions: {
      path: string;
      operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex' | 'exists';
      value?: any;
    }[];
    logicalOperator?: 'and' | 'or';
    filterScript?: string;     // 自定义过滤脚本
  };
  
  // 排序配置
  sortConfig?: {
    sorts: SortConfig[];
    arrayPath?: string;        // 数组路径
    stableSort?: boolean;      // 稳定排序
  };
  
  // 聚合配置
  aggregateConfig?: AggregateConfig;
  
  // 错误处理
  errorHandling?: ErrorHandlingConfig;
  
  // 性能配置
  performanceConfig?: {
    enableCache?: boolean;     // 启用缓存
    timeout?: number;          // 超时时间
    memoryLimit?: number;      // 内存限制(MB)
    batchSize?: number;        // 批处理大小
  };
  
  // 调试配置
  debugConfig?: {
    enableLogging?: boolean;   // 启用日志
    logSteps?: boolean;        // 记录步骤
    preserveIntermediate?: boolean; // 保留中间结果
  };
}

// 预定义的JSON处理模板
export const JSON_PROCESS_TEMPLATES = [
  {
    id: 'data_extract',
    name: '数据提取',
    description: '从复杂JSON中提取特定字段',
    config: {
      operation: 'extract' as JsonProcessOperation,
      extractConfig: {
        pathType: 'jsonpath' as JsonPathType,
        paths: ['$.data.items[*].name', '$.data.items[*].id'],
        flattenArrays: true
      }
    }
  },
  {
    id: 'data_transform',
    name: '数据转换',
    description: '重新组织JSON数据结构',
    config: {
      operation: 'transform' as JsonProcessOperation,
      transformConfig: {
        mappings: [
          {
            source: 'user.fullName',
            target: 'name',
            type: 'string' as const,
            required: true
          },
          {
            source: 'user.email',
            target: 'email',
            type: 'string' as const,
            required: true
          }
        ]
      }
    }
  },
  {
    id: 'data_validate',
    name: '数据验证',
    description: '验证JSON数据格式和内容',
    config: {
      operation: 'validate' as JsonProcessOperation,
      validateConfig: {
        rules: [
          {
            field: 'email',
            type: 'pattern' as const,
            value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            message: '邮箱格式不正确'
          }
        ]
      }
    }
  },
  {
    id: 'array_sort',
    name: '数组排序',
    description: '对JSON数组进行排序',
    config: {
      operation: 'sort' as JsonProcessOperation,
      sortConfig: {
        sorts: [
          {
            path: 'createdAt',
            order: 'desc' as const,
            type: 'date' as const
          }
        ],
        arrayPath: '$.items'
      }
    }
  },
  {
    id: 'data_aggregate',
    name: '数据聚合',
    description: '对数据进行分组统计',
    config: {
      operation: 'aggregate' as JsonProcessOperation,
      aggregateConfig: {
        groupBy: 'category',
        operations: [
          {
            field: 'amount',
            operation: 'sum' as const,
            alias: 'totalAmount'
          },
          {
            field: 'id',
            operation: 'count' as const,
            alias: 'count'
          }
        ]
      }
    }
  }
] as const;

// 默认配置
export const DEFAULT_JSON_PROCESS_CONFIG: JsonProcessNodeConfig = {
  nodeType: 'jsonProcessNode',
  operation: 'extract',
  inputFormat: 'auto',
  outputFormat: {
    format: 'json',
    pretty: true
  },
  extractConfig: {
    pathType: 'jsonpath',
    paths: ['$.*'],
    includeMetadata: false,
    flattenArrays: false
  },
  errorHandling: {
    onError: 'throw',
    continueOnError: false,
    logLevel: 'error'
  },
  performanceConfig: {
    enableCache: false,
    timeout: 30000,
    memoryLimit: 100,
    batchSize: 1000
  },
  debugConfig: {
    enableLogging: false,
    logSteps: false,
    preserveIntermediate: false
  }
};

// JSON路径操作符
export const JSON_PATH_OPERATORS = [
  { value: '$', label: '根对象', description: '表示JSON根对象' },
  { value: '.', label: '子属性', description: '访问对象属性' },
  { value: '[]', label: '数组索引', description: '访问数组元素' },
  { value: '[*]', label: '数组通配', description: '选择所有数组元素' },
  { value: '..', label: '递归下降', description: '递归搜索所有匹配项' },
  { value: '[?()]', label: '过滤表达式', description: '根据条件过滤元素' },
  { value: '[start:end]', label: '切片', description: '数组切片操作' }
] as const;

// 数据类型选项
export const DATA_TYPE_OPTIONS = [
  { value: 'auto', label: '自动检测', description: '自动检测数据类型' },
  { value: 'string', label: '字符串', description: '文本类型' },
  { value: 'number', label: '数字', description: '数值类型' },
  { value: 'boolean', label: '布尔值', description: 'true/false' },
  { value: 'object', label: '对象', description: 'JSON对象' },
  { value: 'array', label: '数组', description: 'JSON数组' },
  { value: 'date', label: '日期', description: '日期时间类型' }
] as const;

// 输出格式选项
export const OUTPUT_FORMAT_OPTIONS = [
  { value: 'json', label: 'JSON', description: 'JSON格式输出' },
  { value: 'csv', label: 'CSV', description: '逗号分隔值' },
  { value: 'xml', label: 'XML', description: 'XML格式' },
  { value: 'yaml', label: 'YAML', description: 'YAML格式' },
  { value: 'table', label: '表格', description: '表格格式' }
] as const;
