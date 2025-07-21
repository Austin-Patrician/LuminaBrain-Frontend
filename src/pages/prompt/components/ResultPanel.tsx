import React, { useState } from "react";
import {
  Card,
  Typography,
  Tabs,
  Button,
  Space,
  Badge,
  Spin,
  Empty,
  message as antdMessage,
  Divider,
  Alert,
} from "antd";
import {
  BulbOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExperimentOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import ModalMarkdown from "@/components/markdown/modal-markdown";
import type { OptimizationResult, StreamingContent } from "../types";

const { Text, Paragraph, Title } = Typography;

interface ResultPanelProps {
  result: OptimizationResult | null;
  streamingContent: StreamingContent;
  isOptimizing: boolean;
  // 新增状态展示相关属性
  isDeepReasoning?: boolean;
  isEvaluating?: boolean;
  reasoningDuration?: number;
  reasoningStartTime?: number | null;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  result,
  streamingContent,
  isOptimizing,
}) => {
  const [activeTab, setActiveTab] = useState("optimized");
  const [previewMode, setPreviewMode] = useState<{ [key: string]: boolean }>({
    optimized: true,
    original: true,
    reasoning: true,
    evaluation: true,
  });

  // 复制到剪贴板
  const copyToClipboard = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      antdMessage.success(`${label}已复制到剪贴板`);
    } catch (error) {
      console.error("复制失败:", error);
      antdMessage.error("复制失败，请手动复制");
    }
  };

  // 切换预览模式
  const togglePreviewMode = (key: string) => {
    setPreviewMode((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 内容显示组件
  const ContentDisplay: React.FC<{
    content: string;
    previewKey: string;
    label: string;
  }> = ({ content, previewKey, label }) => {
    const isPreview = previewMode[previewKey];

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Text strong>{label}</Text>
          <Space>
            <Button
              type="text"
              size="small"
              icon={isPreview ? <EditOutlined /> : <EyeOutlined />}
              onClick={() => togglePreviewMode(previewKey)}
            >
              {isPreview ? "源码" : "预览"}
            </Button>
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(content, label)}
            >
              复制
            </Button>
          </Space>
        </div>

        {isPreview ? (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <ModalMarkdown>{content}</ModalMarkdown>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 mb-0">
              {content}
            </pre>
          </div>
        )}
      </div>
    );
  };

  // 流式内容组件
  const StreamingDisplay: React.FC<{
    title: string;
    content: string;
    icon: React.ReactNode;
    loading?: boolean;
    color?: string;
  }> = ({ title, content, icon, loading = false, color = "blue" }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-3">
        {loading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
        ) : (
          icon
        )}
        <Text strong className="text-base">
          {title}
        </Text>
        {loading && <Badge status="processing" text="生成中..." />}
      </div>
      {content ? (
        <Card size="small" className={`bg-${color}-50 border-${color}-200`}>
          <div className="prose prose-sm max-w-none">
            <ModalMarkdown>{content}</ModalMarkdown>
            {loading && <span className="animate-pulse">▋</span>}
          </div>
        </Card>
      ) : (
        <div className="h-20 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
          <Text type="secondary">等待生成...</Text>
        </div>
      )}
    </div>
  );

  // 如果正在优化，显示流式进度
  if (isOptimizing) {
    return (
      <Card
        title={
          <Space>
            <ExperimentOutlined className="text-blue-500" />
            <span>优化进度</span>
            <Spin size="small" />
          </Space>
        }
        size="small"
      >
        <div className="space-y-6">
          <div className="text-center pb-4">
            <Title level={4} className="mt-4 mb-2">
              正在优化您的提示词...
            </Title>
            <Text type="secondary">请耐心等待，优化过程中会实时显示进度</Text>
          </div>

          <Divider />

          {/* 深度推理过程 */}
          {streamingContent.deepReasoning && (
            <StreamingDisplay
              title="深度推理过程"
              content={streamingContent.deepReasoning}
              icon={<BulbOutlined className="text-orange-500" />}
              loading={isOptimizing && !streamingContent.optimizedPrompt}
              color="orange"
            />
          )}

          {/* 优化后的提示词 */}
          <StreamingDisplay
            title="优化后的提示词"
            content={streamingContent.optimizedPrompt}
            icon={<FileTextOutlined className="text-blue-500" />}
            loading={Boolean(
              isOptimizing &&
              streamingContent.deepReasoning &&
              !streamingContent.optimizedPrompt
            )}
            color="blue"
          />

          {/* 评估结果 */}
          <StreamingDisplay
            title="优化评估报告"
            content={streamingContent.evaluation}
            icon={<BarChartOutlined className="text-green-500" />}
            loading={Boolean(
              isOptimizing &&
              streamingContent.optimizedPrompt &&
              !streamingContent.evaluation
            )}
            color="green"
          />
        </div>
      </Card>
    );
  }

  // 如果有结果，显示完整结果
  if (result) {
    const tabItems = [
      {
        key: "optimized",
        label: (
          <Space>
            <FileTextOutlined />
            <span>优化后提示词</span>
          </Space>
        ),
        children: (
          <ContentDisplay
            content={result.optimizedPrompt}
            previewKey="optimized"
            label="优化后的提示词"
          />
        ),
      },
      {
        key: "original",
        label: (
          <Space>
            <FileTextOutlined />
            <span>原始提示词</span>
          </Space>
        ),
        children: (
          <ContentDisplay
            content={result.originalPrompt}
            previewKey="original"
            label="原始提示词"
          />
        ),
      },
      {
        key: "evaluation",
        label: (
          <Space>
            <BarChartOutlined />
            <span>评估报告</span>
          </Space>
        ),
        children: (
          <ContentDisplay
            content={result.evaluation}
            previewKey="evaluation"
            label="优化评估报告"
          />
        ),
      },
    ];

    // 如果有深度推理，添加推理过程标签页
    if (result.deepReasoning) {
      tabItems.splice(2, 0, {
        key: "reasoning",
        label: (
          <Space>
            <BulbOutlined />
            <span>推理过程</span>
          </Space>
        ),
        children: (
          <ContentDisplay
            content={result.deepReasoning}
            previewKey="reasoning"
            label="深度推理过程"
          />
        ),
      });
    }

    return (
      <Card
        title={
          <div className="flex items-center justify-between">
            <Space>
              <CheckCircleOutlined className="text-green-500" />
              <span>优化结果</span>
              <Badge
                status="success"
                text={
                  result.optimizationType === "function-calling"
                    ? "Function Calling"
                    : "通用优化"
                }
              />
            </Space>
            <Text type="secondary" className="text-sm">
              {result.timestamp.toLocaleString()}
            </Text>
          </div>
        }
        size="small"
      >
        <div className="space-y-4">
          {/* 优化成功提示 */}
          <Alert
            message="提示词优化完成"
            description="您可以切换预览/源码模式查看内容，或复制到剪贴板使用"
            type="success"
            showIcon
            className="mb-4"
          />

          {/* 结果内容 */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="small"
          />
        </div>
      </Card>
    );
  }

  // 默认空状态
  return (
    <Card
      title={
        <Space>
          <ExperimentOutlined className="text-gray-400" />
          <span>优化结果</span>
        </Space>
      }
      size="small"
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="text-center">
            <Text type="secondary">选择优化类型开始优化您的提示词</Text>
            <br />
            <Text type="secondary" className="text-sm">
              支持实时查看优化过程和 Markdown 格式预览
            </Text>
          </div>
        }
      />
    </Card>
  );
};

export default ResultPanel;
