import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
  Pagination,
} from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { IconButton, Iconify } from "@/components/icon";
import CreateAgentModal from "./components/CreateAgentModal";
import EditAgentModal from "./components/EditAgentModal";

// 模拟的Agent服务API
const agentService = {
  getAgentList: async (params: any) => {
    // 模拟API调用
    return { data: [], total: 0 };
  },
  createAgent: async (data: any) => {
    // 模拟API调用
    return data;
  },
  updateAgent: async (data: any) => {
    // 模拟API调用
    return data;
  },
  deleteAgent: async (id: string) => {
    // 模拟API调用
    return id;
  },
};

// Agent类型定义
type Agent = {
  id: string;
  name: string;
  instructions: string;
  functionChoiceBehavior: string;
  serviceId: string;
  statusId: string;
  topP: number;
  temperature: number;
  maxTokens: number;
  createdAt: string;
};

// 函数选择行为选项
const FUNCTION_CHOICE_BEHAVIORS = [
  { id: "auto", name: "自动" },
  { id: "required", name: "必需" },
  { id: "none", name: "无" },
];

// 服务ID选项
const SERVICE_IDS = [
  { id: "openai", name: "OpenAI" },
  { id: "azure-openai", name: "Azure OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google-ai", name: "Google AI" },
];

// 状态选项
const STATUS_TYPES = [
  { id: "active", name: "活跃" },
  { id: "inactive", name: "非活跃" },
];

// 搜索表单类型
type SearchFormFieldType = {
  name: string;
  statusId: string;
  serviceId: string;
};

const { Title, Paragraph } = Typography;

export default function AgentPage() {
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchFormFieldType>({
    name: "",
    statusId: "",
    serviceId: "",
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  // 查询Agent列表
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agents", searchParams, pagination],
    queryFn: () =>
      agentService.getAgentList({
        ...searchParams,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }),
  });

  // 从查询结果中提取数据
  const agents: Agent[] = data?.data || [];
  const totalCount = data?.total || 0;

  // 创建、更新、删除的mutation
  const createAgent = useMutation({
    mutationFn: agentService.createAgent,
    onSuccess: () => {
      message.success("Agent创建成功");
      setCreateModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (error) => {
      message.error(`创建Agent失败: ${error}`);
    },
  });

  const updateAgent = useMutation({
    mutationFn: agentService.updateAgent,
    onSuccess: () => {
      message.success("Agent更新成功");
      setEditModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (error) => {
      message.error(`更新Agent失败: ${error}`);
    },
  });

  const deleteAgent = useMutation({
    mutationFn: agentService.deleteAgent,
    onSuccess: () => {
      message.success("Agent删除成功");
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (error) => {
      message.error(`删除Agent失败: ${error}`);
    },
  });

  // 搜索处理
  const onSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
  };

  const onSearchFormReset = () => {
    searchForm.resetFields();
    setSearchParams({ name: "", statusId: "", serviceId: "" });
  };

  // Agent操作
  const onEdit = (agent: Agent) => {
    setCurrentAgent(agent);
    setEditModalVisible(true);
  };

  const onDelete = (id: string) => {
    deleteAgent.mutate(id);
  };

  const onPageChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  const refreshList = () => {
    refetch();
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="名称" name="name" className="!mb-0">
                <Input placeholder="搜索Agent名称" />
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="状态" name="statusId" className="!mb-0">
                <Select allowClear placeholder="选择状态">
                  {STATUS_TYPES.map((status) => (
                    <Select.Option key={status.id} value={status.id}>
                      <Tag color={status.id === "active" ? "success" : "error"}>
                        {status.name}
                      </Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <Form.Item<SearchFormFieldType> label="服务" name="serviceId" className="!mb-0">
                <Select allowClear placeholder="选择服务">
                  {SERVICE_IDS.map((service) => (
                    <Select.Option key={service.id} value={service.id}>
                      {service.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={6}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>重置</Button>
                <Button type="primary" className="ml-4" onClick={onSearch}>
                  搜索
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="Agent列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            {t("新增Agent")}
          </Button>
        }
        loading={isLoading}
      >
        <Row gutter={[24, 24]}>
          {agents.map((agent: Agent) => (
            <Col xs={24} sm={24} md={12} xl={8} key={agent.id}>
              <Card hoverable className="h-full flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <Title level={5} className="m-0">
                    {agent.name}
                  </Title>
                  <Tag color={agent.statusId === "active" ? "success" : "error"}>
                    {agent.statusId === "active" ? "活跃" : "非活跃"}
                  </Tag>
                </div>

                {/* 指令信息 */}
                <Paragraph className="mb-4 text-left" ellipsis={{ rows: 2 }}>
                  {agent.instructions || "无指令说明"}
                </Paragraph>

                {/* 服务信息 */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <Tag color="blue">
                    {SERVICE_IDS.find(s => s.id === agent.serviceId)?.name || agent.serviceId}
                  </Tag>
                  <Tag color="green">
                    函数选择: {FUNCTION_CHOICE_BEHAVIORS.find(f => f.id === agent.functionChoiceBehavior)?.name || agent.functionChoiceBehavior}
                  </Tag>
                  {agent.topP && <Tag color="orange">Top P: {agent.topP}</Tag>}
                  {agent.temperature && <Tag color="purple">Temperature: {agent.temperature}</Tag>}
                </div>

                {/* 操作按钮 */}
                <div className="mt-auto flex justify-end space-x-2 pt-2 border-t">
                  <IconButton onClick={() => onEdit(agent)}>
                    <Iconify icon="solar:pen-bold-duotone" size={18} />
                  </IconButton>
                  <Popconfirm
                    title="确认删除此Agent?"
                    okText="是"
                    cancelText="否"
                    placement="left"
                    onConfirm={() => onDelete(agent.id)}
                  >
                    <IconButton>
                      <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                    </IconButton>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
          {agents.length === 0 && (
            <Col span={24}>
              <div className="flex justify-center p-8 text-gray-500">未找到Agent</div>
            </Col>
          )}
        </Row>
        {totalCount > 0 && (
          <div className="flex justify-end mt-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={totalCount}
              onChange={onPageChange}
              showSizeChanger
            />
          </div>
        )}
      </Card>

      <CreateAgentModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          refreshList();
        }}
      />

      {currentAgent && (
        <EditAgentModal
          visible={editModalVisible}
          agent={currentAgent}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={() => {
            setEditModalVisible(false);
            refreshList();
          }}
        />
      )}
    </Space>
  );
}
