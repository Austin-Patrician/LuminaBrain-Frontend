import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Typography,
  Input,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CopyOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import { flowService, FlowDataRaw, FlowListParams } from '@/api/services/flowService';

const { Title, Text } = Typography;
const { Search } = Input;

// 使用从 flowService 导入的类型
type FlowData = FlowDataRaw;

const AgentFlowListPage: React.FC = () => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<FlowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadFlows();
  }, []);

  // 加载流程列表 - 使用 flowService.getFlows()
  const loadFlows = async () => {
    setLoading(true);
    try {
      const params: FlowListParams = {
        search: searchText || undefined,
      };

      const flowsData = await flowService.getFlows(params);
      setFlows(flowsData);
    } catch (error) {
      console.error('Load flows error:', error);
      message.error('加载流程列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 重新加载数据 - 当搜索条件变化时
  useEffect(() => {
    if (searchText !== '') {
      const timer = setTimeout(() => {
        loadFlows();
      }, 500); // 防抖，500ms后执行搜索

      return () => clearTimeout(timer);
    } else {
      loadFlows();
    }
  }, [searchText]);

  // 创建新流程
  const handleCreateFlow = () => {
    navigate('/agentFlow/editor');
  };

  // 编辑流程
  const handleEditFlow = (flowId: string) => {
    navigate(`/agentFlow/editor?id=${flowId}`);
  };

  // 复制流程 - 使用 flowService.copyFlow()
  const handleCopyFlow = async (flow: FlowData) => {
    try {
      if (!flow.id) {
        message.error('流程ID不存在');
        return;
      }

      await flowService.copyFlow(flow.id, `${flow.name} - 副本`);
      message.success(`流程 "${flow.name}" 复制成功`);
      loadFlows(); // 重新加载列表
    } catch (error) {
      console.error('Copy flow error:', error);
      message.error('复制流程失败');
    }
  };

  // 删除流程 - 使用 flowService.deleteFlow()
  const handleDeleteFlow = async (flowId: string) => {
    try {
      await flowService.deleteFlow(flowId);
      message.success('删除成功');
      loadFlows(); // 重新加载列表
    } catch (error) {
      console.error('Delete flow error:', error);
      message.error('删除失败');
    }
  };

  // 运行流程 - 使用 flowService.runFlow()
  const handleRunFlow = async (flow: FlowData) => {
    if (flow.status !== 'published') {
      message.warning('只有已发布的流程才能运行');
      return;
    }

    try {
      if (!flow.id) {
        message.error('流程ID不存在');
        return;
      }

      await flowService.runFlow(flow.id);
      message.success(`流程 "${flow.name}" 开始运行`);
    } catch (error) {
      console.error('Run flow error:', error);
      message.error('运行流程失败');
    }
  };

  // 获取状态标签
  const getStatusTag = (status: FlowData['status']) => {
    const statusConfig = {
      draft: { color: 'default', text: '草稿' },
      published: { color: 'success', text: '已发布' },
      archived: { color: 'warning', text: '已归档' }
    };

    // 处理 undefined 或无效的 status 值
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<FlowData> = [
    {
      title: '流程名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          <div className="text-sm text-gray-500 mt-1">{record.description}</div>
        </div>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.description.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: '节点统计',
      key: 'stats',
      width: 120,
      render: (_, record) => (
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{record.nodeCount}</div>
          <div className="text-xs text-gray-500">节点</div>
          <div className="text-sm text-gray-600">{record.connectionCount} 连接</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
      filters: [
        { text: '草稿', value: 'draft' },
        { text: '已发布', value: 'published' },
        { text: '已归档', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div>
          {tags?.map(tag => (
            <Tag key={tag} className="mb-1">
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      render: (text, record) => (
        <div>
          <div className="text-sm">{text}</div>
          <div className="text-xs text-gray-500">by {record.createdBy}</div>
        </div>
      ),
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleEditFlow(record.id)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditFlow(record.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleRunFlow(record)}
            disabled={record.status !== 'published'}
          >
            运行
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyFlow(record)}
          >
            复制
          </Button>
          <Popconfirm
            title="确定要删除这个流程吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDeleteFlow(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // 过滤后的数据
  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchText.toLowerCase()) ||
    flow.description.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 页面头部 */}
      <div className="mb-6">
        <Title level={2} className="mb-2">智能工作流管理</Title>
        <Text className="text-gray-600">创建和管理您的AI工作流程</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总流程数"
              value={flows.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已发布"
              value={flows.filter(f => f.status === 'published').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="草稿"
              value={flows.filter(f => f.status === 'draft').length}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="总节点数"
              value={flows.reduce((sum, f) => sum + f.nodeCount, 0)}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Search
              placeholder="搜索流程名称或描述"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            {selectedRowKeys.length > 0 && (
              <div className="flex items-center gap-2">
                <Text className="text-gray-600">
                  已选择 {selectedRowKeys.length} 项
                </Text>
                <Button size="small" danger>
                  批量删除
                </Button>
              </div>
            )}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateFlow}
            size="large"
          >
            创建新流程
          </Button>
        </div>
      </Card>

      {/* 流程列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredFlows}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            total: filteredFlows.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} 共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default AgentFlowListPage;