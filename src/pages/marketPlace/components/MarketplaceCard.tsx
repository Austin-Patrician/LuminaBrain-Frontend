import React, { useState } from "react";
import {
  Card,
  Tag,
  Button,
  Avatar,
  Typography,
  Space,
  Rate,
  Tooltip,
  Badge,
  message,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
  RobotOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MarketplaceItem } from "../types/marketplace";
import marketplaceService from "@/api/services/marketplaceService";

const { Text, Title } = Typography;

interface MarketplaceCardProps {
  item: MarketplaceItem;
  onPreview: (item: MarketplaceItem) => void;
  onImport: (item: MarketplaceItem) => void;
  onShare?: (item: MarketplaceItem) => void;
}

// 类型图标映射
const TYPE_ICONS = {
  agent: <RobotOutlined className="text-blue-500" />,
  prompt: <FileTextOutlined className="text-green-500" />,
  application: <AppstoreOutlined className="text-purple-500" />,
};

// 类型名称映射
const TYPE_NAMES = {
  agent: "AI Agent",
  prompt: "提示词",
  application: "应用",
};

// 类型颜色映射
const TYPE_COLORS = {
  agent: "blue",
  prompt: "green",
  application: "purple",
};

export default function MarketplaceCard({ item, onPreview, onImport, onShare }: MarketplaceCardProps) {
  const [isLiked, setIsLiked] = useState(false); // 这里应该从用户数据获取
  const queryClient = useQueryClient();

  // 点赞/取消点赞
  const likeMutation = useMutation({
    mutationFn: (liked: boolean) =>
      liked ? marketplaceService.likeItem(item.id) : marketplaceService.unlikeItem(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceItems"] });
      message.success(isLiked ? "已取消点赞" : "点赞成功");
    },
    onError: () => {
      message.error("操作失败，请重试");
    },
  });

  // 记录查看
  const viewMutation = useMutation({
    mutationFn: () => marketplaceService.viewItem(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplaceItems"] });
    },
  });

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    likeMutation.mutate(newLikedState);
  };

  const handlePreview = () => {
    viewMutation.mutate();
    onPreview(item);
  };

  const handleImport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImport(item);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(item);
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "刚刚";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}分钟前`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}小时前`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card
      hoverable
      className="h-full flex flex-col relative"
      styles={{
        body: { padding: "16px", height: "100%", display: "flex", flexDirection: "column" },
      }}
    >
      {/* 头部：类型标识和评分 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {TYPE_ICONS[item.type]}
          <Tag color={TYPE_COLORS[item.type]} className="m-0">
            {TYPE_NAMES[item.type]}
          </Tag>
          {item.isFeatured && (
            <Badge.Ribbon text="精选" color="red" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Rate disabled defaultValue={item.rating} allowHalf className="text-xs" />
          <Text type="secondary" className="text-xs">
            {item.rating.toFixed(1)}
          </Text>
        </div>
      </div>

      {/* 标题和描述 */}
      <div className="flex-1 mb-3">
        <Title level={5} className="mb-2 line-clamp-2" title={item.title}>
          {item.title}
        </Title>
        <Text type="secondary" className="text-sm line-clamp-3" title={item.description}>
          {item.description}
        </Text>
      </div>

      {/* 标签 */}
      {item.tags.length > 0 && (
        <div className="mb-3">
          <Space size={[4, 4]} wrap>
            {item.tags.slice(0, 3).map((tag) => (
              <Tag key={tag} className="text-xs">
                #{tag}
              </Tag>
            ))}
            {item.tags.length > 3 && (
              <Tag className="text-xs">
                +{item.tags.length - 3}
              </Tag>
            )}
          </Space>
        </div>
      )}

      {/* 作者和时间 */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Avatar size={16} icon={<UserOutlined />} src={item.avatar} />
          <Text type="secondary" className="text-xs">
            {item.authorName}
          </Text>
        </div>
        <div className="flex items-center space-x-1">
          <ClockCircleOutlined />
          <Text type="secondary" className="text-xs">
            {formatTime(item.createdAt)}
          </Text>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <Space size={16}>
          <div className="flex items-center space-x-1">
            <EyeOutlined className="text-gray-400" />
            <Text type="secondary">{formatNumber(item.views)}</Text>
          </div>
          <div className="flex items-center space-x-1">
            <DownloadOutlined className="text-gray-400" />
            <Text type="secondary">{formatNumber(item.downloads)}</Text>
          </div>
          <div className="flex items-center space-x-1">
            <HeartOutlined className="text-gray-400" />
            <Text type="secondary">{formatNumber(item.likes)}</Text>
          </div>
        </Space>
        <Text type="secondary" className="text-xs">
          v{item.version}
        </Text>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div className="flex space-x-2">
          <Tooltip title={isLiked ? "取消点赞" : "点赞"}>
            <Button
              type="text"
              size="small"
              icon={isLiked ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
              onClick={handleLike}
              loading={likeMutation.isPending}
            />
          </Tooltip>
          {onShare && (
            <Tooltip title="分享">
              <Button
                type="text"
                size="small"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
              />
            </Tooltip>
          )}
        </div>
        <Button
          type="primary"
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleImport}
        >
          添加到工作区
        </Button>
      </div>
    </Card>
  );
}
