// Chat constants

export const CHAT_STORAGE_KEYS = {
  SESSIONS: 'chat-sessions',
  CURRENT_SESSION: 'chat-current-session',
  CONFIG: 'chat-config',
} as const;

export const DEFAULT_CHAT_CONFIG = {
  selectedModel: '',
  selectedModelType: '',
  selectedModelIsStream: true,
  thinkingMode: false,
  temperature: 0.7,
  maxTokens: 8000,
} as const;

export const DEFAULT_UI_STATE = {
  sidebarCollapsed: false,
  isLoading: false,
  isStreaming: false,
  streamingMessage: '',
  showCanvas: false,
  shareModalVisible: false,
} as const;

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export const SIDEBAR_WIDTH = {
  EXPANDED: 240,
  COLLAPSED: 50,
} as const;

export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const TIME_GROUPS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'thisWeek',
  EARLIER: 'earlier',
} as const;

export const TIME_GROUP_LABELS = {
  [TIME_GROUPS.TODAY]: '今天',
  [TIME_GROUPS.YESTERDAY]: '昨天',
  [TIME_GROUPS.THIS_WEEK]: '本周',
  [TIME_GROUPS.EARLIER]: '更早',
} as const;

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 10000,
  MAX_ATTACHMENTS: 5,
  MAX_SESSION_TITLE_LENGTH: 100,
} as const;
