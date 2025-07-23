import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Layout,
  Button,
  Input,
  Avatar,
  Typography,
  message as antdMessage,
  Modal,
  Dropdown,
  Tooltip,
  Divider,
  type MenuProps,
} from "antd";
import BulbOutlined from "@ant-design/icons/BulbOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import MenuOutlined from "@ant-design/icons/MenuOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import MoreOutlined from "@ant-design/icons/MoreOutlined";
import HistoryOutlined from "@ant-design/icons/HistoryOutlined";
import SettingOutlined from "@ant-design/icons/SettingOutlined";
import LogoutOutlined from "@ant-design/icons/LogoutOutlined";
import TeamOutlined from "@ant-design/icons/TeamOutlined";
import BugOutlined from "@ant-design/icons/BugOutlined";
import QuestionCircleOutlined from "@ant-design/icons/QuestionCircleOutlined";
import SendOutlined from "@ant-design/icons/SendOutlined";
import { Sender } from "@ant-design/x";
import { useUserInfo } from "@/store/userStore";
import Canvas from "./components/Canvas";
import ModelSelector from "./components/ModelSelector";
import AttachmentUpload from "./components/AttachmentUpload";
import ChatHistory from "./components/ChatHistory";
import ThinkingBubble from "./components/ThinkingBubble";
// import StreamingBubbleSelector from "./components/StreamingBubbleSelector"; // 已替换为 AssistantMessageBubble
import {
  chatService,
  type ChatMessage as APIChatMessage,
} from "@/api/services/chatService";
import UserMessageBubble from "./components/UserMessageBubble";
import AssistantMessageBubble from "./components/AssistantMessageBubble";
import FileAttachment from "./components/FileAttachment";
import "./index.css";
import type {
  GeneratePromptInput,
  OptimizationResult,
  RunPromptInput,
  StreamingContent,
} from "../prompt/types";


const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// 消息类型定义
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  thinking?: boolean;
  streaming?: boolean;
  responseTime?: number;
}

// 对话会话类型
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  isPinned?: boolean; // 新增置顶字段
}

