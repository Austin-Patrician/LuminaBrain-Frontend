import React, { useState, useEffect, useRef } from "react";
import { Input, Tag, Button } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import type { ChatMessage } from "../types";
import styles from "../index.module.css";

const { TextArea } = Input;

interface SimpleMessageInputProps {
  role: "user" | "assistant";
  onComplete: (message: ChatMessage) => void;
  onRemove: () => void;
  autoFocus?: boolean;
}

const SimpleMessageInput: React.FC<SimpleMessageInputProps> = ({
  role,
  onComplete,
  onRemove,
  autoFocus = false,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleComplete();
    } else if (e.key === "Escape") {
      onRemove();
    }
  };

  const handleComplete = () => {
    if (!content.trim()) {
      onRemove();
      return;
    }

    const newMessage: ChatMessage = {
      id: `${role}_${Date.now()}`,
      role,
      content: content.trim(),
      timestamp: new Date(),
    };

    onComplete(newMessage);
  };

  const handleBlur = () => {
    // 延迟检查，给用户一些时间点击完成按钮
    setTimeout(() => {
      if (!content.trim()) {
        onRemove();
      }
    }, 200);
  };

  return (
    <div className={styles.messageInputBox}>
      <div className="flex items-center justify-between mb-2">
        <Tag
          color={role === "user" ? "blue" : "purple"}
          icon={role === "user" ? <UserOutlined /> : <RobotOutlined />}
        >
          {role === "user" ? "用户消息" : "助手消息"}
        </Tag>
        <div className="flex gap-1">
          {content.trim() && (
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleComplete}
              className="text-green-500"
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500"
          />
        </div>
      </div>

      <TextArea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`输入${
          role === "user" ? "用户" : "助手"
        }消息内容... (Ctrl+Enter确认, Esc取消)`}
        rows={3}
        className={styles.messageInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        showCount
        maxLength={2000}
      />
    </div>
  );
};

export default SimpleMessageInput;
