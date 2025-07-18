import React, { useState } from "react";
import { Input, Tabs, Typography, Space } from "antd";
import { FileTextOutlined, SettingOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

interface PromptInputProps {
  userPrompt: string;
  systemPrompt: string;
  onUserPromptChange: (value: string) => void;
  onSystemPromptChange: (value: string) => void;
  disabled?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({
  userPrompt,
  systemPrompt,
  onUserPromptChange,
  onSystemPromptChange,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState("user");

  const tabItems = [
    {
      key: "user",
      label: (
        <Space>
          <FileTextOutlined />
          用户提示词
        </Space>
      ),
      children: (
        <div className="space-y-2">
          <Text type="secondary" className="text-sm">
            输入需要优化的提示词内容
          </Text>
          <TextArea
            value={userPrompt}
            onChange={(e) => onUserPromptChange(e.target.value)}
            placeholder="请输入您的提示词内容..."
            rows={8}
            disabled={disabled}
            showCount
            maxLength={5000}
            className="resize-none"
          />
        </div>
      ),
    },
    {
      key: "system",
      label: (
        <Space>
          <SettingOutlined />
          系统提示词
          {systemPrompt && <span className="text-blue-500">•</span>}
        </Space>
      ),
      children: (
        <div className="space-y-2">
          <Text type="secondary" className="text-sm">
            可选：添加系统级别的提示词来定义AI的行为和角色
          </Text>
          <TextArea
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="可选：输入系统提示词来定义AI的角色和行为规范..."
            rows={8}
            disabled={disabled}
            showCount
            maxLength={2000}
            className="resize-none"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        tabBarGutter={16}
      />
    </div>
  );
};

export default PromptInput;
