import { useQuery } from "@tanstack/react-query";
import { Button, Card, Tabs, Space, Typography, Tag, Descriptions, Empty, Table, Input, Spin } from "antd";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";

import knowledgeService from "@/api/services/knowledgeService";
import { IconButton, Iconify } from "@/components/icon";
import type { Knowledge, KnowledgeItem } from "#/entity";

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

// 模型类型颜色映射
const MODEL_TAG_COLORS = {
  ChatModel: "blue",
  EmbeddingModel: "green",
};

export default function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");

  // 获取知识库详情
  const { data: knowledgeResponse, isLoading: isLoadingKnowledge } = useQuery({
    queryKey: ["knowledge", id],
    queryFn: () => knowledgeService.getKnowledge(id as string),
    enabled: !!id,
  });

  // 从返回数据中提取知识库详情和知识项列表
  const knowledge = knowledgeResponse?.data;
  const knowledgeItems = knowledge?.knowledgeItems || [];

  // 搜索测试功能
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["knowledgeSearch", id, searchQuery],
    queryFn: () => {
      // 实际搜索API调用
      return Promise.resolve({ data: [] });
    },
    enabled: !!id && !!searchQuery && activeTab === "2",
  });

  const onSearch = (value: string) => {
    setSearchQuery(value);
  };

  const onBackClick = () => {
    navigate(-1);
  };

  // 知识项表格列定义 - 根据实际数据结构调整
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: '数据',
      dataIndex: 'data',
      key: 'data',
      ellipsis: true,
      render: (text: string) => text?.length > 50 ? `${text.substring(0, 50)}...` : text,
    },
    {
      title: '文件ID',
      dataIndex: 'fileId',
      key: 'fileId',
      width: 100,
      ellipsis: true,
    },
    {
      title: '数据量',
      dataIndex: 'dataCount',
      key: 'dataCount',
    },
    {
      title: '导入类型',
      dataIndex: 'importType',
      key: 'importType',
    },
    {
      title: '状态',
      dataIndex: 'knowledgeItemStatus',
      key: 'knowledgeItemStatus',
      render: (status: string) => (
        <Tag color={status === '可用' ? 'success' : 'default'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'creationTime',
      key: 'creationTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: 'QA类型',
      dataIndex: 'isQA',
      key: 'isQA',
      render: (isQA: boolean) => (
        isQA ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space size="small">
          <IconButton title="查看">
            <Iconify icon="solar:eye-bold-duotone" size={18} />
          </IconButton>
          <IconButton title="删除">
            <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
          </IconButton>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <div className="flex items-center mb-4">
          <Button icon={<Iconify icon="material-symbols:arrow-back" />} onClick={onBackClick} />
          <Title level={4} className="ml-4 mb-0">知识库详情</Title>
        </div>

        {isLoadingKnowledge ? (
          <div className="flex justify-center items-center p-8">
            <Spin tip="加载中..." />
          </div>
        ) : !knowledge ? (
          <Empty description="未找到知识库数据" />
        ) : (
          <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
            <Descriptions.Item label="名称">{knowledge.name}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={knowledge.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
                {knowledge.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="OCR支持">
              {knowledge.isOCR ? <Tag color="cyan">已启用</Tag> : <Tag>未启用</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="聊天模型">{knowledge.chatModel || '-'}</Descriptions.Item>
            <Descriptions.Item label="嵌入模型">{knowledge.embeddingModel || '-'}</Descriptions.Item>
            <Descriptions.Item label="文件数">{knowledge.fileCount || 0}</Descriptions.Item>
            <Descriptions.Item label="段落令牌">{knowledge.maxTokensPerParagraph || '-'}</Descriptions.Item>
            <Descriptions.Item label="行令牌">{knowledge.maxTokensPerLine || '-'}</Descriptions.Item>
            <Descriptions.Item label="重叠令牌">{knowledge.overlappingTokens || '-'}</Descriptions.Item>
            <Descriptions.Item label="描述" span={3}>
              {knowledge.description || "无描述"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="知识项列表" key="1">
            <div className="flex justify-end mb-4">
              <Button type="primary">上传文件</Button>
            </div>
            <Table
              columns={columns}
              dataSource={knowledgeItems}
              loading={isLoadingKnowledge}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="搜索测试" key="2">
            <div className="mb-4">
              <Search
                placeholder="输入搜索关键词"
                allowClear
                enterButton="搜索"
                size="large"
                onSearch={onSearch}
                loading={isSearching}
              />
            </div>
            {searchQuery && !isSearching && (
              <div>
                {searchResults?.data?.length ? (
                  <div>
                    {/* 搜索结果展示区域 */}
                    <div className="mb-2 text-gray-500">找到 {searchResults.data.length} 条结果</div>
                    {searchResults.data.map((item, index) => (
                      <Card key={index} className="mb-4">
                        {/* 搜索结果内容 */}
                        <div>搜索结果展示</div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="没有找到相关结果" />
                )}
              </div>
            )}
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </Space>
  );
}
