import React, { useState, useCallback, useEffect } from 'react';
import {
  Layout,
  Button,
  Input,
  Avatar,
  Typography,
  message,
  Modal,
  Dropdown,
  Tooltip,
  Divider,
  type MenuProps,
} from 'antd';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import ShareAltOutlined from '@ant-design/icons/ShareAltOutlined';
import MenuOutlined from '@ant-design/icons/MenuOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import RobotOutlined from '@ant-design/icons/RobotOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import CodeOutlined from '@ant-design/icons/CodeOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import BugOutlined from '@ant-design/icons/BugOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import { Bubble, Prompts, Sender, Welcome } from '@ant-design/x';
import { useUserInfo } from '@/store/userStore';
import Canvas from './components/Canvas';
import ModelSelector from './components/ModelSelector';
import AttachmentUpload from './components/AttachmentUpload';
import ChatHistory from './components/ChatHistory';
import StaticStreamingBubble from './components/StaticStreamingBubble';
import ThinkingBubble from './components/ThinkingBubble';
import LiveStreamingBubble from './components/LiveStreamingBubble';
import { chatService, type ChatMessage as APIChatMessage } from '@/api/services/chatService';
import './index.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// 消息类型定义
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  thinking?: boolean;
  streaming?: boolean; // 新增：标识是否是流式生成的消息
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

// 模型选项
const modelOptions = [
  { label: 'GPT-4o', value: 'gpt-4o', provider: 'OpenAI' },
  { label: 'GPT-4', value: 'gpt-4', provider: 'OpenAI' },
  { label: 'Claude-3.5 Sonnet', value: 'claude-3.5-sonnet', provider: 'Anthropic' },
  { label: 'Gemini Pro', value: 'gemini-pro', provider: 'Google' },
];

