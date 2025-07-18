import React, { useState } from "react";
import {
  Card,
  List,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  Popconfirm,
  Empty,
  Input,
} from "antd";
import {
  HistoryOutlined,
  FunctionOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined,
  SearchOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { IconButton, Iconify } from "@/components/icon";
import type { OptimizationResult } from "../types";

const { Text, Paragraph } = Typography;
const { Search } = Input;

interface OptimizationHistoryProps {
  history: OptimizationResult[];
  onApply: (result: OptimizationResult) => void;
  onClear: () => void;
}

const OptimizationHistory: React.FC<OptimizationHistoryProps> = ({
  history,
  onApply,
  onClear,
}) => {
  const [searchText, setSearchText] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // 过滤历史记录
  const filteredHistory = history.filter(
    (item) =>
      item.originalPrompt.toLowerCase().includes(searchText.toLowerCase()) ||
      item.optimizedPrompt.toLowerCase().includes(searchText.toLowerCase())
  );

  // 切换展开状态
  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // 获取优化类型标签
  const getTypeTag = (type: "function-calling" | "prompt-optimization") => {
    if (type === "function-calling") {
      return (
        <Tag color="blue" icon={<FunctionOutlined />}>
          Function Calling
        </Tag>
      );
    }
    return (
      <Tag color="green" icon={<BulbOutlined />}>
        通用优化
      </Tag>
    );
  };

  return (
    <Card
      title={
        <Space>
          <HistoryOutlined className="text-purple-500" />
          <span>优化历史</span>
          <Tag color="purple">{history.length}</Tag>
        </Space>
      }
      size="small"
      extra={
        history.length > 0 && (
          <Popconfirm
            title="清空历史记录"
            description="确定要清空所有优化历史记录吗？"
            onConfirm={onClear}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" size="small" icon={<ClearOutlined />} danger>
              清空
            </Button>
          </Popconfirm>
        )
      }
    >
      {history.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无优化历史记录"
        />
      ) : (
        <div className="space-y-3">
          {/* 搜索框 */}
          <Search
            placeholder="搜索历史记录..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            size="small"
          />

          {/* 历史记录列表 */}
          <List
            dataSource={filteredHistory}
            size="small"
            pagination={
              filteredHistory.length > 5
                ? {
                    pageSize: 5,
                    size: "small",
                    showSizeChanger: false,
                  }
                : false
            }
            renderItem={(item, index) => {
              const isExpanded = expandedItems.has(index);

              return (
                <List.Item className="!px-3 !py-3 border border-gray-200 rounded-lg mb-2 last:mb-0 hover:shadow-sm transition-shadow">
                  <div className="w-full space-y-3">
                    {/* 头部信息 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTypeTag(item.optimizationType)}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <ClockCircleOutlined />
                          <span>{item.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                      <Space size="small">
                        <Tooltip title="查看详情">
                          <IconButton
                            size="small"
                            onClick={() => toggleExpanded(index)}
                          >
                            <Iconify
                              icon={
                                isExpanded
                                  ? "solar:eye-closed-linear"
                                  : "solar:eye-bold"
                              }
                              size={14}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="应用此结果">
                          <IconButton
                            size="small"
                            onClick={() => onApply(item)}
                          >
                            <Iconify icon="solar:import-bold" size={14} />
                          </IconButton>
                        </Tooltip>
                      </Space>
                    </div>

                    {/* 原始提示词预览 */}
                    <div>
                      <Text className="text-xs text-gray-500 font-medium">
                        原始提示词:
                      </Text>
                      <Paragraph
                        className="!mt-1 !mb-0 text-sm text-gray-700"
                        ellipsis={{
                          rows: 2,
                          tooltip: item.originalPrompt,
                        }}
                      >
                        {item.originalPrompt}
                      </Paragraph>
                    </div>

                    {/* 详细信息 - 可折叠 */}
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        {/* 优化后提示词 */}
                        <div>
                          <Text className="text-xs text-blue-600 font-medium">
                            优化后提示词:
                          </Text>
                          <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Paragraph className="!mb-0 text-sm whitespace-pre-wrap">
                              {item.optimizedPrompt}
                            </Paragraph>
                          </div>
                        </div>

                        {/* 深度推理 */}
                        {item.deepReasoning && (
                          <div>
                            <Text className="text-xs text-orange-600 font-medium">
                              深度推理过程:
                            </Text>
                            <div className="mt-1 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <Paragraph className="!mb-0 text-sm whitespace-pre-wrap">
                                {item.deepReasoning}
                              </Paragraph>
                            </div>
                          </div>
                        )}

                        {/* 评估报告 */}
                        <div>
                          <Text className="text-xs text-green-600 font-medium">
                            评估报告:
                          </Text>
                          <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <Paragraph className="!mb-0 text-sm whitespace-pre-wrap">
                              {item.evaluation}
                            </Paragraph>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                          <Button
                            type="primary"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => onApply(item)}
                          >
                            应用结果
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />

          {/* 搜索结果为空 */}
          {searchText && filteredHistory.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="未找到匹配的历史记录"
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default OptimizationHistory;
