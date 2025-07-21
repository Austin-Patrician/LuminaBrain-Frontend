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
  onClick: () => void;
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

const DifyStyleCard: React.FC<DifyStyleCardProps> = ({ item, onClick }) => {
  const { icon, color, bgColor } = getIconAndColor(item);

  return (
    <Card
      hoverable
      className="h-full border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      bodyStyle={{ padding: '20px' }}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* 图标区域 */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${bgColor}
          `}>
            <span className={`text-lg ${color}`}>
              {icon}
            </span>
          </div>

          {/* 类型标签 */}
          <div className="flex items-center space-x-1">
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${item.type === 'agent' ? 'bg-blue-50 text-blue-600' : ''}
              ${item.type === 'prompt' ? 'bg-green-50 text-green-600' : ''}
              ${item.type === 'application' ? 'bg-purple-50 text-purple-600' : ''}
            `}>
              {item.type === 'agent' ? 'AGENT' : ''}
              {item.type === 'prompt' ? '工作流' : ''}
              {item.type === 'application' ? '工作流' : ''}
            </span>
          </div>
        </div>

        {/* 标题 */}
        <div className="mb-3">
          <Text className="text-base font-semibold text-gray-900 leading-tight">
            {item.title}
          </Text>
        </div>

        {/* 描述 */}
        <div className="flex-1 mb-4">
          <Text className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {item.description}
          </Text>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{item.authorName}</span>
          <div className="flex items-center space-x-3">
            <span>v{item.version}</span>
            {item.downloads > 0 && (
              <span>{item.downloads} 次使用</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DifyStyleCard;
