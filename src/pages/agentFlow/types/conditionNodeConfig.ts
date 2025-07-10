// 条件节点配置接口定义
export interface ConditionNodeConfig {
  // 基础属性
  label?: string;
  description?: string;
  inputSource?: string;

  // 条件判断配置
  conditionType: 'javascript' | 'jsonpath' | 'simple' | 'regex' | 'custom';
  condition: string;
  
  // 简单比较模式配置
  simpleComparison?: {
    leftOperand: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'contains' | 'starts_with' | 'ends_with' | 'regex_match';
    rightOperand: string;
    dataType: 'string' | 'number' | 'boolean' | 'date';
  };

  // 多条件配置
  enableMultipleConditions?: boolean;
  logicalOperator?: 'AND' | 'OR';
  conditions?: Array<{
    id: string;
    condition: string;
    conditionType: 'javascript' | 'jsonpath' | 'simple';
    enabled: boolean;
    weight?: number; // 权重，用于复杂判断
  }>;

  // 分支配置
  trueBranch?: {
    label: string;
    description?: string;
    outputData?: any;
  };
  falseBranch?: {
    label: string;
    description?: string;
    outputData?: any;
  };

  // 高级配置
  enableLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  timeout?: number; // 超时时间（毫秒）
  retryCount?: number; // 重试次数
  
  // 错误处理
  errorHandling?: {
    onError: 'throw' | 'false' | 'true' | 'custom';
    customValue?: any;
    fallbackCondition?: string;
  };

  // 性能优化
  enableCaching?: boolean;
  cacheKey?: string;
  cacheTTL?: number; // 缓存时间（秒）

  // 调试和测试
  testCases?: Array<{
    id: string;
    name: string;
    input: any;
    expectedOutput: boolean;
    description?: string;
  }>;

  // 变量提取
  extractVariables?: boolean;
  variableExtraction?: {
    extractedVars: Array<{
      name: string;
      path: string;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      defaultValue?: any;
    }>;
  };
}

// 预定义的条件模板
export interface ConditionTemplate {
  id: string;
  name: string;
  description: string;
  conditionType: ConditionNodeConfig['conditionType'];
  condition: string;
  category: 'common' | 'business' | 'technical' | 'validation';
  variables?: string[];
}

// 条件操作符定义
export const CONDITION_OPERATORS = {
  COMPARISON: [
    { value: 'equals', label: '等于 (==)', symbol: '==' },
    { value: 'not_equals', label: '不等于 (!=)', symbol: '!=' },
    { value: 'greater_than', label: '大于 (>)', symbol: '>' },
    { value: 'less_than', label: '小于 (<)', symbol: '<' },
    { value: 'greater_equal', label: '大于等于 (>=)', symbol: '>=' },
    { value: 'less_equal', label: '小于等于 (<=)', symbol: '<=' },
  ],
  STRING: [
    { value: 'contains', label: '包含', symbol: 'includes' },
    { value: 'starts_with', label: '以...开头', symbol: 'startsWith' },
    { value: 'ends_with', label: '以...结尾', symbol: 'endsWith' },
    { value: 'regex_match', label: '正则匹配', symbol: 'match' },
  ],
  LOGICAL: [
    { value: 'AND', label: '并且 (&&)', symbol: '&&' },
    { value: 'OR', label: '或者 (||)', symbol: '||' },
  ],
} as const;

// 预定义条件模板
export const CONDITION_TEMPLATES: ConditionTemplate[] = [
  // 常用模板
  {
    id: 'empty_check',
    name: '空值检查',
    description: '检查输入是否为空或未定义',
    conditionType: 'javascript',
    condition: 'input && input.trim() !== ""',
    category: 'common',
  },
  {
    id: 'number_range',
    name: '数值范围检查',
    description: '检查数值是否在指定范围内',
    conditionType: 'javascript',
    condition: 'input >= {{min}} && input <= {{max}}',
    category: 'common',
    variables: ['min', 'max'],
  },
  {
    id: 'email_validation',
    name: '邮箱格式验证',
    description: '验证邮箱地址格式是否正确',
    conditionType: 'regex',
    condition: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
    category: 'validation',
  },
  {
    id: 'array_length',
    name: '数组长度检查',
    description: '检查数组是否有指定数量的元素',
    conditionType: 'javascript',
    condition: 'Array.isArray(input) && input.length > {{count}}',
    category: 'common',
    variables: ['count'],
  },
  
  // 业务模板
  {
    id: 'user_permission',
    name: '用户权限检查',
    description: '检查用户是否有特定权限',
    conditionType: 'javascript',
    condition: 'input.user && input.user.permissions && input.user.permissions.includes("{{permission}}")',
    category: 'business',
    variables: ['permission'],
  },
  {
    id: 'order_status',
    name: '订单状态判断',
    description: '判断订单状态是否符合条件',
    conditionType: 'jsonpath',
    condition: '$.order.status',
    category: 'business',
  },
  
  // 技术模板
  {
    id: 'api_response_success',
    name: 'API响应成功检查',
    description: '检查API响应是否成功',
    conditionType: 'javascript',
    condition: 'input.status >= 200 && input.status < 300',
    category: 'technical',
  },
  {
    id: 'json_path_exists',
    name: 'JSON路径存在检查',
    description: '检查JSON对象中是否存在指定路径',
    conditionType: 'jsonpath',
    condition: '$.{{path}}',
    category: 'technical',
    variables: ['path'],
  },
];

// 数据类型转换配置
export const DATA_TYPE_CONVERTERS = {
  string: (value: any) => String(value),
  number: (value: any) => Number(value),
  boolean: (value: any) => Boolean(value),
  date: (value: any) => new Date(value),
};

// 条件节点默认配置
export const DEFAULT_CONDITION_CONFIG: ConditionNodeConfig = {
  conditionType: 'javascript',
  condition: 'input !== null && input !== undefined',
  trueBranch: {
    label: '条件为真',
    description: '当条件判断为真时执行此分支',
  },
  falseBranch: {
    label: '条件为假',
    description: '当条件判断为假时执行此分支',
  },
  enableLogging: false,
  logLevel: 'info',
  timeout: 5000,
  retryCount: 0,
  errorHandling: {
    onError: 'false',
  },
  enableCaching: false,
  cacheTTL: 300,
  extractVariables: false,
  enableMultipleConditions: false,
  logicalOperator: 'AND',
  conditions: [],
};
