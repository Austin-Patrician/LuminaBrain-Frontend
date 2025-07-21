import React from "react";
import { Button, Typography } from "antd";
import { PlusOutlined, FolderOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface CategoryItem {
  id: string;
  name: string;
  icon?: React.ReactNode;
  count?: number;
}

interface CategorySidebarProps {
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  onCreateNew: () => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  selectedCategory,
  onCategorySelect,
  onCreateNew
}) => {
  // Mock 分类数据
  const categories: CategoryItem[] = [
    {
      id: "document-organize",
      name: "文档整理",
      icon: <FolderOutlined className="text-yellow-500" />,
      count: 12
    },
    {
      id: "test",
      name: "test",
      icon: <FolderOutlined className="text-yellow-500" />,
      count: 3
    }
  ];

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* 标题区域 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Title level={4} className="mb-0 text-gray-900 font-semibold">
            我的
          </Title>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined className="text-blue-500" />}
            onClick={onCreateNew}
            className="flex items-center text-blue-500 hover:bg-blue-50"
          >
            新建
          </Button>
        </div>
      </div>

      {/* 分类列表 */}
      <div className="flex-1 p-4">
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer
                transition-all duration-200 hover:bg-white hover:shadow-sm
                ${selectedCategory === category.id
                  ? 'bg-white shadow-sm border border-blue-100'
                  : 'hover:bg-gray-100'
                }
              `}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <Text
                    className={`
                      text-sm font-medium truncate
                      ${selectedCategory === category.id ? 'text-blue-600' : 'text-gray-900'}
                    `}
                  >
                    {category.name}
                  </Text>
                </div>
              </div>
              {category.count && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
