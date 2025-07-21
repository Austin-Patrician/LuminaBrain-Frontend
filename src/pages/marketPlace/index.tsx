import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Typography, message, Spin } from "antd";

import CategorySidebar from "./components/CategorySidebar";
import FilterNavigation from "./components/FilterNavigation";
import DifyStyleCard from "./components/DifyStyleCard";
import PreviewModal from "./components/PreviewModal";
import AddToWorkspaceModal from "./components/AddToWorkspaceModal";
import { mockMarketplaceService } from "./mockData";
import type {
  MarketplaceItem,
  SearchParams,
  MarketplaceItemType,
} from "./types/marketplace";

const { Title, Text } = Typography;

export default function MarketplacePage() {
  // 状态管理
  const [selectedCategory, setSelectedCategory] = useState<string>("document-organize");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [previewItem, setPreviewItem] = useState<MarketplaceItem | null>(null);
  const [addToWorkspaceItem, setAddToWorkspaceItem] = useState<MarketplaceItem | null>(null);

  // 搜索参数
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keyword: "",
    type: "all",
    sortBy: "latest",
    pageNumber: 1,
    pageSize: 12,
  });

  // 查询数据
  const {
    data: marketplaceData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["marketplaceItems", searchParams, selectedFilter],
    queryFn: async () => {
      const params: SearchParams = {
        ...searchParams,
        type: selectedFilter === "all" ? "all" : (selectedFilter as MarketplaceItemType),
      };
      return await mockMarketplaceService.getMarketplaceItems(params);
    },
  });

  const items = marketplaceData?.data?.data || [];

  // 处理分类选择
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // 这里可以根据分类筛选数据
  };

  // 处理新建分类
  const handleCreateNew = () => {
    message.info("新建分类功能即将开放");
  };

  // 处理筛选变更
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setSearchParams(prev => ({ ...prev, pageNumber: 1 }));
  };

  // 处理搜索
  const handleSearch = () => {
    message.info("搜索功能即将开放");
  };

  // 处理卡片点击预览
  const handleCardClick = (item: MarketplaceItem) => {
    setPreviewItem(item);
  };

  // 处理添加到工作区
  const handleAddToWorkspace = (item: MarketplaceItem) => {
    setPreviewItem(null);
    setAddToWorkspaceItem(item);
  };

  // 处理确认添加到工作区
  const handleConfirmAddToWorkspace = async (item: MarketplaceItem, options: any) => {
    try {
      const result = await mockMarketplaceService.importToWorkspace(item.id, options);
      if (result.data.success) {
        message.success(`成功将 "${item.title}" 添加到工作区`);
      } else {
        message.error(result.data.message || "添加失败");
      }
    } catch (error) {
      message.error("添加失败，请重试");
    }
  };

  // 处理分享
  const handleShare = (item: MarketplaceItem) => {
    const shareUrl = `${window.location.origin}/marketplace?item=${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    message.success("分享链接已复制到剪贴板");
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* 左侧边栏 */}
      <CategorySidebar
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onCreateNew={handleCreateNew}
      />

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col bg-white">
        {/* 页面标题区域 */}
        <div className="px-6 py-6 border-b border-gray-100">
          <Title level={2} className="mb-2 text-gray-900">
            探索应用
          </Title>
          <Text className="text-gray-600">
            使用这些模板应用程序，或根据您自己的用例创建自己的应用程序。
          </Text>
        </div>

        {/* 筛选导航栏 */}
        <FilterNavigation
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-auto">
          <Spin spinning={isLoading}>
            {items.length > 0 ? (
              <Row gutter={[24, 24]}>
                {items.map((item) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                    <DifyStyleCard
                      item={item}
                      onClick={() => handleCardClick(item)}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <Title level={4} className="text-gray-500 mb-2">
                  暂无应用
                </Title>
                <Text className="text-gray-400">
                  当前分类下暂无应用，试试其他分类或创建新的应用
                </Text>
              </div>
            )}
          </Spin>
        </div>
      </div>

      {/* 预览模态框 */}
      <PreviewModal
        item={previewItem}
        visible={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onAddToWorkspace={handleAddToWorkspace}
        onShare={handleShare}
      />

      {/* 添加到工作区模态框 */}
      <AddToWorkspaceModal
        item={addToWorkspaceItem}
        visible={!!addToWorkspaceItem}
        onClose={() => setAddToWorkspaceItem(null)}
        onConfirm={handleConfirmAddToWorkspace}
      />
    </div>
  );
}
