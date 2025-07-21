import React from "react";
import {
  Input,
  Select,
  Button,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";

import type { MarketplaceItemType, SortType } from "../types/marketplace";

const { Title } = Typography;
const { Option } = Select;

interface SearchHeaderProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  selectedType: MarketplaceItemType | "all";
  onTypeChange: (value: MarketplaceItemType | "all") => void;
  sortBy: SortType;
  onSortChange: (value: SortType) => void;
  onSearch: () => void;
  onClear: () => void;
  onToggleFilter: () => void;
  filterVisible: boolean;
  resultsCount?: number;
  loading?: boolean;
}

// 类型选项
const TYPE_OPTIONS = [
  { value: "all", label: "全部类型", count: 0 },
  { value: "agent", label: "AI Agent", count: 0 },
  { value: "prompt", label: "提示词", count: 0 },
  { value: "application", label: "应用", count: 0 },
];

// 排序选项
const SORT_OPTIONS = [
  { value: "latest", label: "最新发布", icon: "🕒" },
  { value: "popular", label: "最受欢迎", icon: "🔥" },
  { value: "rating", label: "评分最高", icon: "⭐" },
  { value: "downloads", label: "下载最多", icon: "📥" },
];

export default function SearchHeader({
  keyword,
  onKeywordChange,
  selectedType,
  onTypeChange,
  sortBy,
  onSortChange,
  onSearch,
  onClear,
  onToggleFilter,
  filterVisible,
  resultsCount,
  loading = false,
}: SearchHeaderProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} className="mb-2">
            🏪 AI 广场
          </Title>
          <div className="text-gray-600">
            发现和分享优质的 AI Agent、提示词和应用
            {resultsCount !== undefined && (
              <span className="ml-2">
                · 共找到 <span className="font-semibold text-blue-600">{resultsCount}</span> 个结果
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            icon={<FilterOutlined />}
            onClick={onToggleFilter}
            type={filterVisible ? "primary" : "default"}
          >
            筛选器
          </Button>
        </div>
      </div>

      {/* 搜索区域 */}
      <div className="space-y-4">
        {/* 主搜索框 */}
        <div className="flex space-x-3">
          <Input
            placeholder="搜索 Agent、提示词或应用..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onPressEnter={handleKeyPress}
            className="flex-1"
            size="large"
            allowClear
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={onSearch}
            loading={loading}
            size="large"
          >
            搜索
          </Button>
        </div>

        {/* 快速筛选和排序 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 类型筛选 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">类型:</span>
              <Select
                value={selectedType}
                onChange={onTypeChange}
                className="w-32"
                placeholder="选择类型"
              >
                {TYPE_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            {/* 排序方式 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">排序:</span>
              <Select
                value={sortBy}
                onChange={onSortChange}
                className="w-36"
                suffixIcon={<SortAscendingOutlined />}
              >
                {SORT_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <span>
                      {option.icon} {option.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* 清除按钮 */}
          <Button
            icon={<ClearOutlined />}
            onClick={onClear}
            type="text"
            className="text-gray-500"
          >
            清除筛选
          </Button>
        </div>

        {/* 活跃筛选标签 */}
        {(keyword || selectedType !== "all") && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">当前筛选:</span>
            <Space size={[4, 4]} wrap>
              {keyword && (
                <Tag
                  closable
                  onClose={() => onKeywordChange("")}
                  color="blue"
                >
                  关键词: {keyword}
                </Tag>
              )}
              {selectedType !== "all" && (
                <Tag
                  closable
                  onClose={() => onTypeChange("all")}
                  color="green"
                >
                  类型: {TYPE_OPTIONS.find(t => t.value === selectedType)?.label}
                </Tag>
              )}
            </Space>
          </div>
        )}
      </div>
    </div>
  );
}
