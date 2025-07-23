import React from "react";
import { Card, Typography } from "antd";
import {
  RobotOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  BulbOutlined,
  BarChartOutlined,
  CustomerServiceOutlined,
  CodeOutlined,
  TranslationOutlined
} from "@ant-design/icons";
import type { MarketplaceItem } from "../types/marketplace";

const { Text } = Typography;

interface DifyStyleCardProps {
  item: MarketplaceItem;
  onAddToWorkspace: (item: MarketplaceItem) => void;
}

// 根据类型和分类获取图标和颜色
const getIconAndColor = (item: MarketplaceItem) => {
  const iconMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    // 按类型
    agent: {
      icon: <RobotOutlined />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    prompt: {
      icon: <FileTextOutlined />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    application: {
      icon: <AppstoreOutlined />,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },

    // 按分类细分
    "customer-service": {
      icon: <CustomerServiceOutlined />,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    "creativity": {
      icon: <BulbOutlined />,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    "business": {
      icon: <BarChartOutlined />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    "development": {
      icon: <CodeOutlined />,
      color: "text-gray-600",
      bgColor: "bg-gray-100"
    },
    "education": {
      icon: <TranslationOutlined />,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
  };

  // 优先按分类匹配，其次按类型
  return iconMap[item.category] || iconMap[item.type] || iconMap.application;
};

const DifyStyleCard: React.FC<DifyStyleCardProps> = ({ item, onAddToWorkspace }) => {
  const { icon, color, bgColor } = getIconAndColor(item);

  return (
    <Card
      hoverable
      className="h-full border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group"
      bodyStyle={{ padding: '20px' }}
    >
      <div className="flex flex-col h-full">
        {/* 图标和类型标签 */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColor}`}>
            <span className={`text-xl ${color}`}>
              {icon}
            </span>
          </div>

          {/* 类型标签 */}
          <span className={`
            px-3 py-1 text-xs font-medium rounded-full
            ${item.type === 'agent' ? 'bg-blue-50 text-blue-600' : ''}
            ${item.type === 'prompt' ? 'bg-green-50 text-green-600' : ''}
            ${item.type === 'application' ? 'bg-purple-50 text-purple-600' : ''}
          `}>
            {item.type === 'agent' ? 'AGENT' : ''}
            {item.type === 'prompt' ? 'CHATFLOW' : ''}
            {item.type === 'application' ? 'CHATFLOW' : ''}
          </span>
        </div>

        {/* 应用名称 */}
        <div className="mb-3">
          <Text className="text-lg font-semibold text-gray-900 leading-tight">
            {item.title}
          </Text>
        </div>

        {/* 描述 */}
        <div className="flex-1 mb-12">
          <Text className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {item.description}
          </Text>
        </div>

        {/* 添加到工作区按钮 - 悬停时显示 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-90 backdrop-blur-sm border-t border-gray-200 opacity-0 group-hover:opacity-100 transform translate-y-full group-hover:translate-y-0 transition-all duration-200 ease-in-out">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWorkspace(item);
            }}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            添加到工作区
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DifyStyleCard;
