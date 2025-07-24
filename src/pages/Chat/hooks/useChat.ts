import { useCallback, useRef, useEffect } from 'react';
import { message as antdMessage } from 'antd';
import { useChatState } from './useChatState';
import { useChatAPI } from './useChatAPI';
import { ChatMessage, FileAttachment } from '../types';
import { generateMessageId, generateAttachmentId, copyToClipboard, scrollToBottom } from '../utils';
import { MESSAGE_ROLES } from '../constants';

export const useChat = () => {
  const {
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
  } = useChatState();

  // Scroll container ref
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  
  // Keep track of latest messages for stream completion
  const latestMessagesRef = useRef<ChatMessage[]>(messages);
  
  // Update ref when messages change
  useEffect(() => {
    latestMessagesRef.current = messages;
  }, [messages]);

  // Chat API hooks
  const chatAPI = useChatAPI({
    config,
    onStreamChunk: (content) => {
      updateUIState({ streamingMessage: content });
      scrollToBottom(messagesScrollRef.current);
    },
    onStreamComplete: (fullContent, responseTime) => {
      handleStreamComplete(fullContent, responseTime, latestMessagesRef.current);
    },
    onStreamError: (error) => {
      handleChatError(error);
    },
  });

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(messagesScrollRef.current), 100);
    }
  }, [messages]);

  // Auto scroll during streaming
  useEffect(() => {
    if (uiState.isStreaming && uiState.streamingMessage) {
      setTimeout(() => scrollToBottom(messagesScrollRef.current), 50);
    }
  }, [uiState.streamingMessage, uiState.isStreaming]);

  // Auto scroll when loading starts
  useEffect(() => {
    if (uiState.isLoading) {
      setTimeout(() => scrollToBottom(messagesScrollRef.current), 100);
    }
  }, [uiState.isLoading]);

  // Handle stream completion
  const handleStreamComplete = useCallback((fullContent: string, responseTime: number, currentMessages?: ChatMessage[]) => {
    const assistantMessage: ChatMessage = {
      id: generateMessageId(MESSAGE_ROLES.ASSISTANT),
      role: MESSAGE_ROLES.ASSISTANT,
      content: fullContent,
      timestamp: new Date(),
      thinking: config.thinkingMode,
      streaming: true,
      responseTime,
    };

    // 使用传入的消息列表或当前状态中的消息列表
    const baseMessages = currentMessages || messages;
    const finalMessages = [...baseMessages, assistantMessage];
    setMessages(finalMessages);
    
    if (currentSession) {
      updateSessionMessages(currentSession, finalMessages);
    }
    
    updateUIState({
      isStreaming: false,
      streamingMessage: '',
      isLoading: false,
    });
  }, [messages, currentSession, config.thinkingMode, setMessages, updateSessionMessages, updateUIState]);



  // Handle chat errors
  const handleChatError = useCallback((error: Error) => {
    console.error('Chat error:', error);
    antdMessage.error(`消息发送失败：${error.message}`);

    // Add friendly error message to conversation
    const errorMessage: ChatMessage = {
      id: generateMessageId(MESSAGE_ROLES.ASSISTANT),
      role: MESSAGE_ROLES.ASSISTANT,
      content: '抱歉，当前程序发生故障，我们正在马不停蹄修复中...请稍后再试或重新发送消息 🔧',
      timestamp: new Date(),
      thinking: false,
      streaming: false,
    };

    // 使用最新的消息状态来构建错误消息列表
    const currentMessages = latestMessagesRef.current;
    const finalMessages = [...currentMessages, errorMessage];
    setMessages(finalMessages);
    
    if (currentSession) {
      updateSessionMessages(currentSession, finalMessages);
    }

    updateUIState({
      isLoading: false,
      isStreaming: false,
      streamingMessage: '',
    });
  }, [currentSession, setMessages, updateSessionMessages, updateUIState]);

  // Handle model selection change
  const handleModelChange = useCallback((modelId: string, modelType?: string, isStream?: boolean) => {
    updateConfig({
      selectedModel: modelId,
      selectedModelType: modelType || '',
      selectedModelIsStream: isStream ?? true,
    });
  }, [updateConfig]);

  // Handle file upload
  const handleFileUpload = useCallback((files: File[]) => {
    setAttachedFiles(prev => [...prev, ...files]);
    const fileNames = files.map(f => f.name).join(', ');
    antdMessage.success(`已添加 ${files.length} 个文件: ${fileNames}`);
  }, [setAttachedFiles]);

  // Handle file removal
  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, [setAttachedFiles]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    // Validation
    if (!inputValue.trim() && attachedFiles.length === 0) return;
    if (!config.selectedModel) {
      antdMessage.error('请先选择一个模型');
      return;
    }

    // Create or use existing session
    let activeSessionId = currentSession;
    if (!activeSessionId) {
      const newSession = createNewSession();
      addSession(newSession);
      selectSession(newSession.id);
      activeSessionId = newSession.id;
    }

    // Create attachments
    const attachments: FileAttachment[] = attachedFiles.map(file => ({
      id: generateAttachmentId(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }));

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(MESSAGE_ROLES.USER),
      role: MESSAGE_ROLES.USER,
      content: inputValue,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateSessionMessages(activeSessionId, newMessages);
    
    // 立即更新ref以确保流式完成时能获取到最新消息
    latestMessagesRef.current = newMessages;

    // Clear input and files
    setInputValue('');
    setAttachedFiles([]);

    // Start loading
    updateUIState({ isLoading: true });

    // Show thinking state after short delay
    setTimeout(() => {
      updateUIState({
        isLoading: false,
        isStreaming: true,
        streamingMessage: '',
      });
    }, 800);

    // Send API request
    try {
      await chatAPI.sendMessage(newMessages);
    } catch (error) {
      handleChatError(error as Error);
    }
  }, [
    inputValue,
    attachedFiles,
    config.selectedModel,
    currentSession,
    messages,
    createNewSession,
    addSession,
    selectSession,
    setMessages,
    updateSessionMessages,
    setInputValue,
    setAttachedFiles,
    updateUIState,
    chatAPI,
  ]);

  // Handle edit user message
  const handleEditUserMessage = useCallback(async (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Update message content
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: newContent,
      timestamp: new Date(),
    };

    // Keep only messages up to the edited one
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    setMessages(messagesToKeep);
    
    // 立即更新ref以确保流式完成时能获取到最新消息
    latestMessagesRef.current = messagesToKeep;

    if (currentSession) {
      updateSessionMessages(currentSession, messagesToKeep);
    }

    // Re-send request
    updateUIState({ isLoading: true });

    setTimeout(() => {
      updateUIState({
        isLoading: false,
        isStreaming: true,
        streamingMessage: '',
      });
    }, 800);

    try {
      await chatAPI.sendMessage(messagesToKeep);
    } catch (error) {
      handleChatError(error as Error);
    }
  }, [messages, currentSession, setMessages, updateSessionMessages, updateUIState, chatAPI]);

  // Handle regenerate response
  const handleRegenerateResponse = useCallback(async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Get messages before the AI response
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);
    
    // 立即更新ref以确保流式完成时能获取到最新消息
    latestMessagesRef.current = messagesToKeep;

    if (currentSession) {
      updateSessionMessages(currentSession, messagesToKeep);
    }

    // Re-send request
    updateUIState({ isLoading: true });

    setTimeout(() => {
      updateUIState({
        isLoading: false,
        isStreaming: true,
        streamingMessage: '',
      });
    }, 800);

    try {
      await chatAPI.sendMessage(messagesToKeep);
    } catch (error) {
      handleChatError(error as Error);
    }
  }, [messages, currentSession, setMessages, updateSessionMessages, updateUIState, chatAPI]);

  // Handle copy message
  const handleCopyMessage = useCallback(async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      antdMessage.success('消息已复制到剪贴板');
    } else {
      antdMessage.error('复制失败，请手动复制');
    }
  }, []);

  // Handle new chat
  const handleCreateNewChat = useCallback(() => {
    const newSession = createNewSession();
    addSession(newSession);
    selectSession(newSession.id);
  }, [createNewSession, addSession, selectSession]);

  return {
    // State
    sessions,
    currentSession,
    messages,
    inputValue,
    attachedFiles,
    config,
    uiState,
    messagesScrollRef,

    // Setters
    setInputValue,
    updateConfig,
    updateUIState,

    // Session handlers
    handleCreateNewChat,
    selectSession,
    deleteSession,
    updateSession,
    toggleSessionPin,
    clearAllSessions,

    // Message handlers
    handleSendMessage,
    handleEditUserMessage,
    handleRegenerateResponse,
    handleCopyMessage,

    // File handlers
    handleFileUpload,
    handleRemoveFile,

    // Model handlers
    handleModelChange,
  };
};
