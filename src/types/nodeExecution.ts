// 节点执行相关的类型定义和DTO

// 基础节点输入接口
export interface BaseNodeInput {
  nodeId: string;
  nodeType: string;
  inputSource?: string;
  label?: string;
  description?: string;
}

// 基础节点输出接口
export interface BaseNodeOutput {
  success: boolean;
  timestamp: number;
  executionTime?: number;
  markdownOutput?: string;
  error?: string;
}

// AI对话节点输入
export interface AIDialogNodeInput extends BaseNodeInput {
  model?: string;
  systemPrompt?: string;
  userMessage?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// AI对话节点输出
export interface AIDialogNodeOutput extends BaseNodeOutput {
  model: string;
  systemPrompt: string;
  userMessage: string;
  response: string;
  temperature: number;
  maxTokens: number;
  tokensUsed?: number;
  finishReason?: string;
}

// 数据库节点输入
export interface DatabaseNodeInput extends BaseNodeInput {
  dbType?: string;
  connectionString?: string;
  query: string;
  parameters?: Record<string, any>;
  timeout?: number;
}

// 数据库节点输出
export interface DatabaseNodeOutput extends BaseNodeOutput {
  dbType: string;
  query: string;
  results: any[];
  rowCount: number;
  executionTimeMs: number;
  affectedRows?: number;
}

// 知识库节点输入
export interface KnowledgeBaseNodeInput extends BaseNodeInput {
  knowledgeBaseId: string;
  searchQuery: string;
  topK?: number;
  similarityThreshold?: number;
  searchType?: 'semantic' | 'keyword' | 'hybrid';
}

// 知识库节点输出
export interface KnowledgeBaseNodeOutput extends BaseNodeOutput {
  knowledgeBaseId: string;
  searchQuery: string;
  topK: number;
  similarityThreshold: number;
  results: Array<{
    id: string;
    title: string;
    content: string;
    similarity: number;
    metadata?: Record<string, any>;
  }>;
  totalResults: number;
}

// HTTP请求节点输入
export interface HttpNodeInput extends BaseNodeInput {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retryCount?: number;
}

// HTTP请求节点输出
export interface HttpNodeOutput extends BaseNodeOutput {
  url: string;
  method: string;
  statusCode: number;
  responseHeaders?: Record<string, string>;
  responseBody: any;
  responseTime: number;
}

// 条件判断节点输入
export interface ConditionNodeInput extends BaseNodeInput {
  condition: string;
  conditionType?: 'expression' | 'javascript' | 'simple';
  variables?: Record<string, any>;
}

// 条件判断节点输出
export interface ConditionNodeOutput extends BaseNodeOutput {
  condition: string;
  result: boolean;
  evaluatedExpression?: string;
  variables?: Record<string, any>;
}

// 数据处理节点输入
export interface DataProcessNodeInput extends BaseNodeInput {
  processType: 'transform' | 'filter' | 'aggregate' | 'sort' | 'group' | 'map' | 'reduce';
  data?: any;
  transformScript?: string;
  filterCondition?: string;
  aggregateFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
}

// 数据处理节点输出
export interface DataProcessNodeOutput extends BaseNodeOutput {
  processType: string;
  originalData: any;
  processedData: any;
  dataSource: string;
  itemsProcessed?: number;
}

// 开始节点输入
export interface StartNodeInput extends BaseNodeInput {
  triggerType?: 'manual' | 'scheduled' | 'webhook' | 'event';
  initialData?: any;
  userInput?: string;
}

// 开始节点输出
export interface StartNodeOutput extends BaseNodeOutput {
  triggerType: string;
  userInput?: string;
  initialData?: any;
}

// 结束节点输入
export interface EndNodeInput extends BaseNodeInput {
  outputFormat?: 'json' | 'text' | 'markdown' | 'xml';
  returnCode?: number;
  finalMessage?: string;
}

// 结束节点输出
export interface EndNodeOutput extends BaseNodeOutput {
  outputFormat: string;
  returnCode: number;
  summary: string;
  finalMessage?: string;
  totalNodesProcessed?: number;
}

// 用户输入节点输入
export interface UserInputNodeInput extends BaseNodeInput {
  userInputType?: 'text' | 'number' | 'boolean' | 'json' | 'file';
  placeholder?: string;
  defaultValue?: any;
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: Array<{ label: string; value: any }>;
}

// 用户输入节点输出
export interface UserInputNodeOutput extends BaseNodeOutput {
  userInput: any;
  userInputType: string;
  dataSource: string;
  isValid?: boolean;
  validationErrors?: string[];
}

// 响应节点输入
export interface ResponseNodeInput extends BaseNodeInput {
  responseTemplate: string;
  responseFormat?: 'text' | 'json' | 'html' | 'markdown';
  statusCode?: number;
  headers?: Record<string, string>;
}

// 响应节点输出
export interface ResponseNodeOutput extends BaseNodeOutput {
  responseTemplate: string;
  responseFormat: string;
  statusCode: number;
  processedResponse: string;
  headers?: Record<string, string>;
}

// JSON提取器节点输入
export interface JsonExtractorNodeInput extends BaseNodeInput {
  jsonData?: any;
  extractPath?: string;
  extractFields?: string[];
  transformRules?: Array<{
    from: string;
    to: string;
    transform?: 'uppercase' | 'lowercase' | 'trim' | 'format';
  }>;
}

// JSON提取器节点输出
export interface JsonExtractorNodeOutput extends BaseNodeOutput {
  originalData: any;
  extractedData: any;
  extractPath?: string;
  extractedFields?: string[];
  transformsApplied?: number;
}

// 文件处理节点输入
export interface FileNodeInput extends BaseNodeInput {
  fileOperation: 'read' | 'write' | 'append' | 'delete' | 'copy' | 'move';
  filePath: string;
  content?: any;
  encoding?: string;
  format?: 'text' | 'json' | 'csv' | 'xml' | 'binary';
  destinationPath?: string;
}

// 文件处理节点输出
export interface FileNodeOutput extends BaseNodeOutput {
  fileOperation: string;
  filePath: string;
  fileSize?: number;
  encoding?: string;
  content?: any;
  linesProcessed?: number;
}

// 邮件发送节点输入
export interface EmailNodeInput extends BaseNodeInput {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyType?: 'text' | 'html';
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

// 邮件发送节点输出
export interface EmailNodeOutput extends BaseNodeOutput {
  to: string[];
  subject: string;
  messageId?: string;
  deliveryStatus: 'sent' | 'failed' | 'queued';
  deliveryTime?: number;
  rejectedRecipients?: string[];
}

// 定时器节点输入
export interface TimerNodeInput extends BaseNodeInput {
  delayMs?: number;
  delayType?: 'fixed' | 'random' | 'exponential';
  maxDelayMs?: number;
  waitUntil?: string; // ISO 8601 timestamp
}

// 定时器节点输出
export interface TimerNodeOutput extends BaseNodeOutput {
  delayMs: number;
  actualWaitTime: number;
  delayType: string;
  startTime: number;
  endTime: number;
}

// 脚本执行节点输入
export interface ScriptNodeInput extends BaseNodeInput {
  scriptType: 'javascript' | 'python' | 'shell' | 'sql';
  script: string;
  parameters?: Record<string, any>;
  timeout?: number;
  workingDirectory?: string;
  environment?: Record<string, string>;
}

// 脚本执行节点输出
export interface ScriptNodeOutput extends BaseNodeOutput {
  scriptType: string;
  exitCode: number;
  stdout?: string;
  stderr?: string;
  executionTimeMs: number;
  memoryUsage?: number;
}

// 通用节点输入输出类型
export type NodeInput = 
  | AIDialogNodeInput
  | DatabaseNodeInput
  | KnowledgeBaseNodeInput
  | HttpNodeInput
  | ConditionNodeInput
  | DataProcessNodeInput
  | StartNodeInput
  | EndNodeInput
  | UserInputNodeInput
  | ResponseNodeInput
  | JsonExtractorNodeInput
  | FileNodeInput
  | EmailNodeInput
  | TimerNodeInput
  | ScriptNodeInput;

export type NodeOutput = 
  | AIDialogNodeOutput
  | DatabaseNodeOutput
  | KnowledgeBaseNodeOutput
  | HttpNodeOutput
  | ConditionNodeOutput
  | DataProcessNodeOutput
  | StartNodeOutput
  | EndNodeOutput
  | UserInputNodeOutput
  | ResponseNodeOutput
  | JsonExtractorNodeOutput
  | FileNodeOutput
  | EmailNodeOutput
  | TimerNodeOutput
  | ScriptNodeOutput;

// 节点类型枚举
export enum NodeType {
  START = 'startNode',
  END = 'endNode',
  AI_DIALOG = 'aiDialogNode',
  AI_SUMMARY = 'aiSummaryNode',
  AI_EXTRACT = 'aiExtractNode',
  AI_JSON = 'aiJsonNode',
  DATABASE = 'databaseNode',
  KNOWLEDGE_BASE = 'knowledgeBaseNode',
  HTTP = 'httpNode',
  CONDITION = 'conditionNode',
  DATA_PROCESS = 'dataProcessNode',
  USER_INPUT = 'userInputNode',
  RESPONSE = 'responseNode',
  JSON_EXTRACTOR = 'jsonExtractorNode',
  FILE = 'fileNode',
  EMAIL = 'emailNode',
  TIMER = 'timerNode',
  SCRIPT = 'scriptNode',
  BASIC = 'basicNode',
  CUSTOM = 'customNode'
}

// 节点执行状态
export enum NodeExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WAITING_INPUT = 'waiting_input',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

// 节点执行元数据
export interface NodeExecutionMetadata {
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  networkCalls?: number;
  cacheHits?: number;
  cacheMisses?: number;
  warnings?: string[];
  performance?: {
    initTime?: number;
    processTime?: number;
    cleanupTime?: number;
  };
}
