import React, { useState } from "react";
import {
  List,
  Typography,
  Button,
  Dropdown,
  Input,
  Modal,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  MessageOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  PushpinOutlined,
  PushpinFilled,
} from "@ant-design/icons";

const { Text } = Typography;
const { confirm } = Modal;

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  isPinned?: boolean; // 新增置顶字段
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSession: string;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateSession?: (sessionId: string, updates: Partial<ChatSession>) => void;
  onPinSession?: (sessionId: string, isPinned: boolean) => void; // 新增置顶回调
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onDeleteSession,
  onUpdateSession,
  onPinSession,
}) => {
  const [editingSession, setEditingSession] = useState<string>("");
  const [editTitle, setEditTitle] = useState("");

  const handleEdit = (session: ChatSession) => {
    setEditingSession(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editTitle.trim() && onUpdateSession) {
      onUpdateSession(sessionId, { title: editTitle.trim() });
      message.success("标题已更新");
    }
    setEditingSession("");
  };

  const handleDelete = (session: ChatSession) => {
    confirm({
      title: "删除对话",
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除对话"${session.title}"吗？此操作不可撤销。`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        onDeleteSession(session.id);
        message.success("对话已删除");
      },
    });
  };

  const handlePin = (session: ChatSession) => {
    const newPinnedState = !session.isPinned;
    if (onPinSession) {
      onPinSession(session.id, newPinnedState);
      message.success(newPinnedState ? "已置顶" : "已取消置顶");
    }
  };

  const getMenuItems = (session: ChatSession): MenuProps["items"] => [
    {
      key: "pin",
      label: session.isPinned ? "取消置顶" : "置顶",
      icon: session.isPinned ? <PushpinFilled /> : <PushpinOutlined />,
      onClick: () => handlePin(session),
    },
    {
      key: "edit",
      label: "重命名",
      icon: <EditOutlined />,
      onClick: () => handleEdit(session),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "删除",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(session),
    },
  ];

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString();
  };

  // 判断日期分组
  const getDateGroup = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sessionDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (sessionDate.getTime() === today.getTime()) {
      return "today";
    } else if (sessionDate.getTime() === yesterday.getTime()) {
      return "yesterday";
    } else if (sessionDate >= lastWeek) {
      return "thisWeek";
    } else {
      return "earlier";
    }
  };

  // 按分组整理会话
  const groupedSessions = () => {
    // 首先按置顶状态和时间排序
    const sortedSessions = [...sessions].sort((a, b) => {
      // 置顶的在前面
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // 同样置顶状态下按时间排序
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const groups: {
      pinned: ChatSession[];
      today: ChatSession[];
      yesterday: ChatSession[];
      thisWeek: ChatSession[];
      earlier: ChatSession[];
    } = {
      pinned: [],
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };

    sortedSessions.forEach((session) => {
      if (session.isPinned) {
        groups.pinned.push(session);
      } else {
        const group = getDateGroup(session.updatedAt);
        groups[group].push(session);
      }
    });

    return groups;
  };

  // 渲染分组标题
  const renderGroupTitle = (title: string, count: number) => {
    if (count === 0) return null;

    return (
      <div className="chat-history-group-title">
        <Text
          type="secondary"
          className="text-xs font-medium uppercase tracking-wider"
        >
          {title} ({count})
        </Text>
      </div>
    );
  };

  // 渲染会话项
  const renderSessionItem = (session: ChatSession) => (
    <List.Item
      key={session.id}
      className={`chat-history-item ${
        currentSession === session.id ? "active" : ""
      } ${session.isPinned ? "pinned" : ""}`}
      onClick={() => onSelectSession(session.id)}
    >
      <div className="chat-history-content">
        {editingSession === session.id ? (
          <Input
            value={editTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditTitle(e.target.value)
            }
            onPressEnter={() => handleSaveEdit(session.id)}
            onBlur={() => handleSaveEdit(session.id)}
            autoFocus
            size="small"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1 min-w-0">
              <MessageOutlined className="chat-history-icon" />
              <div className="chat-item-details">
                <div className="chat-item-title flex items-center gap-1">
                  {session.isPinned && (
                    <PushpinFilled className="text-blue-500 text-xs" />
                  )}
                  <span className={session.isPinned ? "font-medium" : ""}>
                    {session.title}
                  </span>
                </div>
                <div className="chat-item-meta">
                  <Text type="secondary" className="chat-item-count">
                    {session.messages.length} 条消息
                  </Text>
                  <Text type="secondary" className="chat-item-time">
                    {formatTime(session.updatedAt)}
                  </Text>
                </div>
              </div>
            </div>

            {/* 三个点菜单按钮 */}
            <div className="chat-item-actions">
              <Dropdown
                menu={{ items: getMenuItems(session) }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  className="chat-item-more-btn"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </Dropdown>
            </div>
          </div>
        )}
      </div>
    </List.Item>
  );

  const groups = groupedSessions();
  const totalSessions = sessions.length;

  return (
    <div className="h-full flex flex-col">
      {/* 历史记录标题 */}
      <div className="chat-history-header">
        <Text type="secondary" className="text-sm font-medium">
          历史记录 ({totalSessions})
        </Text>
      </div>

      {/* 分组列表 */}
      <div className="chat-history-list">
        {totalSessions === 0 ? (
          <div className="chat-empty-state">
            <MessageOutlined className="chat-empty-icon" />
            <Text type="secondary" className="chat-empty-text">
              暂无历史记录
            </Text>
          </div>
        ) : (
          <>
            {/* 置顶分组 */}
            {groups.pinned.length > 0 && (
              <div className="chat-history-group">
                {renderGroupTitle("置顶", groups.pinned.length)}
                <div className="chat-history-group-content">
                  {groups.pinned.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* 今天分组 */}
            {groups.today.length > 0 && (
              <div className="chat-history-group">
                {renderGroupTitle("今天", groups.today.length)}
                <div className="chat-history-group-content">
                  {groups.today.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* 昨天分组 */}
            {groups.yesterday.length > 0 && (
              <div className="chat-history-group">
                {renderGroupTitle("昨天", groups.yesterday.length)}
                <div className="chat-history-group-content">
                  {groups.yesterday.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* 本周分组 */}
            {groups.thisWeek.length > 0 && (
              <div className="chat-history-group">
                {renderGroupTitle("本周", groups.thisWeek.length)}
                <div className="chat-history-group-content">
                  {groups.thisWeek.map(renderSessionItem)}
                </div>
              </div>
            )}

            {/* 更早分组 */}
            {groups.earlier.length > 0 && (
              <div className="chat-history-group">
                {renderGroupTitle("更早", groups.earlier.length)}
                <div className="chat-history-group-content">
                  {groups.earlier.map(renderSessionItem)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
