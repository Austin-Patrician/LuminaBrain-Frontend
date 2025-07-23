import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Typography, message, Spin } from "antd";

import FilterNavigation from "./components/FilterNavigation";
import DifyStyleCard from "./components/DifyStyleCard";
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
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
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

  // 根据搜索关键词和筛选条件过滤数据
  const filteredItems = items.filter(item => {
    const matchesKeyword = !searchKeyword ||
      item.title.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesFilter = selectedFilter === "all" || item.type === selectedFilter;
    return matchesKeyword && matchesFilter;
  });

  // 处理筛选变更
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setSearchParams(prev => ({ ...prev, pageNumber: 1 }));
  };

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  // 处理添加到工作区
  const handleAddToWorkspace = (item: MarketplaceItem) => {
    setAddToWorkspaceItem(item);
  };

  // 处理确认添加到工作区
  const handleConfirmAddToWorkspace = async (item: MarketplaceItem, options: any) => {
    try {
      // 调用接口传递参数：应用名称，图标，描述，应用id, 应用类型id
      const params = {
        applicationName: options.customName || item.title,
        icon: options.selectedIcon || '🤖',
        description: options.description || item.description,
        applicationId: item.id,
        applicationTypeId: item.type,
        ...options
      };

      const result = await mockMarketplaceService.importToWorkspace(item.id, params);
      if (result.data.success) {
        message.success(`成功将 "${item.title}" 添加到工作区`);
        setAddToWorkspaceItem(null);
      } else {
        message.error(result.data.message || "添加失败");
      }
    } catch (error) {
      message.error("添加失败，请重试");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* 主内容区 */}
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
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          <Spin spinning={isLoading}>
            {filteredItems.length > 0 ? (
              <Row gutter={[24, 24]}>
                {filteredItems.map((item) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
                    <DifyStyleCard
                      item={item}
                      onAddToWorkspace={handleAddToWorkspace}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <Title level={4} className="text-gray-500 mb-2">
                  {searchKeyword ? '未找到相关应用' : '暂无应用'}
                </Title>
                <Text className="text-gray-400">
                  {searchKeyword ? `没有找到包含 "${searchKeyword}" 的应用` : '当前分类下暂无应用，试试其他分类或创建新的应用'}
                </Text>
              </div>
            )}
          </Spin>
        </div>
      </div>

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
