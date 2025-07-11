import React from "react";
import {
  Layout,
  Button,
  Typography,
  Modal,
  Dropdown,
  Tooltip,
  Divider,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  ShareAltOutlined,
  MenuOutlined,
  UserOutlined,
  DeleteOutlined,
  MoreOutlined,
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  BugOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { Sender } from "@ant-design/x";
import { useUserInfo } from "@/store/userStore";
import { useChat } from "./hooks/useChat";

// Import components - using correct paths based on current structure
import Canvas from "./components/Canvas";
import ModelSelector from "./components/ModelSelector";
import AttachmentUpload from "./components/AttachmentUpload";
import ChatHistory from "./components/ChatHistory";
import ThinkingBubble from "./components/ThinkingBubble";
import StreamingBubbleSelector from "./components/StreamingBubbleSelector";
import UserMessageBubble from "./components/UserMessageBubble";
import AssistantMessageBubble from "./components/AssistantMessageBubble";
import FileAttachment from "./components/FileAttachment";

import "./index.css";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const ChatPage: React.FC = () => {
  const userInfo = useUserInfo();

  // Use the main chat hook
  const {
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
  } = useChat();

  // User menu items
  const getUserMenuItems = (): MenuProps["items"] => [
    {
      key: "profile",
      label: (
        <div className="flex items-center gap-2">
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
    { type: "divider" },
    {
      key: "settings",
      label: "设置",
      icon: <SettingOutlined />,
    },
    {
      key: "community",
      label: "社区",
      icon: <TeamOutlined />,
    },
    {
      key: "help",
      label: "帮助中心",
      icon: <QuestionCircleOutlined />,
    },
    {
      key: "feedback",
      label: "报告问题",
      icon: <BugOutlined />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  // Sidebar collapsed content
  const renderCollapsedSidebar = () => (
    <div className="flex flex-col h-full justify-between items-center py-4">
      <div className="flex flex-col items-center gap-4">
        <Tooltip title="新建对话" placement="right">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={handleCreateNewChat}
            size="large"
            className="sidebar-collapsed-btn"
          />
        </Tooltip>
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
      <div className="flex flex-col items-center">
        <Dropdown
          menu={{ items: getUserMenuItems() }}
          trigger={["click"]}
          placement="topRight"
        >
          <Tooltip title="用户菜单" placement="right">
            <Button
              type="text"
              shape="circle"
              icon={<UserOutlined />}
              size="large"
              className="sidebar-collapsed-btn"
            />
          </Tooltip>
        </Dropdown>
      </div>
    </div>
  );

  // Sidebar expanded content
  const renderExpandedSidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <div className="new-chat-section">
          <Button
            type="primary"
            block
            icon={<PlusOutlined />}
            onClick={handleCreateNewChat}
            size="large"
          >
            新建对话
          </Button>
        </div>
        <div className="chat-history-section">
          <ChatHistory
            sessions={sessions}
            currentSession={currentSession}
            onSelectSession={selectSession}
            onDeleteSession={deleteSession}
            onUpdateSession={updateSession}
            onPinSession={toggleSessionPin}
          />
        </div>
      </div>
      <div className="user-info-section-bottom">
        <Divider className="my-2" />
        <Dropdown
          menu={{ items: getUserMenuItems() }}
          trigger={["click"]}
          placement="topRight"
        >
          <div className="user-avatar-container cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              {(userInfo?.userName || userInfo?.username || "用户")
                .charAt(0)
                .toUpperCase()}
            </div>
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

  // Welcome section when no messages
  const renderWelcomeSection = () => (
    <div className="chat-empty-state">
      <div className="chat-input-centered">
        <div className="chat-brand-header">
          <div className="brand-icon">
            <div className="brain-icon">🧠</div>
          </div>
          <h1 className="brand-title">luminaBrain</h1>
        </div>
        {renderInputSection()}
      </div>
    </div>
  );

  // Input section component
  const renderInputSection = () => (
    <div className="chat-input-container">
      <div
        className={`chat-interaction-panel ${
          uiState.isLoading ? "loading" : ""
        }`}
      >
        <div className="chat-input-section">
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
            placeholder="输入消息开始对话... (Shift + Enter 换行)"
            loading={uiState.isLoading}
            disabled={uiState.isLoading}
            className="chat-input-enhanced"
            actions={false}
          />
        </div>
        <div className="chat-controls-section">
          <div className="chat-tools-group">
            <div className="chat-attachment-upload">
              <AttachmentUpload
                onUpload={handleFileUpload}
                className="chat-attachment-btn"
              />
            </div>
            <Tooltip
              title="启用思考模式，AI会显示思考过程"
              className="chat-tool-tooltip"
            >
              <div
                className={`chat-thinking-toggle ${
                  config.thinkingMode ? "active" : ""
                }`}
                onClick={() =>
                  updateConfig({ thinkingMode: !config.thinkingMode })
                }
              >
                <BulbOutlined className="chat-thinking-icon" />
                <Text className="chat-thinking-text">Think</Text>
              </div>
            </Tooltip>
          </div>
          <div className="chat-action-group">
            <div className="chat-model-selector">
              <ModelSelector
                value={config.selectedModel}
                onChange={handleModelChange}
              />
            </div>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={
                !inputValue.trim() || uiState.isLoading || !config.selectedModel
              }
              loading={uiState.isLoading}
              className="chat-send-button"
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Messages section
  const renderMessagesSection = () => (
    <div className="chat-messages-container">
      <div className="chat-messages-scroll" ref={messagesScrollRef}>
        <div className="chat-messages-content">
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <UserMessageBubble
                  key={message.id}
                  content={message.content}
                  attachments={message.attachments}
                  onEdit={(newContent: string) =>
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
                  onRegenerate={() => handleRegenerateResponse(message.id)}
                  onCopy={handleCopyMessage}
                  onShare={(content) => {
                    navigator.clipboard.writeText(content);
                  }}
                  onLike={() => console.log("Liked:", message.id)}
                  onDislike={() => console.log("Disliked:", message.id)}
                  className="fade-in"
                />
              );
            }

            return null;
          })}

          {uiState.isStreaming && uiState.streamingMessage && (
            <StreamingBubbleSelector
              content={uiState.streamingMessage}
              thinking={config.thinkingMode}
              isStreaming={uiState.isStreaming}
              useSSE={config.selectedModelIsStream}
              onComplete={() => console.log("Streaming completed")}
            />
          )}

          {uiState.isLoading && !uiState.isStreaming && (
            <ThinkingBubble thinkingMode={config.thinkingMode} />
          )}
        </div>
      </div>
      <div className="chat-input-area">{renderInputSection()}</div>
    </div>
  );

  return (
    <div className="chat-page">
      <Layout className="h-full">
        {/* Sidebar */}
        <Sider
          width={240}
          collapsed={uiState.sidebarCollapsed}
          collapsible
          trigger={null}
          className="chat-sidebar"
          collapsedWidth={50}
          theme="light"
          breakpoint="md"
          onBreakpoint={(broken: boolean) => {
            updateUIState({ sidebarCollapsed: broken });
          }}
        >
          {uiState.sidebarCollapsed
            ? renderCollapsedSidebar()
            : renderExpandedSidebar()}
        </Sider>

        {/* Main Content */}
        <Content className="chat-main-content">
          {/* Toolbar */}
          <div className="chat-toolbar">
            <div className="chat-toolbar-left">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() =>
                  updateUIState({ sidebarCollapsed: !uiState.sidebarCollapsed })
                }
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
                onClick={() => updateUIState({ shareModalVisible: true })}
                disabled={messages.length === 0}
              >
                分享
              </Button>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: "清空所有对话",
                    content: "确定要删除所有对话记录吗？此操作不可撤销。",
                    okText: "清空",
                    okType: "danger",
                    cancelText: "取消",
                    onOk: clearAllSessions,
                  });
                }}
                disabled={sessions.length === 0}
                danger
              >
                清空
              </Button>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={handleCreateNewChat}
              >
                新建
              </Button>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="chat-conversation-area">
            {messages.length === 0
              ? renderWelcomeSection()
              : renderMessagesSection()}
            {uiState.showCanvas && (
              <div className="chat-canvas">
                <Canvas
                  content=""
                  onClose={() => updateUIState({ showCanvas: false })}
                />
              </div>
            )}
          </div>
        </Content>
      </Layout>

      {/* Share Modal */}
      <Modal
        title="分享对话"
        open={uiState.shareModalVisible}
        onCancel={() => updateUIState({ shareModalVisible: false })}
        footer={[
          <Button
            key="cancel"
            onClick={() => updateUIState({ shareModalVisible: false })}
          >
            取消
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              const shareUrl = `${window.location.href}?share=${currentSession}`;
              navigator.clipboard.writeText(shareUrl);
              updateUIState({ shareModalVisible: false });
            }}
          >
            复制链接
          </Button>,
        ]}
      >
        <div className="share-modal-content">
          <p>分享此对话，其他人可以查看对话内容但无法继续对话。</p>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
