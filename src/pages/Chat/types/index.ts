// Chat related type definitions

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
  thinking?: boolean;
  streaming?: boolean;
  responseTime?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  isPinned?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  type?: string;
  isStream?: boolean;
  description?: string;
}

export interface ChatConfig {
  selectedModel: string;
  selectedModelType: string;
  selectedModelIsStream: boolean;
  thinkingMode: boolean;
  temperature: number;
  maxTokens: number;
}

export interface ChatUIState {
  sidebarCollapsed: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  streamingMessage: string;
  showCanvas: boolean;
  shareModalVisible: boolean;
}

export interface ChatHandlers {
  onSendMessage: () => Promise<void>;
  onEditUserMessage: (messageId: string, newContent: string) => Promise<void>;
  onRegenerateResponse: (messageId: string) => Promise<void>;
  onCopyMessage: (content: string) => Promise<void>;
  onCreateNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  onPinSession: (sessionId: string, isPinned: boolean) => void;
}

export type ChatContextType = {
  // State
  sessions: ChatSession[];
  currentSession: string;
  messages: ChatMessage[];
  inputValue: string;
  attachedFiles: File[];
  config: ChatConfig;
  uiState: ChatUIState;

  // Actions
  handlers: ChatHandlers;
  
  // Setters
  setInputValue: (value: string) => void;
  setAttachedFiles: (files: File[]) => void;
  updateConfig: (updates: Partial<ChatConfig>) => void;
  updateUIState: (updates: Partial<ChatUIState>) => void;
};
