import React from "react";
import { Card, Typography, Space, Button, Tag, Avatar } from "antd";
import { UserOutlined, RobotOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ChatMessage } from "../types";

const { Text } = Typography;

interface ChatMessagesProps {
  messages: ChatMessage[];
  onDeleteMessage?: (id: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  onDeleteMessage,
}) => {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Text type="secondary">暂无消息，点击下方按钮添加用户或助手消息</Text>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] ${
              message.role === "user" ? "order-2" : "order-1"
            }`}
          >
            <Card
              size="small"
              className={`${
                message.role === "user"
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
                      message.role === "user" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                    className={
                      message.role === "user" ? "bg-blue-500" : "bg-gray-500"
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag color={message.role === "user" ? "blue" : "default"}>
                        {message.role === "user" ? "用户" : "助手"}
                      </Tag>
                      <Text type="secondary" className="text-xs">
                        {message.timestamp.toLocaleTimeString()}
                      </Text>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
                {onDeleteMessage && (
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteMessage(message.id)}
                    className="opacity-60 hover:opacity-100"
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
