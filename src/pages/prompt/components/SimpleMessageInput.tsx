import React, { useState, useEffect, useRef } from "react";
import { Input, Tag, Button, Card, Avatar } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  DeleteOutlined,
  CheckOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ChatMessage } from "../types";
import styles from "../index.module.css";

const { TextArea } = Input;

interface SimpleMessageInputProps {
  role: "user" | "assistant";
  onComplete: (message: ChatMessage) => void;
  onRemove: () => void;
  autoFocus?: boolean;
  message?: ChatMessage; // 已存在的消息，用于编辑模式
  isEditing?: boolean; // 是否处于编辑模式
}

const SimpleMessageInput: React.FC<SimpleMessageInputProps> = ({
  role,
  onComplete,
  onRemove,
  autoFocus = false,
  message,
  isEditing = false,
}) => {
  const [content, setContent] = useState(message?.content || "");
  const [isInputMode, setIsInputMode] = useState(!message || isEditing);
  const textareaRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current && isInputMode) {
      textareaRef.current.focus();
    }
  }, [autoFocus, isInputMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleComplete();
    } else if (e.key === "Escape") {
      if (message) {
        setIsInputMode(false);
        setContent(message.content);
      } else {
        onRemove();
      }
    }
  };

  const handleComplete = () => {
    if (!content.trim()) {
      if (message) {
        setIsInputMode(false);
        setContent(message.content);
      } else {
        onRemove();
      }
      return;
    }

    const newMessage: ChatMessage = {
      id: message?.id || `${role}_${Date.now()}`,
      role,
      content: content.trim(),
    };

    onComplete(newMessage);
    setIsInputMode(false);
  };

  const handleEdit = () => {
    setIsInputMode(true);
  };

  const handleBlur = () => {
    // 延迟检查，给用户一些时间点击完成按钮
    setTimeout(() => {
      if (!content.trim() && !message) {
        onRemove();
      }
    }, 200);
  };

  // 如果不是输入模式且有消息内容，显示为消息卡片
  if (!isInputMode && message) {
    return (
      <div className="mb-3">
        <div
          className={`flex ${role === "user" ? "justify-end" : "justify-start"
            }`}
        >
          <div
            className={`max-w-[80%] ${role === "user" ? "order-2" : "order-1"
              }`}
          >
            <Card
              size="small"
              className={`${role === "user"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
                }`}
              bodyStyle={{ padding: "12px 16px" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar
                    size="small"
                    icon={
                      role === "user" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                    className={
                      role === "user" ? "bg-blue-500" : "bg-gray-500"
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={role === "user" ? "blue" : "default"}>
                        {role === "user" ? "用户" : "助手"}
                      </Tag>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                    className="opacity-60 hover:opacity-100"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={onRemove}
                    className="opacity-60 hover:opacity-100"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 输入模式
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
            onClick={() => {
              if (message) {
                setIsInputMode(false);
                setContent(message.content);
              } else {
                onRemove();
              }
            }}
            className="text-gray-400 hover:text-red-500"
          />
        </div>
      </div>

      <TextArea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`输入${role === "user" ? "用户" : "助手"
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
