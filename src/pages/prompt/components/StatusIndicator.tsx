import React, { useEffect, useState } from "react";
import {
  Card,
  Progress,
  Typography,
  Space,
  Badge,
  Statistic,
  Divider,
  Timeline,
} from "antd";
import {
  BulbOutlined,
  FileTextOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

interface StatusIndicatorProps {
  isOptimizing: boolean;
  isDeepReasoning: boolean;
  isEvaluating: boolean;
  reasoningDuration: number;
  reasoningStartTime: number | null;
  hasDeepReasoningContent: boolean;
  hasOptimizedContent: boolean;
  hasEvaluationContent: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isOptimizing,
  isDeepReasoning,
  isEvaluating,
  reasoningDuration,
  reasoningStartTime,
  hasDeepReasoningContent,
  hasOptimizedContent,
  hasEvaluationContent,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 实时更新当前时间（用于计算正在进行的推理时间）
  useEffect(() => {
    if (isDeepReasoning && reasoningStartTime) {
      const timer = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isDeepReasoning, reasoningStartTime]);

  // 计算当前推理时间
  const getCurrentReasoningTime = () => {
    if (isDeepReasoning && reasoningStartTime) {
      return currentTime - reasoningStartTime;
    }
    return reasoningDuration;
  };

  // 格式化时间显示
  const formatTime = (milliseconds: number) => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(1)}s`;
  };

  // 计算整体进度
  const calculateProgress = () => {
    if (!isOptimizing) return 0;

    let progress = 0;
    if (hasDeepReasoningContent || !isDeepReasoning) progress += 33;
    if (hasOptimizedContent) progress += 34;
    if (hasEvaluationContent) progress += 33;

    return Math.min(progress, 100);
  };

  // 获取当前状态描述
  const getCurrentStatus = () => {
    if (!isOptimizing) return { text: "待机中", status: "default" as const };
    if (isDeepReasoning) return { text: "深度推理中", status: "processing" as const };
    if (!hasOptimizedContent) return { text: "生成优化内容", status: "processing" as const };
    if (isEvaluating) return { text: "评估中", status: "processing" as const };
    if (hasEvaluationContent) return { text: "优化完成", status: "success" as const };
    return { text: "处理中", status: "processing" as const };
  };

  const currentStatus = getCurrentStatus();
  const progress = calculateProgress();

  return (
    <Card size="small" className="mb-4">
      <div className="space-y-4">
        {/* 标题和总体状态 */}
        <div className="flex items-center justify-between">
          <Title level={5} className="mb-0">
            优化状态
          </Title>
          <Badge status={currentStatus.status} text={currentStatus.text} />
        </div>

        {/* 进度条 */}
        {isOptimizing && (
          <Progress
            percent={progress}
            status={progress === 100 ? "success" : "active"}
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            size="small"
          />
        )}

        {/* 时间统计 */}
        {(isDeepReasoning || reasoningDuration > 0) && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <Statistic
              title="深度推理时间"
              value={getCurrentReasoningTime()}
              formatter={(value) => formatTime(Number(value))}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: "16px" }}
            />
          </div>
        )}

        {/* 阶段时间线 */}
        {isOptimizing && (
          <>
            <Divider className="my-3" />
            <div>
              <Text strong className="block mb-2">处理阶段</Text>
              <Timeline
                items={[
                  {
                    dot: hasDeepReasoningContent ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : isDeepReasoning ? (
                      <LoadingOutlined className="text-blue-500" />
                    ) : (
                      <BulbOutlined className="text-gray-400" />
                    ),
                    children: (
                      <Space>
                        <Text>深度推理</Text>
                        {isDeepReasoning && (
                          <Badge status="processing" text="进行中" />
                        )}
                        {hasDeepReasoningContent && !isDeepReasoning && (
                          <Badge status="success" text="已完成" />
                        )}
                      </Space>
                    ),
                  },
                  {
                    dot: hasOptimizedContent ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (!isDeepReasoning && !hasDeepReasoningContent) || hasDeepReasoningContent ? (
                      <LoadingOutlined className="text-blue-500" />
                    ) : (
                      <FileTextOutlined className="text-gray-400" />
                    ),
                    children: (
                      <Space>
                        <Text>生成优化内容</Text>
                        {!hasOptimizedContent && ((!isDeepReasoning && !hasDeepReasoningContent) || hasDeepReasoningContent) && (
                          <Badge status="processing" text="进行中" />
                        )}
                        {hasOptimizedContent && (
                          <Badge status="success" text="已完成" />
                        )}
                      </Space>
                    ),
                  },
                  {
                    dot: hasEvaluationContent ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : isEvaluating ? (
                      <LoadingOutlined className="text-blue-500" />
                    ) : (
                      <BarChartOutlined className="text-gray-400" />
                    ),
                    children: (
                      <Space>
                        <Text>评估分析</Text>
                        {isEvaluating && (
                          <Badge status="processing" text="进行中" />
                        )}
                        {hasEvaluationContent && (
                          <Badge status="success" text="已完成" />
                        )}
                      </Space>
                    ),
                  },
                ]}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default StatusIndicator;