const ChatPage: React.FC = () => {
  const userInfo = useUserInfo();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasContent, setCanvasContent] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // 从localStorage加载聊天记录
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat-sessions');
    const savedCurrentSession = localStorage.getItem('chat-current-session');

    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(parsedSessions);

        if (savedCurrentSession && parsedSessions.some((s: ChatSession) => s.id === savedCurrentSession)) {
          setCurrentSession(savedCurrentSession);
          const currentSessionData = parsedSessions.find((s: ChatSession) => s.id === savedCurrentSession);
          if (currentSessionData) {
            setMessages(currentSessionData.messages);
          }
        }
      } catch (error) {
        console.error('Failed to load chat sessions from localStorage:', error);
      }
    }
  }, []);

  // 保存聊天记录到localStorage
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    try {
      localStorage.setItem('chat-sessions', JSON.stringify(newSessions));
    } catch (error) {
      console.error('Failed to save chat sessions to localStorage:', error);
    }
  }, []);

  // 保存当前会话ID
  const saveCurrentSession = useCallback((sessionId: string) => {
    try {
      localStorage.setItem('chat-current-session', sessionId);
    } catch (error) {
      console.error('Failed to save current session to localStorage:', error);
    }
  }, []);

  // 更新会话的消息
  const updateSessionMessages = useCallback((sessionId: string, newMessages: ChatMessage[]) => {
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            messages: newMessages,
            updatedAt: new Date(),
            // 如果是新消息且会话标题还是"新对话"，则自动生成标题
            title: session.title === '新对话' && newMessages.length > 0
              ? newMessages[0].content.slice(0, 20) + (newMessages[0].content.length > 20 ? '...' : '')
              : session.title
          };
        }
        return session;
      });
      saveSessions(updatedSessions);
      return updatedSessions;
    });
  }, [saveSessions]);

  // 创建新对话
  const createNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '新对话',
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
  const selectSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(sessionId);
      setMessages(session.messages);
      saveCurrentSession(sessionId);
    }
  }, [sessions, saveCurrentSession]);

  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;

    // 如果没有当前会话，先创建一个
    let activeSessionId = currentSession;
    if (!activeSessionId) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: '新对话',
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

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateSessionMessages(activeSessionId, newMessages);

    setInputValue('');
    setIsLoading(true);

    try {
      // 转换消息格式为API格式
      const apiMessages: APIChatMessage[] = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      let fullResponse = '';

      // 显示思考状态
      setTimeout(() => {
        setIsLoading(false);
        setIsStreaming(true);
        setStreamingMessage(''); // 重置流式消息
      }, 800);

      // 调用流式API
      await chatService.simulateStreamingResponse(
        {
          model: selectedModel,
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2048,
        },
        (chunk) => {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            // 直接设置累积的内容，不要每次都重新开始动画
            setStreamingMessage(fullResponse);
          }
        },
        () => {
          // 流式输出完成
          const assistantMessage: ChatMessage = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
            thinking: thinkingMode,
            streaming: true,
          };

          const finalMessages = [...newMessages, assistantMessage];
          setMessages(finalMessages);
          updateSessionMessages(activeSessionId, finalMessages);
          setIsStreaming(false);
          setStreamingMessage('');
        },
        (error) => {
          console.error('Chat error:', error);
          message.error('消息发送失败，请重试');
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessage('');
        }
      );
    } catch (error) {
      console.error('Send message error:', error);
      message.error('消息发送失败，请重试');
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [inputValue, selectedModel, thinkingMode, currentSession, sessions, messages, updateSessionMessages, saveSessions, saveCurrentSession]);

  // 更新会话信息
  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
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
  }, [saveSessions]);

  // 删除对话
  const handleDeleteSession = useCallback((sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
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
        setCurrentSession('');
        setMessages([]);
        localStorage.removeItem('chat-current-session');
      }
    }
  }, [currentSession, sessions, saveSessions, saveCurrentSession]);

  // 批量删除会话
  const handleDeleteAllSessions = useCallback(() => {
    Modal.confirm({
      title: '清空所有对话',
      icon: <DeleteOutlined />,
      content: '确定要删除所有对话记录吗？此操作不可撤销。',
      okText: '清空',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        setSessions([]);
        setCurrentSession('');
        setMessages([]);
        localStorage.removeItem('chat-sessions');
        localStorage.removeItem('chat-current-session');
        message.success('所有对话已清空');
      },
    });
  }, []);

  // 判断是否显示欢迎界面
  const shouldShowWelcome = () => {
    // 没有会话或者当前会话没有消息时显示欢迎界面
    return sessions.length === 0 || (!currentSession) || messages.length === 0;
  };

  // 分享对话
  const handleShare = useCallback(() => {
    setShareModalVisible(true);
  }, []);

  // 显示代码画布
  const handleShowCanvas = useCallback((content: string) => {
    setCanvasContent(content);
    setShowCanvas(true);
  }, []);

  // 文件上传处理
  const handleFileUpload = useCallback((file: File) => {
    message.success(`文件 ${file.name} 上传成功`);
    return false; // 阻止自动上传
  }, []);

  // 复制消息内容
  const handleCopyMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success('消息已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  }, []);

  // 删除单条消息
  const handleDeleteMessage = useCallback((messageId: string) => {
    Modal.confirm({
      title: '删除消息',
      icon: <DeleteOutlined />,
      content: '确定要删除这条消息吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        // 从当前消息列表中移除指定消息
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        setMessages(updatedMessages);

        // 如果有当前会话，同步更新会话数据
        if (currentSession) {
          updateSessionMessages(currentSession, updatedMessages);
        }

        message.success('消息已删除');
      },
    });
  }, [messages, currentSession, updateSessionMessages]);

  // 置顶/取消置顶会话
  const handlePinSession = useCallback((sessionId: string, isPinned: boolean) => {
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => {
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
  }, [saveSessions]);

  // 用户头像下拉菜单
  const getUserMenuItems = (): MenuProps['items'] => [
    {
      key: 'profile',
      label: (
        <div className="flex items-center gap-2">
          <Avatar size={24} icon={<UserOutlined />} src={userInfo?.avatar} />
          <div className="flex flex-col">
            <span className="font-medium">{userInfo?.username || '用户'}</span>
            <span className="text-xs text-gray-500">{userInfo?.email}</span>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
      onClick: () => {
        message.info('设置功能开发中...');
      },
    },
    {
      key: 'community',
      label: '社区',
      icon: <TeamOutlined />,
      onClick: () => {
        message.info('社区功能开发中...');
      },
    },
    {
      key: 'help',
      label: '帮助中心',
      icon: <QuestionCircleOutlined />,
      onClick: () => {
        message.info('帮助中心开发中...');
      },
    },
    {
      key: 'feedback',
      label: '报告问题',
      icon: <BugOutlined />,
      onClick: () => {
        message.info('问题反馈功能开发中...');
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '退出登录',
          content: '确定要退出登录吗？',
          okText: '确定',
          cancelText: '取消',
          onOk() {
            message.success('已退出登录');
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
          trigger={['click']}
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
          trigger={['click']}
          placement="topRight"
        >
          <div className="user-avatar-container cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              src={userInfo?.avatar}
            />
            <div className="user-details">
              <div className="user-name">{userInfo?.username || '用户'}</div>
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
    return sidebarCollapsed ? renderCollapsedSidebar() : renderExpandedSidebar();
  };

  // 对话区域消息项菜单
  const getMessageMenuItems = (message: ChatMessage): MenuProps['items'] => [
    {
      key: 'copy',
      label: '复制',
      icon: <EditOutlined />,
      onClick: () => handleCopyMessage(message.content),
    },
    ...(message.role === 'assistant' ? [
      {
        key: 'canvas',
        label: '在画布中查看',
        icon: <CodeOutlined />,
        onClick: () => handleShowCanvas(message.content),
      }
    ] : []),
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteMessage(message.id),
    },
  ];

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
                {sessions.find(s => s.id === currentSession)?.title || 'AI 助手'}
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
            <div className="chat-messages-container">
              {/* 消息列表 */}
              <div className="chat-messages-scroll">
                {shouldShowWelcome() ? (
                  <div className="chat-welcome">
                    <Welcome
                      variant="filled"
                      icon={<RobotOutlined />}
                      title="欢迎使用 AI 助手"
                      description="我是您的智能助手，可以帮助您解答问题、生成内容、编写代码等。请开始我们的对话吧！"
                      extra={
                        <Prompts
                          title="您可以尝试问我："
                          items={[
                            { key: '1', label: '帮我写一个 React 组件' },
                            { key: '2', label: '解释什么是人工智能' },
                            { key: '3', label: '推荐一些学习资源' },
                            { key: '4', label: '分析这段代码的功能' },
                          ]}
                          onItemClick={(item) => setInputValue(String(item.data.label))}
                        />
                      }
                    />
                  </div>
                ) : (
                  <div className="chat-messages-content">
                    {messages.map((message) => {
                      // 如果是流式生成的助手消息，使用StaticStreamingBubble
                      if (message.role === 'assistant' && message.streaming) {
                        return (
                          <StaticStreamingBubble
                            key={message.id}
                            content={message.content}
                            thinking={message.thinking}
                            timestamp={message.timestamp}
                            messageActions={getMessageMenuItems(message)}
                            className="fade-in"
                          />
                        );
                      }

                      // 其他消息使用原来的Bubble组件
                      return (
                        <div
                          key={message.id}
                          className={`message-bubble-container ${message.role} fade-in`}
                        >
                          <div className="message-bubble-wrapper">
                            <div className="message-bubble">
                              <Bubble
                                content={message.content}
                                avatar={{
                                  src: message.role === 'user' ? userInfo?.avatar : undefined,
                                  icon: message.role === 'user' ? <UserOutlined /> : <RobotOutlined />,
                                }}
                                variant={message.role === 'user' ? 'filled' : 'outlined'}
                                placement={message.role === 'user' ? 'end' : 'start'}
                              />
                              <div className="message-footer">
                                <Text type="secondary" className="message-time">
                                  {message.timestamp.toLocaleTimeString()}
                                </Text>
                                <div className="message-actions">
                                  <Dropdown
                                    menu={{ items: getMessageMenuItems(message) }}
                                    trigger={['click']}
                                    placement="bottomRight"
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<MoreOutlined />}
                                    />
                                  </Dropdown>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 流式输出消息 */}
                    {isStreaming && streamingMessage && (
                      <LiveStreamingBubble
                        content={streamingMessage}
                        thinking={thinkingMode}
                        onComplete={() => {
                          // 流式输出完成的回调处理
                          console.log('Streaming completed');
                        }}
                      />
                    )}

                    {/* 加载状态 - 使用自定义的思考组件 */}
                    {isLoading && !isStreaming && (
                      <ThinkingBubble thinkingMode={thinkingMode} />
                    )}
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="chat-input-area">
                <div className="chat-input-container">
                  {/* 主要交互面板 */}
                  <div className={`chat-interaction-panel ${isLoading ? 'loading' : ''}`}>
                    {/* 输入区域 */}
                    <div className="chat-input-section">
                      <Sender
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={handleSendMessage}
                        onFocus={() => { }}
                        onBlur={() => { }}
                        onKeyPress={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
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
                        <Tooltip title="启用思考模式，AI会显示思考过程" className="chat-tool-tooltip">
                          <div
                            className={`chat-thinking-toggle ${thinkingMode ? 'active' : ''}`}
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
                            onChange={setSelectedModel}
                            options={modelOptions}
                          />
                        </div>

                        {/* 发送按钮 */}
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
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

            {/* 代码/文档画布 */}
            {showCanvas && (
              <div className="chat-canvas">
                <Canvas
                  content={canvasContent}
                  onClose={() => setShowCanvas(false)}
                />
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
          <Button key="copy" type="primary" onClick={() => {
            navigator.clipboard.writeText(window.location.href + '?share=' + currentSession);
            message.success('分享链接已复制到剪贴板');
            setShareModalVisible(false);
          }}>
            复制链接
          </Button>,
        ]}
      >
        <div className="share-modal-content">
          <p>分享此对话，其他人可以查看对话内容但无法继续对话。</p>
          <div className="share-input-container">
            <Input
              value={window.location.href + '?share=' + currentSession}
              readOnly
              suffix={
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href + '?share=' + currentSession);
                    message.success('已复制');
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