const ChatPage: React.FC = () => {
  const userInfo = useUserInfo();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelType, setSelectedModelType] = useState<string>(""); // 新增：存储模型类型
  const [selectedModelIsStream, setSelectedModelIsStream] =
    useState<boolean>(true); // 新增：存储模型是否支持流式
  const [thinkingMode, setThinkingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // 新增：文件管理状态
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 添加滚动容器的引用
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部的函数
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesScrollRef.current) {
      const scrollElement = messagesScrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // 处理模型选择变化
  const handleModelChange = useCallback(
    (modelId: string, modelType?: string, isStream?: boolean) => {
      setSelectedModel(modelId);
      if (modelType) {
        setSelectedModelType(modelType);
      }
      if (typeof isStream === "boolean") {
        setSelectedModelIsStream(isStream);
      }
    },
    []
  );

  // 从localStorage加载聊天记录
  useEffect(() => {
    const savedSessions = localStorage.getItem("chat-sessions");
    const savedCurrentSession = localStorage.getItem("chat-current-session");

    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map(
          (session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          })
        );
        setSessions(parsedSessions);

        if (
          savedCurrentSession &&
          parsedSessions.some((s: ChatSession) => s.id === savedCurrentSession)
        ) {
          setCurrentSession(savedCurrentSession);
          const currentSessionData = parsedSessions.find(
            (s: ChatSession) => s.id === savedCurrentSession
          );
          if (currentSessionData) {
            setMessages(currentSessionData.messages);
          }
        }
      } catch (error) {
        console.error("Failed to load chat sessions from localStorage:", error);
      }
    }
  }, []);

  // 保存聊天记录到localStorage
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    try {
      localStorage.setItem("chat-sessions", JSON.stringify(newSessions));
    } catch (error) {
      console.error("Failed to save chat sessions to localStorage:", error);
    }
  }, []);

  // 保存当前会话ID
  const saveCurrentSession = useCallback((sessionId: string) => {
    try {
      localStorage.setItem("chat-current-session", sessionId);
    } catch (error) {
      console.error("Failed to save current session to localStorage:", error);
    }
  }, []);

  // 更新会话的消息
  const updateSessionMessages = useCallback(
    (sessionId: string, newMessages: ChatMessage[]) => {
      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              messages: newMessages,
              updatedAt: new Date(),
              // 如果是新消息且会话标题还是"新对话"，则自动生成标题
              title:
                session.title === "新对话" && newMessages.length > 0
                  ? newMessages[0].content.slice(0, 20) +
                  (newMessages[0].content.length > 20 ? "..." : "")
                  : session.title,
            };
          }
          return session;
        });
        saveSessions(updatedSessions);
        return updatedSessions;
      });
    },
    [saveSessions]
  );

  // 创建新对话
  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: "新对话",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
    };

    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSession(newSession.id);
    setMessages([]);

    saveSessions(updatedSessions);
    saveCurrentSession(newSession.id);
  }, [selectedModel, sessions, saveSessions, saveCurrentSession]);

  // 选择会话
  const selectSession = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSession(sessionId);
        setMessages(session.messages);
        saveCurrentSession(sessionId);
      }
    },
    [sessions, saveCurrentSession]
  );

  // 文件上传处理 - 修改为支持多文件
  const handleFileUpload = useCallback((files: File[]) => {
    // 添加新文件到附件列表
    setAttachedFiles((prev) => [...prev, ...files]);

    const fileNames = files.map((f) => f.name).join(", ");
    antdMessage.success(`已添加 ${files.length} 个文件: ${fileNames}`);
  }, []);

  // 移除文件附件
  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSendMessage = useCallback(async () => {
    // 校验：需要有输入内容或文件附件
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    // 校验：必须选择模型
    if (!selectedModel) {
      antdMessage.error("请先选择一个模型");
      return;
    }

    // 如果没有当前会话，先创建一个
    let activeSessionId = currentSession;
    if (!activeSessionId) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: "新对话",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: selectedModel,
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setCurrentSession(newSession.id);
      activeSessionId = newSession.id;

      saveSessions(updatedSessions);
      saveCurrentSession(newSession.id);
    }

    // 创建附件信息
    const attachments = attachedFiles.map((file) => ({
      id: `attachment_${Date.now()}_${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file), // 临时URL用于显示
      type: file.type,
      size: file.size,
    }));

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateSessionMessages(activeSessionId, newMessages);

    setInputValue("");
    setAttachedFiles([]); // 清空附件列表
    setIsLoading(true);

    try {
      // 转换消息格式为API格式
      const apiMessages: APIChatMessage[] = newMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = "";

      // 显示思考状态
      setTimeout(() => {
        setIsLoading(false);
        setIsStreaming(true);
        setStreamingMessage(""); // 重置流式消息
      }, 800);

      // 记录开始时间
      const startTime = Date.now();
      // 创建SSE连接
      abortControllerRef.current = new AbortController();
      // 根据模型的流式支持情况选择不同的API调用方式

      // 使用新的 SSE 流式API
      try {

        for await (const event of chatService.createStreamingChatCompletionSSE({
          model: selectedModel,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 8000,
          ...(selectedModelType && { chatType: selectedModelType }), // 添加chatType参数
        })) {
          // 检查是否已被取消
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          // 处理流式响应数据
          if (event.data) {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "error") {
                // 处理错误类型
                antdMessage.error(data.message || data.error || '聊天失败，请重试');
                break;
              } else if (data.type === "message") {
                if (data.message) {
                  fullResponse += data.message;
                  setStreamingMessage(fullResponse);
                }
              }

              // 检查是否完成
              if (data.done || event.event === 'done') {
                // 计算响应时间
                const endTime = Date.now();
                const responseTime = Number(
                  ((endTime - startTime) / 1000).toFixed(1)
                );
                const assistantMessage: ChatMessage = {
                  id: `msg_${Date.now()}_assistant`,
                  role: "assistant",
                  content: fullResponse,
                  timestamp: new Date(),
                  thinking: thinkingMode,
                  streaming: true,
                  responseTime: responseTime,
                };

                const finalMessages = [...newMessages, assistantMessage];
                setMessages(finalMessages);
                updateSessionMessages(activeSessionId, finalMessages);
                setIsStreaming(false);
                setStreamingMessage("");
                break;
              }
            } catch (e) {
              // 如果不是JSON格式，直接添加到结果中
              if (event.data !== '[DONE]') {
                fullResponse += event.data;
                setStreamingMessage(fullResponse);
              } else {
                // 完成时创建最终消息
                const endTime = Date.now();
                const responseTime = Number(
                  ((endTime - startTime) / 1000).toFixed(1)
                );
                const assistantMessage: ChatMessage = {
                  id: `msg_${Date.now()}_assistant`,
                  role: "assistant",
                  content: fullResponse,
                  timestamp: new Date(),
                  thinking: thinkingMode,
                  streaming: false,
                  responseTime: responseTime,
                };

                const finalMessages = [...newMessages, assistantMessage];
                setMessages(finalMessages);
                updateSessionMessages(activeSessionId, finalMessages);
                setIsStreaming(false);
                setStreamingMessage("");
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error("SSE Chat error:", error);
        antdMessage.error(`消息发送失败：${error instanceof Error ? error.message : "未知错误"}`);

        // 添加一条友好的系统错误消息到对话中
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: "assistant",
          content:
            "抱歉，当前程序发生故障，我们正在马不停蹄修复中...请稍后再试或重新发送消息 🔧",
          timestamp: new Date(),
          thinking: false,
          streaming: true,
        };

        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
        updateSessionMessages(activeSessionId, finalMessages);

        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage("");
      }

    } catch (error) {
      console.error("Send message error:", error);
      antdMessage.error("消息发送失败，请重试");
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage("");
    }
  }, [
    inputValue,
    attachedFiles,
    selectedModel,
    selectedModelType,
    selectedModelIsStream,
    thinkingMode,
    currentSession,
    sessions,
    messages,
    updateSessionMessages,
    saveSessions,
    saveCurrentSession,
  ]);

  // 编辑用户消息
  const handleEditUserMessage = useCallback(
    async (messageId: string, newContent: string) => {
      // 记录开始时间
      const startTime = Date.now();

      // 找到消息在列表中的位置
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      // 更新消息内容
      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newContent,
        timestamp: new Date(),
      };

      // 删除该消息之后的所有消息（包括AI回复）
      const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);

      setMessages(messagesToKeep); https://grok.com/files

      // 如果有当前会话，同步更新会话数据
      if (currentSession) {
        updateSessionMessages(currentSession, messagesToKeep);
      }

      // 重新发送请求
      setIsLoading(true);

      try {
        // 转换消息格式为API格式
        const apiMessages: APIChatMessage[] = messagesToKeep.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        let fullResponse = "";

        // 根据模型的流式支持情况选择不同的API调用方式
        // 显示思考状态
        setTimeout(() => {
          setIsLoading(false);
          setIsStreaming(true);
          setStreamingMessage("");
        }, 800);

        try {
          for await (const event of chatService.createStreamingChatCompletionSSE({
            model: selectedModel,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 8000,
            ...(selectedModelType && { chatType: selectedModelType }), // 添加chatType参数
          })) {
            // 检查是否已被取消
            if (abortControllerRef.current?.signal.aborted) {
              break;
            }

            // 处理流式响应数据
            if (event.data) {
              try {
                const data = JSON.parse(event.data);
                if (data.type === "error") {
                  // 处理错误类型
                  antdMessage.error(data.message || data.error || '聊天失败，请重试');
                  break;
                } else if (data.type === "message") {
                  if (data.message) {
                    fullResponse += data.message;
                    setStreamingMessage(fullResponse);
                  }
                }

                // 检查是否完成
                if (data.done || event.event === 'done') {
                  // 计算响应时间
                  const endTime = Date.now();
                  const responseTime = Number(
                    ((endTime - startTime) / 1000).toFixed(1)
                  );
                  const assistantMessage: ChatMessage = {
                    id: `msg_${Date.now()}_assistant`,
                    role: "assistant",
                    content: fullResponse,
                    timestamp: new Date(),
                    thinking: thinkingMode,
                    streaming: true,
                    responseTime: responseTime,
                  };

                  const finalMessages = [...messagesToKeep, assistantMessage];
                  setMessages(finalMessages);
                  if (currentSession) {
                    updateSessionMessages(currentSession, finalMessages);
                  }
                  setIsStreaming(false);
                  setStreamingMessage("");
                  break;
                }
              } catch (e) {
                // 如果不是JSON格式，直接添加到结果中
                if (event.data !== '[DONE]') {
                  fullResponse += event.data;
                  setStreamingMessage(fullResponse);
                } else {
                  // 完成时创建最终消息
                  const endTime = Date.now();
                  const responseTime = Number(
                    ((endTime - startTime) / 1000).toFixed(1)
                  );
                  const assistantMessage: ChatMessage = {
                    id: `msg_${Date.now()}_assistant`,
                    role: "assistant",
                    content: fullResponse,
                    timestamp: new Date(),
                    thinking: thinkingMode,
                    streaming: false,
                    responseTime: responseTime,
                  };

                  const finalMessages = [...messagesToKeep, assistantMessage];
                  setMessages(finalMessages);
                  if (currentSession) {
                    updateSessionMessages(currentSession, finalMessages);
                  }
                  setIsStreaming(false);
                  setStreamingMessage("");
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error("SSE Chat error:", error);
          antdMessage.error(`消息发送失败：${error instanceof Error ? error.message : "未知错误"}`);

          // 添加一条友好的系统错误消息到对话中
          const errorMessage: ChatMessage = {
            id: `msg_${Date.now()}_error`,
            role: "assistant",
            content:
              "抱歉，当前程序发生故障，我们正在马不停蹄修复中...请稍后再试或重新发送消息 🔧",
            timestamp: new Date(),
            thinking: false,
            streaming: true,
          };

          const finalMessages = [...messagesToKeep, errorMessage];
          setMessages(finalMessages);
          if (currentSession) {
            updateSessionMessages(currentSession, finalMessages);
          }
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessage("");
        }
      } catch (error) {
        console.error("Regenerate message error:", error);
        antdMessage.error("重新生成回复失败，请重试");
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage("");
      }
    },
    [
      messages,
      currentSession,
      selectedModel,
      selectedModelType,
      selectedModelIsStream,
      thinkingMode,
      updateSessionMessages,
    ]
  );

  // 处理重新生成AI回复
  const handleRegenerateResponse = useCallback(
    async (messageId: string) => {
      // 记录开始时间
      const startTime = Date.now();

      // 找到对应的AI消息
      const messageIndex = messages.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return;

      // 获取该AI消息之前的所有消息（包括用户消息）
      const messagesToKeep = messages.slice(0, messageIndex);

      setMessages(messagesToKeep);

      // 如果有当前会话，同步更新会话数据
      if (currentSession) {
        updateSessionMessages(currentSession, messagesToKeep);
      }

      // 重新发送请求
      setIsLoading(true);

      try {
        // 转换消息格式为API格式
        const apiMessages: APIChatMessage[] = messagesToKeep.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        let fullResponse = "";

        // 根据模型的流式支持情况选择不同的API调用方式

        // 显示思考状态
        setTimeout(() => {
          setIsLoading(false);
          setIsStreaming(true);
          setStreamingMessage("");
        }, 800);

        // 使用新的 SSE 流式API
        try {
          for await (const event of chatService.createStreamingChatCompletionSSE({
            model: selectedModel,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 8000,
            ...(selectedModelType && { chatType: selectedModelType }), // 添加chatType参数
          })) {
            // 检查是否已被取消
            if (abortControllerRef.current?.signal.aborted) {
              break;
            }
            // 处理流式响应数据
            if (event.data) {
              try {
                const data = JSON.parse(event.data);
                if (data.type === "error") {
                  // 处理错误类型
                  antdMessage.error(data.message || data.error || '聊天失败，请重试');
                  break;
                } else if (data.type === "message") {
                  if (data.message) {
                    fullResponse += data.message;
                    setStreamingMessage(fullResponse);
                  }
                }

                // 检查是否完成
                if (data.done || event.event === 'done') {
                  // 计算响应时间
                  const endTime = Date.now();
                  const responseTime = Number(
                    ((endTime - startTime) / 1000).toFixed(1)
                  );
                  const assistantMessage: ChatMessage = {
                    id: `msg_${Date.now()}_assistant`,
                    role: "assistant",
                    content: fullResponse,
                    timestamp: new Date(),
                    thinking: thinkingMode,
                    streaming: true,
                    responseTime: responseTime,
                  };

                  const finalMessages = [...messagesToKeep, assistantMessage];
                  setMessages(finalMessages);
                  if (currentSession) {
                    updateSessionMessages(currentSession, finalMessages);
                  }
                  setIsStreaming(false);
                  setStreamingMessage("");
                  break;
                }
              } catch (e) {
                // 如果不是JSON格式，直接添加到结果中
                if (event.data !== '[DONE]') {
                  fullResponse += event.data;
                  setStreamingMessage(fullResponse);
                } else {
                  // 完成时创建最终消息
                  const endTime = Date.now();
                  const responseTime = Number(
                    ((endTime - startTime) / 1000).toFixed(1)
                  );
                  const assistantMessage: ChatMessage = {
                    id: `msg_${Date.now()}_assistant`,
                    role: "assistant",
                    content: fullResponse,
                    timestamp: new Date(),
                    thinking: thinkingMode,
                    streaming: false,
                    responseTime: responseTime,
                  };

                  const finalMessages = [...messagesToKeep, assistantMessage];
                  setMessages(finalMessages);
                  if (currentSession) {
                    updateSessionMessages(currentSession, finalMessages);
                  }
                  setIsStreaming(false);
                  setStreamingMessage("");
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error("SSE Chat error:", error);
          antdMessage.error(`消息发送失败：${error instanceof Error ? error.message : "未知错误"}`);

          // 添加一条友好的系统错误消息到对话中
          const errorMessage: ChatMessage = {
            id: `msg_${Date.now()}_error`,
            role: "assistant",
            content:
              "抱歉，当前程序发生故障，我们正在马不停蹄修复中...请稍后再试或重新发送消息 🔧",
            timestamp: new Date(),
            thinking: false,
            streaming: true,
          };

          const finalMessages = [...messagesToKeep, errorMessage];
          setMessages(finalMessages);
          if (currentSession) {
            updateSessionMessages(currentSession, finalMessages);
          }
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessage("");
        }

      } catch (error) {
        console.error("Regenerate message error:", error);
        antdMessage.error("重新生成回复失败，请重试");
        setIsLoading(false);
        setIsStreaming(false);
        setStreamingMessage("");
      }
    },
    [
      messages,
      currentSession,
      selectedModel,
      selectedModelType,
      selectedModelIsStream,
      thinkingMode,
      updateSessionMessages,
    ]
  );

  // 更新会话信息
  const updateSession = useCallback(
    (sessionId: string, updates: Partial<ChatSession>) => {
      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              ...updates,
              updatedAt: new Date(),
            };
          }
          return session;
        });
        saveSessions(updatedSessions);
        return updatedSessions;
      });
    },
    [saveSessions]
  );

  // 删除对话
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);
      saveSessions(updatedSessions);

      if (currentSession === sessionId) {
        // 如果删除的是当前会话，切换到最新的会话或清空
        if (updatedSessions.length > 0) {
          const latestSession = updatedSessions[0];
          setCurrentSession(latestSession.id);
          setMessages(latestSession.messages);
          saveCurrentSession(latestSession.id);
        } else {
          setCurrentSession("");
          setMessages([]);
          localStorage.removeItem("chat-current-session");
        }
      }
    },
    [currentSession, sessions, saveSessions, saveCurrentSession]
  );

  // 批量删除会话
  const handleDeleteAllSessions = useCallback(() => {
    Modal.confirm({
      title: "清空所有对话",
      icon: <DeleteOutlined />,
      content: "确定要删除所有对话记录吗？此操作不可撤销。",
      okText: "清空",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        setSessions([]);
        setCurrentSession("");
        setMessages([]);
        localStorage.removeItem("chat-sessions");
        localStorage.removeItem("chat-current-session");
        antdMessage.success("所有对话已清空");
      },
    });
  }, []);

  // 分享对话
  const handleShare = useCallback(() => {
    setShareModalVisible(true);
  }, []);

  // 复制消息内容
  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      antdMessage.success("消息已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
      antdMessage.error("复制失败，请手动复制");
    }
  }, []);

  // 置顶/取消置顶会话
  const handlePinSession = useCallback(
    (sessionId: string, isPinned: boolean) => {
      setSessions((prevSessions) => {
        const updatedSessions = prevSessions.map((session) => {
          if (session.id === sessionId) {
            return {
              ...session,
              isPinned,
              updatedAt: new Date(),
            };
          }
          return session;
        });
        saveSessions(updatedSessions);
        return updatedSessions;
      });
    },
    [saveSessions]
  );

  // 用户头像下拉菜单
  const getUserMenuItems = (): MenuProps["items"] => [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2">
          <Avatar size={24} icon={<UserOutlined />} src={userInfo?.avatar} />
          <div className="flex flex-col">
            <span className="font-medium">
              {userInfo?.userName || userInfo?.username || "用户"}
            </span>
            <span className="text-xs text-gray-500">{userInfo?.email}</span>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "settings",
      label: "设置",
      icon: <SettingOutlined />,
      onClick: () => {
        antdMessage.info("设置功能开发中...");
      },
    },
    {
      key: "community",
      label: "社区",
      icon: <TeamOutlined />,
      onClick: () => {
        antdMessage.info("社区功能开发中...");
      },
    },
    {
      key: "help",
      label: "帮助中心",
      icon: <QuestionCircleOutlined />,
      onClick: () => {
        antdMessage.info("帮助中心开发中...");
      },
    },
    {
      key: "feedback",
      label: "报告问题",
      icon: <BugOutlined />,
      onClick: () => {
        antdMessage.info("问题反馈功能开发中...");
      },
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: "退出登录",
          content: "确定要退出登录吗？",
          okText: "确定",
          cancelText: "取消",
          onOk() {
            antdMessage.success("已退出登录");
            // 这里应该调用登出API和清理用户状态
          },
        });
      },
    },
  ];

  // 侧边栏折叠状态内容
  const renderCollapsedSidebar = () => (
    <div className="flex flex-col h-full justify-between items-center py-4">
      {/* 功能区域 */}
      <div className="flex flex-col items-center gap-4">
        {/* 新建对话图标 */}
        <Tooltip title="新建对话" placement="right">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={createNewChat}
            size="large"
            className="sidebar-collapsed-btn"
          />
        </Tooltip>

        {/* 历史记录图标 */}
        <Tooltip title="历史记录" placement="right">
          <Button
            type="text"
            shape="circle"
            icon={<HistoryOutlined />}
            size="large"
            className="sidebar-collapsed-btn"
          />
        </Tooltip>
      </div>

      {/* 用户区域 */}
      <div className="flex flex-col items-center">
        <Dropdown
          menu={{ items: getUserMenuItems() }}
          trigger={["click"]}
          placement="topRight"
        >
          <Tooltip title="用户菜单" placement="right">
            <Avatar
              size={36}
              icon={<UserOutlined />}
              src={userInfo?.avatar}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </Tooltip>
        </Dropdown>
      </div>
    </div>
  );

  // 侧边栏展开状态内容
  const renderExpandedSidebar = () => (
    <div className="flex flex-col h-full">
      {/* 功能区域 */}
      <div className="flex-1 flex flex-col">
        {/* 新建对话按钮 */}
        <div className="new-chat-section">
          <Button
            type="primary"
            block
            icon={<PlusOutlined />}
            onClick={createNewChat}
            size="large"
          >
            新建对话
          </Button>
        </div>

        {/* 对话历史 */}
        <div className="chat-history-section">
          <ChatHistory
            sessions={sessions}
            currentSession={currentSession}
            onSelectSession={selectSession}
            onDeleteSession={handleDeleteSession}
            onUpdateSession={updateSession}
            onPinSession={handlePinSession}
          />
        </div>
      </div>

      {/* 用户信息区域 */}
      <div className="user-info-section-bottom">
        <Divider className="my-2" />
        <Dropdown
          menu={{ items: getUserMenuItems() }}
          trigger={["click"]}
          placement="topRight"
        >
          <div className="user-avatar-container cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <Avatar size={40} icon={<UserOutlined />} src={userInfo?.avatar} />
            <div className="user-details">
              <div className="user-name">
                {userInfo?.userName || userInfo?.username || "用户"}
              </div>
              <div className="user-email">{userInfo?.email}</div>
            </div>
            <MoreOutlined className="text-gray-400" />
          </div>
        </Dropdown>
      </div>
    </div>
  );

  // 侧边栏内容
  const renderSidebar = () => {
    return sidebarCollapsed
      ? renderCollapsedSidebar()
      : renderExpandedSidebar();
  };

  // 监听消息变化并自动滚动
  useEffect(() => {
    // 当消息列表更新时自动滚动到底部
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // 监听流式消息变化并自动滚动
  useEffect(() => {
    // 当流式消息更新时也要滚动到底部
    if (isStreaming && streamingMessage) {
      scrollToBottom();
    }
  }, [streamingMessage, isStreaming, scrollToBottom]);

  // 监听加载状态变化并自动滚动
  useEffect(() => {
    // 当开始加载时也滚动到底部（显示思考气泡）
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom]);

  return (
    <div className="chat-page">
      <Layout className="h-full">
        {/* 侧边栏 */}
        <Sider
          width={240}
          collapsed={sidebarCollapsed}
          collapsible
          trigger={null}
          className="chat-sidebar"
          collapsedWidth={50}
          theme="light"
          breakpoint="md"
          onBreakpoint={(broken: boolean) => {
            setSidebarCollapsed(broken);
          }}
        >
          {renderSidebar()}
        </Sider>

        {/* 主内容区域 */}
        <Content className="chat-main-content">
          {/* 顶部工具栏 */}
          <div className="chat-toolbar">
            <div className="chat-toolbar-left">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                size="large"
              />
              <Title level={4} className="chat-title">
                {sessions.find((s) => s.id === currentSession)?.title ||
                  "AI 助手"}
              </Title>
            </div>

            <div className="chat-toolbar-right">
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                disabled={messages.length === 0}
              >
                分享
              </Button>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={handleDeleteAllSessions}
                disabled={sessions.length === 0}
                danger
              >
                清空
              </Button>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={createNewChat}
              >
                新建
              </Button>
            </div>
          </div>

          {/* 对话区域 */}
          <div className="chat-conversation-area">
            {/* 当没有消息时，输入区域居中显示 */}
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-input-centered">
                  {/* 品牌标识 */}
                  <div className="chat-brand-header">
                    <div className="brand-icon">
                      <div className="brain-icon">🧠</div>
                    </div>
                    <h1 className="brand-title">luminaBrain</h1>
                  </div>

                  <div className="chat-input-container">
                    {/* 主要交互面板 */}
                    <div
                      className={`chat-interaction-panel ${isLoading ? "loading" : ""
                        }`}
                    >
                      {/* 输入区域 */}
                      <div className="chat-input-section">
                        {/* 文件附件显示区域 */}
                        {attachedFiles.length > 0 && (
                          <div
                            className="file-attachments-container"
                            data-file-count={attachedFiles.length}
                          >
                            {attachedFiles.map((file, index) => (
                              <FileAttachment
                                key={`${file.name}-${index}`}
                                file={file}
                                onRemove={() => handleRemoveFile(index)}
                              />
                            ))}
                          </div>
                        )}

                        <Sender
                          value={inputValue}
                          onChange={setInputValue}
                          onSubmit={handleSendMessage}
                          onFocus={() => { }}
                          onBlur={() => { }}
                          placeholder="输入消息开始对话... (Shift + Enter 换行)"
                          loading={isLoading}
                          disabled={isLoading}
                          className="chat-input-enhanced"
                          actions={false} // 隐藏内置的发送按钮
                        />
                      </div>

                      {/* 控制面板 */}
                      <div className="chat-controls-section">
                        {/* 左侧工具组 */}
                        <div className="chat-tools-group">
                          {/* 文件上传 */}
                          <div className="chat-attachment-upload">
                            <AttachmentUpload
                              onUpload={handleFileUpload}
                              className="chat-attachment-btn"
                            />
                          </div>

                          {/* 思考模式 */}
                          <Tooltip
                            title="启用思考模式，AI会显示思考过程"
                            className="chat-tool-tooltip"
                          >
                            <div
                              className={`chat-thinking-toggle ${thinkingMode ? "active" : ""
                                }`}
                              onClick={() => setThinkingMode(!thinkingMode)}
                            >
                              <BulbOutlined className="chat-thinking-icon" />
                              <Text className="chat-thinking-text">Think</Text>
                            </div>
                          </Tooltip>
                        </div>

                        {/* 右侧控制组 */}
                        <div className="chat-action-group">
                          {/* 模型选择器 */}
                          <div className="chat-model-selector">
                            <ModelSelector
                              value={selectedModel}
                              onChange={handleModelChange}
                            />
                          </div>

                          {/* 发送按钮 */}
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            disabled={
                              !inputValue.trim() || isLoading || !selectedModel
                            }
                            loading={isLoading}
                            className="chat-send-button"
                          >
                            发送
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 有消息时的正常布局 */
              <div className="chat-messages-container">
                {/* 消息列表 */}
                <div className="chat-messages-scroll" ref={messagesScrollRef}>
                  <div className="chat-messages-content">
                    {messages.map((message) => {
                      // 用户消息使用新的UserMessageBubble组件
                      if (message.role === "user") {
                        return (
                          <UserMessageBubble
                            key={message.id}
                            content={message.content}
                            attachments={message.attachments}
                            onEdit={(newContent) =>
                              handleEditUserMessage(message.id, newContent)
                            }
                            onCopy={handleCopyMessage}
                            className="fade-in"
                          />
                        );
                      }

                      if (message.role === "assistant") {
                        return (
                          <AssistantMessageBubble
                            key={message.id}
                            content={message.content}
                            responseTime={message.responseTime}
                            thinking={message.thinking}
                            streaming={false} // 历史消息不是流式状态
                            streamingContent="" // 历史消息无流式内容
                            onRegenerate={() =>
                              handleRegenerateResponse(message.id)
                            }
                            onCopy={handleCopyMessage}
                            onShare={(content) => {
                              // 处理分享单条消息
                              navigator.clipboard.writeText(content);
                              antdMessage.success("消息内容已复制到剪贴板");
                            }}
                            onLike={() => {
                              console.log("用户点赞了消息:", message.id);
                            }}
                            onDislike={() => {
                              console.log("用户点踩了消息:", message.id);
                            }}
                            className="fade-in"
                          />
                        );
                      }

                      // 其他消息类型的后备渲染（理论上不会执行到）
                      return null;
                    })}

                    {/* 流式输出消息 */}
                    {isStreaming && streamingMessage && (
                      <AssistantMessageBubble
                        content="" // 流式时内容为空
                        thinking={thinkingMode}
                        streaming={true} // 正在流式输出
                        streamingContent={streamingMessage} // 流式内容
                        onRegenerate={() => {
                          // 流式时不允许重新生成
                          console.log("Cannot regenerate during streaming");
                        }}
                        onCopy={handleCopyMessage}
                        onShare={(content) => {
                          navigator.clipboard.writeText(content);
                          antdMessage.success("消息内容已复制到剪贴板");
                        }}
                        onLike={() => {
                          console.log("用户点赞了流式消息");
                        }}
                        onDislike={() => {
                          console.log("用户点踩了流式消息");
                        }}
                        className="fade-in streaming"
                      />
                    )}

                    {/* 加载状态 - 使用自定义的思考组件 */}
                    {isLoading && !isStreaming && (
                      <ThinkingBubble thinkingMode={thinkingMode} />
                    )}
                  </div>
                </div>

                {/* 输入区域 - 固定在底部 */}
                <div className="chat-input-area">
                  <div className="chat-input-container">
                    {/* 主要交互面板 */}
                    <div
                      className={`chat-interaction-panel ${isLoading ? "loading" : ""
                        }`}
                    >
                      {/* 输入区域 */}
                      <div className="chat-input-section">
                        {/* 文件附件显示区域 */}
                        {attachedFiles.length > 0 && (
                          <div
                            className="file-attachments-container"
                            data-file-count={attachedFiles.length}
                          >
                            {attachedFiles.map((file, index) => (
                              <FileAttachment
                                key={`${file.name}-${index}`}
                                file={file}
                                onRemove={() => handleRemoveFile(index)}
                              />
                            ))}
                          </div>
                        )}

                        <Sender
                          value={inputValue}
                          onChange={setInputValue}
                          onSubmit={handleSendMessage}
                          onFocus={() => { }}
                          onBlur={() => { }}
                          placeholder="输入消息... (Shift + Enter 换行)"
                          loading={isLoading}
                          disabled={isLoading}
                          className="chat-input-enhanced"
                          actions={false} // 隐藏内置的发送按钮
                        />
                      </div>

                      {/* 控制面板 */}
                      <div className="chat-controls-section">
                        {/* 左侧工具组 */}
                        <div className="chat-tools-group">
                          {/* 文件上传 */}
                          <div className="chat-attachment-upload">
                            <AttachmentUpload
                              onUpload={handleFileUpload}
                              className="chat-attachment-btn"
                            />
                          </div>

                          {/* 思考模式 */}
                          <Tooltip
                            title="启用思考模式，AI会显示思考过程"
                            className="chat-tool-tooltip"
                          >
                            <div
                              className={`chat-thinking-toggle ${thinkingMode ? "active" : ""
                                }`}
                              onClick={() => setThinkingMode(!thinkingMode)}
                            >
                              <BulbOutlined className="chat-thinking-icon" />
                              <Text className="chat-thinking-text">Think</Text>
                            </div>
                          </Tooltip>
                        </div>

                        {/* 右侧控制组 */}
                        <div className="chat-action-group">
                          {/* 模型选择器 */}
                          <div className="chat-model-selector">
                            <ModelSelector
                              value={selectedModel}
                              onChange={handleModelChange}
                            />
                          </div>

                          {/* 发送按钮 */}
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            disabled={
                              !inputValue.trim() || isLoading || !selectedModel
                            }
                            loading={isLoading}
                            className="chat-send-button"
                          >
                            发送
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 代码/文档画布 */}
            {showCanvas && (
              <div className="chat-canvas">
                <Canvas content="" onClose={() => setShowCanvas(false)} />
              </div>
            )}
          </div>
        </Content>
      </Layout>

      {/* 分享对话模态框 */}
      <Modal
        title="分享对话"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(
                window.location.href + "?share=" + currentSession
              );
              antdMessage.success("分享链接已复制到剪贴板");
              setShareModalVisible(false);
            }}
          >
            复制链接
          </Button>,
        ]}
      >
        <div className="share-modal-content">
          <p>分享此对话，其他人可以查看对话内容但无法继续对话。</p>
          <div className="share-input-container">
            <Input
              value={window.location.href + "?share=" + currentSession}
              readOnly
              suffix={
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.href + "?share=" + currentSession
                    );
                    antdMessage.success("已复制");
                  }}
                >
                  复制
                </Button>
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
