import React, { useState } from "react";
import { Input, Tabs, Typography, Space, Button, Tooltip } from "antd";
import {
  FileTextOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Markdown from "@/components/markdown";

const { TextArea } = Input;
const { Text } = Typography;

interface PromptEditorProps {
  userPrompt: string;
  systemPrompt: string;
  onUserPromptChange: (value: string) => void;
  onSystemPromptChange: (value: string) => void;
  disabled?: boolean;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  userPrompt,
  systemPrompt,
  onUserPromptChange,
  onSystemPromptChange,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState("user");
  const [userPromptPreview, setUserPromptPreview] = useState(false);
  const [systemPromptPreview, setSystemPromptPreview] = useState(false);

  const tabItems = [
    {
      key: "user",
      label: (
        <Space>
          <FileTextOutlined />
          <span>用户提示词</span>
          {userPrompt && (
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </Space>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Text type="secondary" className="text-sm">
                输入需要优化的提示词内容，支持 Markdown 格式
              </Text>
              <Tooltip title="支持Markdown语法，如**粗体**、*斜体*、`代码`等">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            </div>
            <Button
              type="text"
              size="small"
              icon={userPromptPreview ? <EditOutlined /> : <EyeOutlined />}
              onClick={() => setUserPromptPreview(!userPromptPreview)}
              disabled={!userPrompt.trim()}
            >
              {userPromptPreview ? "编辑" : "预览"}
            </Button>
          </div>

          {userPromptPreview ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[200px]">
              {userPrompt.trim() ? (
                <Markdown>{userPrompt}</Markdown>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  暂无内容可预览
                </div>
              )}
            </div>
          ) : (
            <TextArea
              value={userPrompt}
              onChange={(e) => onUserPromptChange(e.target.value)}
              placeholder={`请输入您的提示词内容，支持 Markdown 格式...

示例：
## 任务描述
请你扮演一个**专业的文案写手**，帮我：
1. 分析目标受众
2. 制定内容策略
3. 撰写吸引人的文案

\`\`\`
要求：语言简洁有力，突出产品优势
\`\`\``}
              rows={10}
              disabled={disabled}
              showCount
              maxLength={5000}
              className="resize-none font-mono text-sm"
            />
          )}
        </div>
      ),
    },
    {
      key: "system",
      label: (
        <Space>
          <SettingOutlined />
          <span>系统提示词</span>
          {systemPrompt && (
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          )}
        </Space>
      ),
      children: (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Text type="secondary" className="text-sm">
                可选：定义AI的角色和行为规范，支持 Markdown 格式
              </Text>
              <Tooltip title="系统提示词用于设定AI的基本行为模式和角色定位">
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            </div>
            <Button
              type="text"
              size="small"
              icon={systemPromptPreview ? <EditOutlined /> : <EyeOutlined />}
              onClick={() => setSystemPromptPreview(!systemPromptPreview)}
              disabled={!systemPrompt.trim()}
            >
              {systemPromptPreview ? "编辑" : "预览"}
            </Button>
          </div>

          {systemPromptPreview ? (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[200px]">
              {systemPrompt.trim() ? (
                <Markdown>{systemPrompt}</Markdown>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  暂无内容可预览
                </div>
              )}
            </div>
          ) : (
            <TextArea
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              placeholder={`可选：输入系统提示词来定义AI的角色和行为规范...

示例：
# 角色设定
你是一位**资深的AI提示词工程师**，具有以下特质：

## 专业能力
- 深度理解自然语言处理原理
- 熟练掌握提示词优化技巧
- 具备丰富的实战经验

## 工作原则
1. **准确性优先**：确保输出内容准确无误
2. **简洁明了**：表达清晰，避免冗余
3. **用户导向**：始终以用户需求为中心`}
              rows={10}
              disabled={disabled}
              showCount
              maxLength={2000}
              className="resize-none font-mono text-sm"
            />
          )}
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
        className="prompt-editor-tabs"
      />

      {/* 快速操作提示 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <InfoCircleOutlined className="text-blue-500 mt-0.5" />
          <div>
            <Text className="text-sm text-blue-700 font-medium">
              Markdown 支持提示
            </Text>
            <div className="text-xs text-blue-600 mt-1 space-y-1">
              <div>• **粗体文本** 或 __粗体文本__</div>
              <div>• *斜体文本* 或 _斜体文本_</div>
              <div>• `行内代码` 或 ```代码块```</div>
              <div>• # 标题 ## 二级标题 ### 三级标题</div>
              <div>• - 列表项 或 1. 有序列表</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptEditor;
