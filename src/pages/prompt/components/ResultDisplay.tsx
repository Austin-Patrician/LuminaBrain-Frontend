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
} from "antd";
import {
  BulbOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { OptimizationResult, StreamingContent } from "../types";

const { Text, Paragraph, Title } = Typography;

interface ResultDisplayProps {
  result: OptimizationResult | null;
  streamingContent: StreamingContent;
  isOptimizing: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  streamingContent,
  isOptimizing,
}) => {
  const [activeTab, setActiveTab] = useState("optimized");

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

  // 流式内容组件
  const StreamingDisplay: React.FC<{
    title: string;
    content: string;
    icon: React.ReactNode;
    loading?: boolean;
  }> = ({ title, content, icon, loading = false }) => (
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
        <Card size="small" className="bg-gray-50">
          <Paragraph className="mb-0 whitespace-pre-wrap text-sm leading-relaxed">
            {content}
            {loading && <span className="animate-pulse">▋</span>}
          </Paragraph>
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
      <div className="space-y-6">
        <div className="text-center pb-4">
          <Spin size="large" />
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
        />
      </div>
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
            优化后提示词
          </Space>
        ),
        children: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text strong>优化后的提示词</Text>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() =>
                  copyToClipboard(result.optimizedPrompt, "优化后的提示词")
                }
              >
                复制
              </Button>
            </div>
            <Card className="bg-blue-50 border-blue-200">
              <Paragraph className="mb-0 whitespace-pre-wrap leading-relaxed">
                {result.optimizedPrompt}
              </Paragraph>
            </Card>
          </div>
        ),
      },
      {
        key: "original",
        label: (
          <Space>
            <FileTextOutlined />
            原始提示词
          </Space>
        ),
        children: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text strong>原始提示词</Text>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() =>
                  copyToClipboard(result.originalPrompt, "原始提示词")
                }
              >
                复制
              </Button>
            </div>
            <Card className="bg-gray-50">
              <Paragraph className="mb-0 whitespace-pre-wrap leading-relaxed">
                {result.originalPrompt}
              </Paragraph>
            </Card>
          </div>
        ),
      },
      {
        key: "evaluation",
        label: (
          <Space>
            <BarChartOutlined />
            评估报告
          </Space>
        ),
        children: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text strong>优化评估报告</Text>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(result.evaluation, "评估报告")}
              >
                复制
              </Button>
            </div>
            <Card className="bg-green-50 border-green-200">
              <Paragraph className="mb-0 whitespace-pre-wrap leading-relaxed">
                {result.evaluation}
              </Paragraph>
            </Card>
          </div>
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
            推理过程
          </Space>
        ),
        children: (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text strong>深度推理过程</Text>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() =>
                  copyToClipboard(result.deepReasoning!, "推理过程")
                }
              >
                复制
              </Button>
            </div>
            <Card className="bg-orange-50 border-orange-200">
              <Paragraph className="mb-0 whitespace-pre-wrap leading-relaxed">
                {result.deepReasoning}
              </Paragraph>
            </Card>
          </div>
        ),
      });
    }

    return (
      <div className="space-y-4">
        {/* 结果头部信息 */}
        <div className="flex items-center justify-between">
          <Space>
            <CheckCircleOutlined className="text-green-500" />
            <Text strong>优化完成</Text>
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

        {/* 结果内容 */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />
      </div>
    );
  }

  // 默认空状态
  return (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无优化结果" />
  );
};

export default ResultDisplay;
