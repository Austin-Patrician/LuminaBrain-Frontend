import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Popconfirm,
  message,
  Tag,
  Tooltip,
  Modal,
  Typography,
  Row,
  Col,
  Pagination,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  HistoryOutlined,
  CopyOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import type { ColumnType } from 'antd/es/table';

import ModalMarkdown from '@/components/markdown/modal-markdown';
import { getPromptHistory, deletePromptHistory, deletePromptHistoryBatch } from '@/api/services/promptService';
import type { PromptHistory, PromptHistoryQuery } from '../types';

const { Search } = Input;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function PromptHistoryPage() {
  const navigate = useNavigate();

  // 数据状态
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PromptHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 查询参数
  const [query, setQuery] = useState<PromptHistoryQuery>({
    pageNumber: 1,
    pageSize: 10,
    keyword: '',
    optimizedType: '',
  });

  // UI状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PromptHistory | null>(null);

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {

      console.log('查询参数:');
      const response = await getPromptHistory(query);

      console.log('获取历史记录:', response);
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error('获取历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, [query]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setQuery(prev => ({
      ...prev,
      keyword: value,
      page: 1,
    }));
  };

  // 处理类型筛选
  const handleTypeFilter = (value: string) => {
    setQuery(prev => ({
      ...prev,
      optimizedType: value,
      pageNumber: 1,
    }));
  };

  // 处理分页
  const handlePageChange = (page: number, pageSize?: number) => {
    setQuery(prev => ({
      ...prev,
      pageNumber: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // 查看详情
  const handleViewDetail = (record: PromptHistory) => {
    setCurrentRecord(record);
    setShowDetailModal(true);
  };

  // 删除单个记录
  const handleDelete = async (id: string) => {
    try {
      await deletePromptHistory(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    try {
      await deletePromptHistoryBatch(selectedRowKeys);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 复制内容
  const handleCopy = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      message.success(`${label}已复制到剪贴板`);
    } catch (error) {
      message.error('复制失败');
    }
  };

  // 截取文本
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '暂无';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // 表格列定义
  const columns: ColumnType<PromptHistory>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text code>{text.substring(0, 21)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: '原始提示词',
      dataIndex: 'prompt',
      key: 'prompt',
      width: 300,
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="max-w-xs overflow-hidden">
            <Text>{truncateText(text, 80)}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: '优化类型',
      dataIndex: 'optimizedType',
      key: 'optimizedType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'FunctionCalling' ? 'blue' : 'green'}>
          {type === 'FunctionCalling' ? 'Function Calling' : '通用优化'}
        </Tag>
      ),
    },
    {
      title: '优化需求',
      dataIndex: 'requirement',
      key: 'requirement',
      width: 200,
      render: (text: string) => (
        <Text type="secondary">{truncateText(text, 50)}</Text>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text: string) => (
        <Text>{text ? new Date(text).toLocaleString() : '未知'}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys as string[]);
    },
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-2 flex items-center">
              <HistoryOutlined className="mr-2" />
              提示词优化历史
            </Title>
            <Paragraph className="text-gray-600 mb-0">
              查看和管理所有的提示词优化历史记录，支持搜索、筛选和批量操作
            </Paragraph>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </Card>

      {/* 搜索和筛选区域 */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索提示词内容..."
              allowClear
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="筛选优化类型"
              allowClear
              onChange={handleTypeFilter}
              size="large"
              className="w-full"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="F5815EFC-F118-49D5-9639-D96D6057BA50">通用优化</Option>
              <Option value="273694F9-7C4D-422E-876C-0AB11C751373">Function Calling</Option>

              <Option value="081C3107-841F-49FA-8DE1-097B911ABCA9">通用优化深度思考</Option>
              <Option value="06C97D09-4499-40A2-AE09-214486642657">Function Calling 深度思考</Option>
              <Option value="E004AC5F-F9BD-4332-8A86-B4CD200DA992">Image</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <div className="flex justify-end space-x-2">
              <Popconfirm
                title={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                onConfirm={handleBatchDelete}
                disabled={selectedRowKeys.length === 0}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无历史记录"
              />
            ),
          }}
        />

        {/* 分页 */}
        {total > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={query.pageNumber}
              pageSize={query.pageSize}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }
              onChange={handlePageChange}
              pageSizeOptions={['5', '10']}
            />
          </div>
        )}
      </Card>

      {/* 详情模态框 */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <EyeOutlined className="text-blue-500" />
            <span>优化历史详情</span>
          </div>
        }
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        width={1200}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
          </div>
        }
      >
        {currentRecord && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card size="small" title="基本信息">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text strong>记录ID：</Text>
                    <Text code>{currentRecord.id}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text strong>优化类型：</Text>
                    <Tag color={currentRecord.optimizedType === 'FunctionCalling' ? 'blue' : 'green'}>
                      {currentRecord.optimizedType === 'FunctionCalling' ? 'Function Calling' : '通用优化'}
                    </Tag>
                  </div>
                </Col>

                <Col span={12}>
                  <div>
                    <Text strong>创建时间：</Text>
                    <Text>{currentRecord.createdAt ? new Date(currentRecord.createdAt).toLocaleString() : '未知'}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 原始提示词 */}
            <Card
              size="small"
              title={
                <div className="flex items-center justify-between">
                  <span>原始提示词</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(currentRecord.prompt, '原始提示词')}
                  >
                    复制
                  </Button>
                </div>
              }
            >
              <div className="bg-gray-50 p-4 rounded border max-h-60 overflow-auto">
                <Text>{currentRecord.prompt}</Text>
              </div>
            </Card>

            {/* 优化需求 */}
            {currentRecord.requirement && (
              <Card
                size="small"
                title={
                  <div className="flex items-center justify-between">
                    <span>优化需求</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(currentRecord.requirement, '优化需求')}
                    >
                      复制
                    </Button>
                  </div>
                }
              >
                <div className="bg-blue-50 p-4 rounded border max-h-40 overflow-auto">
                  <Text>{currentRecord.requirement}</Text>
                </div>
              </Card>
            )}

            {/* 深度推理 */}
            {currentRecord.deepReasoning && (
              <Card
                size="small"
                title={
                  <div className="flex items-center justify-between">
                    <span>深度推理过程</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(currentRecord.deepReasoning, '深度推理过程')}
                    >
                      复制
                    </Button>
                  </div>
                }
              >
                <div className="bg-orange-50 p-4 rounded border max-h-60 overflow-auto">
                  <ModalMarkdown>{currentRecord.deepReasoning}</ModalMarkdown>
                </div>
              </Card>
            )}

            {/* 优化结果 */}
            {currentRecord.result && (
              <Card
                size="small"
                title={
                  <div className="flex items-center justify-between">
                    <span>优化结果</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(currentRecord.result, '优化结果')}
                    >
                      复制
                    </Button>
                  </div>
                }
              >
                <div className="bg-green-50 p-4 rounded border max-h-60 overflow-auto">
                  <ModalMarkdown>{currentRecord.result}</ModalMarkdown>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
