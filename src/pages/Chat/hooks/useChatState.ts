import { useState, useCallback, useEffect } from 'react';
import { message as antdMessage } from 'antd';
import { ChatSession, ChatMessage, ChatConfig, ChatUIState } from '../types';
import { 
  DEFAULT_CHAT_CONFIG, 
  DEFAULT_UI_STATE, 
  CHAT_STORAGE_KEYS 
} from '../constants';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  removeFromLocalStorage,
  deserializeSessions,
  serializeSessions,
  generateSessionId,
  generateSessionTitle
} from '../utils';

export const useChatState = () => {
  // Core state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Configuration state
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CHAT_CONFIG);
  const [uiState, setUIState] = useState<ChatUIState>(DEFAULT_UI_STATE);

  // Load initial data from localStorage
  useEffect(() => {
    const savedSessions = loadFromLocalStorage(CHAT_STORAGE_KEYS.SESSIONS, '');
    const savedCurrentSession = loadFromLocalStorage(CHAT_STORAGE_KEYS.CURRENT_SESSION, '');
    const savedConfig = loadFromLocalStorage(CHAT_STORAGE_KEYS.CONFIG, DEFAULT_CHAT_CONFIG);

    if (savedSessions) {
      try {
        const parsedSessions = deserializeSessions(savedSessions);
        setSessions(parsedSessions);

        if (savedCurrentSession && parsedSessions.some(s => s.id === savedCurrentSession)) {
          setCurrentSession(savedCurrentSession);
          const currentSessionData = parsedSessions.find(s => s.id === savedCurrentSession);
          if (currentSessionData) {
            setMessages(currentSessionData.messages);
          }
        }
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    }

    setConfig({ ...DEFAULT_CHAT_CONFIG, ...savedConfig });
  }, []);

  // Save sessions to localStorage whenever they change
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    saveToLocalStorage(CHAT_STORAGE_KEYS.SESSIONS, serializeSessions(newSessions));
  }, []);

  // Save current session ID
  const saveCurrentSessionId = useCallback((sessionId: string) => {
    saveToLocalStorage(CHAT_STORAGE_KEYS.CURRENT_SESSION, sessionId);
  }, []);

  // Save config
  const saveConfig = useCallback((newConfig: ChatConfig) => {
    saveToLocalStorage(CHAT_STORAGE_KEYS.CONFIG, newConfig);
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<ChatConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      saveConfig(newConfig);
      return newConfig;
    });
  }, [saveConfig]);

  // Update UI state
  const updateUIState = useCallback((updates: Partial<ChatUIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  }, []);

  // Create new session
  const createNewSession = useCallback((model?: string): ChatSession => {
    const newSession: ChatSession = {
      id: generateSessionId(),
      title: '新对话',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: model || config.selectedModel,
    };
    return newSession;
  }, [config.selectedModel]);

  // Add new session
  const addSession = useCallback((session: ChatSession) => {
    setSessions(prev => {
      const newSessions = [session, ...prev];
      saveSessions(newSessions);
      return newSessions;
    });
  }, [saveSessions]);

  // Update session
  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => {
      const newSessions = prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            ...updates,
            updatedAt: new Date(),
          };
        }
        return session;
      });
      saveSessions(newSessions);
      return newSessions;
    });
  }, [saveSessions]);

  // Update session messages
  const updateSessionMessages = useCallback((sessionId: string, newMessages: ChatMessage[]) => {
    updateSession(sessionId, {
      messages: newMessages,
      // Auto-generate title if it's still "新对话" and there are messages
      title: sessions.find(s => s.id === sessionId)?.title === '新对话' && newMessages.length > 0
        ? generateSessionTitle(newMessages[0].content)
        : undefined,
    });
  }, [updateSession, sessions]);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const newSessions = prev.filter(s => s.id !== sessionId);
      saveSessions(newSessions);
      return newSessions;
    });

    // If deleting current session, switch to latest session or clear
    if (currentSession === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        const latestSession = remainingSessions[0];
        setCurrentSession(latestSession.id);
        setMessages(latestSession.messages);
        saveCurrentSessionId(latestSession.id);
      } else {
        setCurrentSession('');
        setMessages([]);
        removeFromLocalStorage(CHAT_STORAGE_KEYS.CURRENT_SESSION);
      }
    }
  }, [currentSession, sessions, saveSessions, saveCurrentSessionId]);

  // Select session
  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setMessages(session.messages);
      saveCurrentSessionId(sessionId);
    }
  }, [sessions, saveCurrentSessionId]);

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSession('');
    setMessages([]);
    removeFromLocalStorage(CHAT_STORAGE_KEYS.SESSIONS);
    removeFromLocalStorage(CHAT_STORAGE_KEYS.CURRENT_SESSION);
  }, []);

  // Pin/unpin session
  const toggleSessionPin = useCallback((sessionId: string, isPinned: boolean) => {
    updateSession(sessionId, { isPinned });
  }, [updateSession]);

  return {
    // State
    sessions,
    currentSession,
    messages,
    inputValue,
    attachedFiles,
    config,
    uiState,

    // Setters
    setMessages,
    setInputValue,
    setAttachedFiles,
    updateConfig,
    updateUIState,

    // Session actions
    createNewSession,
    addSession,
    updateSession,
    updateSessionMessages,
    deleteSession,
    selectSession,
    clearAllSessions,
    toggleSessionPin,
  };
};
