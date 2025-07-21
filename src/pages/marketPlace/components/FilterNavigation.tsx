import React from "react";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterNavigationProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onSearch: () => void;
}

const FilterNavigation: React.FC<FilterNavigationProps> = ({
  selectedFilter,
  onFilterChange,
  onSearch
}) => {
  const filterOptions: FilterOption[] = [
    { key: "all", label: "全部" },
    { key: "ai-assistant", label: "AI 助手" },
    { key: "knowledge-retrieval", label: "Knowledge Retrieval" },
    { key: "research", label: "Research" },
    { key: "chart-data-analysis", label: "图表数据分析" },
    { key: "chart-data", label: "图表数据" },
    { key: "marketing-content", label: "营销内容创意" },
    { key: "research-assistant", label: "研究助手" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center space-x-8">
        {filterOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => onFilterChange(option.key)}
            className={`
              text-sm font-medium transition-all duration-200 pb-1 border-b-2
              ${selectedFilter === option.key
                ? 'text-gray-900 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Button
        type="text"
        icon={<SearchOutlined className="text-gray-400" />}
        onClick={onSearch}
        className="flex items-center text-gray-400 hover:text-gray-600"
      />
    </div>
  );
};

export default FilterNavigation;
