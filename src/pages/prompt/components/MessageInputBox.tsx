import React, { useState } from "react";
import { Button, Input, Space, Tag } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import type { ChatMessage } from "../types";
import styles from "../index.module.css";

const { TextArea } = Input;

interface MessageInputBoxProps {
  role: "user" | "assistant";
  onSave: (message: ChatMessage) => void;
  onCancel: () => void;
}

const MessageInputBox: React.FC<MessageInputBoxProps> = ({
  role,
  onSave,
  onCancel,
}) => {
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (!content.trim()) {
      return;
    }

    const newMessage: ChatMessage = {
      id: `${role}_${Date.now()}`,
      role,
      content: content.trim(),
      timestamp: new Date(),
    };

    onSave(newMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div className={styles.messageInputBox}>
      <div className="flex items-center gap-2 mb-3">
        <Tag
          color={role === "user" ? "blue" : "purple"}
          icon={role === "user" ? <UserOutlined /> : <RobotOutlined />}
        >
          {role === "user" ? "用户消息" : "助手消息"}
        </Tag>
      </div>

      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`请输入${role === "user" ? "用户" : "助手"}消息内容...`}
        rows={4}
        className={styles.messageInput}
        onKeyDown={handleKeyDown}
        showCount
        maxLength={2000}
      />

      <div className={styles.messageInputActions}>
        <Button icon={<CloseOutlined />} onClick={onCancel}>
          取消
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleSave}
          disabled={!content.trim()}
        >
          保存 (Ctrl+Enter)
        </Button>
      </div>
    </div>
  );
};

export default MessageInputBox;
