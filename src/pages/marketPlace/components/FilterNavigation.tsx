import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface FilterOption {
  key: string;
  label: string;
}

interface FilterNavigationProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  onSearch: (keyword: string) => void;
}


//dictionaryid: 4471af43de824eb68966fe1306292dd0
const FilterNavigation: React.FC<FilterNavigationProps> = ({
  selectedFilter,
  onFilterChange,
  onSearch
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
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

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

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

      <div className="w-80">
        <Input
          placeholder="搜索应用..."
          value={searchValue}
          onChange={handleInputChange}
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default FilterNavigation;
