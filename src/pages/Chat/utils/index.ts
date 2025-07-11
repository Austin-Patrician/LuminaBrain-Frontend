import { ChatSession, ChatMessage } from '../types';
import { TIME_GROUPS, CHAT_STORAGE_KEYS } from '../constants';

// Date and time utilities
export const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString();
};

export const getDateGroup = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (sessionDate.getTime() === today.getTime()) {
    return TIME_GROUPS.TODAY;
  } else if (sessionDate.getTime() === yesterday.getTime()) {
    return TIME_GROUPS.YESTERDAY;
  } else if (sessionDate >= lastWeek) {
    return TIME_GROUPS.THIS_WEEK;
  } else {
    return TIME_GROUPS.EARLIER;
  }
};

// Session utilities
export const generateSessionId = (): string => {
  return `session_${Date.now()}`;
};

export const generateMessageId = (role: 'user' | 'assistant'): string => {
  return `msg_${Date.now()}_${role}`;
};

export const generateAttachmentId = (): string => {
  return `attachment_${Date.now()}_${Math.random()}`;
};

export const generateSessionTitle = (firstMessage: string): string => {
  const maxLength = 20;
  return firstMessage.length > maxLength 
    ? firstMessage.slice(0, maxLength) + '...'
    : firstMessage;
};

// Storage utilities
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
};

// Session data transformation utilities
export const serializeSessions = (sessions: ChatSession[]): string => {
  return JSON.stringify(sessions);
};

export const deserializeSessions = (data: string): ChatSession[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to deserialize sessions:', error);
    return [];
  }
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('excel')) return '📊';
  if (fileType.includes('powerpoint')) return '📎';
  if (fileType.includes('text')) return '📋';
  return '📁';
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Message utilities
export const scrollToBottom = (element: HTMLElement | null, smooth = true): void => {
  if (element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }
};

// Validation utilities
export const validateFileType = (file: File, allowedTypes: readonly string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

// Session grouping utilities
export const groupSessionsByDate = (sessions: ChatSession[]) => {
  // Sort sessions: pinned first, then by updated time
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const groups = {
    pinned: [] as ChatSession[],
    [TIME_GROUPS.TODAY]: [] as ChatSession[],
    [TIME_GROUPS.YESTERDAY]: [] as ChatSession[],
    [TIME_GROUPS.THIS_WEEK]: [] as ChatSession[],
    [TIME_GROUPS.EARLIER]: [] as ChatSession[],
  };

  sortedSessions.forEach(session => {
    if (session.isPinned) {
      groups.pinned.push(session);
    } else {
      const group = getDateGroup(session.updatedAt);
      if (group in groups) {
        (groups as any)[group].push(session);
      }
    }
  });

  return groups;
};

// URL utilities
export const generateShareUrl = (sessionId: string): string => {
  return `${window.location.origin}${window.location.pathname}?share=${sessionId}`;
};
