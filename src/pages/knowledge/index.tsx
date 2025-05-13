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
  InputNumber,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "@/router/hooks";

import knowledgeService from "@/api/services/knowledgeService";
import { IconButton, Iconify } from "@/components/icon";

import type { Knowledge } from "#/entity";

const { Title, Paragraph } = Typography;

// 状态ID常量
const STATUS_TYPES = [
  { id: "DE546396-5B62-41E5-8814-4C072C74F26A", name: "Active" },
  { id: "DISABLED_STATUS_ID", name: "Inactive" },
];

// 模型类型颜色映射
const MODEL_TAG_COLORS = {
  ChatModel: "blue",
  EmbeddingModel: "green",
};

// 添加一些颜色和图标对应
const FEATURE_COLORS = {
  active: "success",
  inactive: "error",
  ocr: "cyan",
};

// 模型类型ID常量
const MODEL_TYPE_IDS = {
  CHAT_MODEL: "0D826A41-45CE-4870-8893-A8D4FAECD3A4", // 替换为实际的聊天模型类型ID
  EMBEDDING_MODEL: "F37AF2F3-37A1-418B-8EEE-3675A5A36784", // 替换为实际的嵌入模型类型ID
};

// 更新搜索表单类型
type SearchFormFieldType = {
  name: string;
  statusId: string;
  isOCR: boolean;
};

export default function Knowledge() {
  const { push } = useRouter();
  const pathname = usePathname();
  const [searchForm] = Form.useForm();
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchFormFieldType>({
    name: "",
    statusId: "",
    isOCR: false,
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const queryClient = useQueryClient();

  // 添加loading状态
  const [submitLoading, setSubmitLoading] = useState(false);

  const [knowledgeModalProps, setKnowledgeModalProps] = useState<KnowledgeModalProps>({
    formValue: {
      id: "",
      name: "",
      description: "",
      statusId: "DE546396-5B62-41E5-8814-4C072C74F26A",
      chatModelID: "",
      chatModel: "",
      embeddingModelID: "",
      embeddingModel: "",
      maxTokensPerParagraph: 700,
      maxTokensPerLine: 300,
      overlappingTokens: 100,
      isOCR: false,
    },
    title: "New",
    show: false,
    onOk: async () => {
      try {
        // 表单验证
        await form.validateFields();

        // 获取表单值
        const values = form.getFieldsValue();

        // 设置提交状态
        setSubmitLoading(true);

        if (values.id) {
          // 更新操作
          await updateKnowledge.mutateAsync(values);
          // 成功消息由mutation的onSuccess处理，这里不再重复
        } else {
          // 创建操作
          await createKnowledge.mutateAsync(values);
          // 成功消息由mutation的onSuccess处理，这里不再重复
        }

        // 关闭模态框
        setKnowledgeModalProps((prev) => ({ ...prev, show: false }));

        // 刷新列表由mutation的onSuccess处理，这里不再重复
      } catch (error) {
        // 错误处理由mutation的onError处理，这里只处理表单验证错误
        if (!(error instanceof Error)) {
          message.error("表单验证失败，请检查输入");
        }
      } finally {
        // 无论成功失败都关闭loading
        setSubmitLoading(false);
      }
    },
    onCancel: () => {
      setKnowledgeModalProps((prev) => ({ ...prev, show: false }));
    },
  });

  // Query for fetching knowledge bases with search params and pagination
  const { data, isLoading } = useQuery({
    queryKey: ["knowledge", searchParams, pagination],
    queryFn: () =>
      knowledgeService.getKnowledgeList({
        ...searchParams,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }),
  });

  console.log("Knowledge Data:", data);
  // 访问知识库数据结构
  const knowledgeBases: Knowledge[] = data?.data || [];
  const totalCount = data?.total || 0;

  // 查询聊天模型列表
  const { data: chatModels } = useQuery({
    queryKey: ["chatModels"],
    queryFn: () => knowledgeService.getAiModelsByTypeId(MODEL_TYPE_IDS.CHAT_MODEL),
  });

  // 查询嵌入模型列表
  const { data: embeddingModels } = useQuery({
    queryKey: ["embeddingModels"],
    queryFn: () => knowledgeService.getAiModelsByTypeId(MODEL_TYPE_IDS.EMBEDDING_MODEL),
  });

  // 处理聊天模型选项
  const chatModelOptions = chatModels?.map((model) => ({
    label: model.aiModelName,
    value: model.aiModelId,
  })) || [];

  // 处理嵌入模型选项
  const embeddingModelOptions = embeddingModels?.map((model) => ({
    label: model.aiModelName,
    value: model.aiModelId,
  })) || [];

  // Mutations for create, update, delete
  const createKnowledge = useMutation({
    mutationFn: knowledgeService.createKnowledge,
    onSuccess: () => {
      message.success("知识库创建成功");
      // 刷新知识库列表
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        message.error(`创建知识库失败: ${error.message}`);
      } else {
        message.error("创建知识库失败，请重试");
      }
    },
  });

  const updateKnowledge = useMutation({
    mutationFn: knowledgeService.updateKnowledge,
    onSuccess: () => {
      message.success("知识库更新成功");
      // 刷新知识库列表
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error) => {
      if (error instanceof Error) {
        message.error(`更新知识库失败: ${error.message}`);
      } else {
        message.error("更新知识库失败，请重试");
      }
    },
  });

  const deleteKnowledge = useMutation({
    mutationFn: knowledgeService.deleteKnowledge,
    onSuccess: () => {
      message.success("Knowledge base deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error) => {
      message.error(`Failed to delete knowledge base: ${error}`);
    },
  });

  const onSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const onSearchFormReset = () => {
    searchForm.resetFields();
    setSearchParams({ name: "", statusId: "", isOCR: false });
  };

  const onCreate = () => {
    // 完全重置表单值，设置新的默认值
    const defaultFormValue = {
      id: "",
      name: "",
      description: "",
      statusId: "DE546396-5B62-41E5-8814-4C072C74F26A",
      chatModelID: null,
      chatModel: "",
      embeddingModelID: null,
      embeddingModel: "",
      maxTokensPerParagraph: 700,
      maxTokensPerLine: 300,
      overlappingTokens: 100,
      isOCR: false,
      avatar: "",
    };

    setKnowledgeModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Create New Knowledge Base",
      formValue: defaultFormValue,
    }));

    // 手动重置表单值
    form.resetFields();
    form.setFieldsValue(defaultFormValue);
  };

  const onView = (knowledgeBase: Knowledge) => {
    console.log("Knowledge Base ID:", knowledgeBase.id);
    push(`${pathname}/${knowledgeBase.id}`);
  };

  const onEdit = (formValue: Knowledge) => {
    setKnowledgeModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Edit Knowledge Base",
      formValue,
    }));
  };

  const onDelete = (id: string) => {
    deleteKnowledge.mutate(id);
  };

  const onPageChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  useEffect(() => {
    if (knowledgeModalProps.show) {
      // 强制重置表单后再设置值，确保表单值正确更新
      form.resetFields();
      form.setFieldsValue(knowledgeModalProps.formValue);
    }
  }, [knowledgeModalProps.formValue, knowledgeModalProps.show, form]);

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType> label="Name" name="name" className="!mb-0">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType> label="Status" name="statusId" className="!mb-0">
                <Select allowClear placeholder="Select Status">
                  {STATUS_TYPES.map((status) => (
                    <Select.Option key={status.id} value={status.id}>
                      <Tag color={status.id === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
                        {status.name}
                      </Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType> label="OCR" name="isOCR" className="!mb-0">
                <Select placeholder="Select OCR Status" defaultValue={false}>
                  <Select.Option value={true}>Enabled</Select.Option>
                  <Select.Option value={false}>Disabled</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={24}>
              <div className="flex justify-end">
                <Button onClick={onSearchFormReset}>Reset</Button>
                <Button type="primary" className="ml-4" onClick={onSearch}>
                  Search
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title="Knowledge Base List"
        extra={
          <Button type="primary" onClick={onCreate}>
            New
          </Button>
        }
        loading={isLoading}
      >
        <Row gutter={[24, 24]}>
          {knowledgeBases.map((kb: Knowledge) => (
            <Col xs={24} sm={24} md={12} xl={8} key={kb.id}>
              <Card hoverable className="h-full flex flex-col">
                <div className="mb-3 flex items-center justify-between">
                  <Title level={5} className="m-0">
                    {kb.name}
                  </Title>
                  <Tag color={kb.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "success" : "error"}>
                    {kb.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A" ? "Active" : "Inactive"}
                  </Tag>
                </div>

                {/* 描述信息 */}
                <Paragraph className="mb-4 text-left" ellipsis={{ rows: 2 }}>
                  {kb.description || "No description available"}
                </Paragraph>

                {/* 特性区域 */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {kb.chatModel && <Tag color={MODEL_TAG_COLORS.ChatModel}>{kb.chatModel}</Tag>}
                  {kb.embeddingModel && <Tag color={MODEL_TAG_COLORS.EmbeddingModel}>{kb.embeddingModel}</Tag>}
                  {kb.isOCR && <Tag color={FEATURE_COLORS.ocr}>OCR Enabled</Tag>}
                </div>

                {/* 统计信息 - 基本统计 */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">基本统计</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">文件数</div>
                      <div className="font-medium">{kb.fileCount || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">分片数</div>
                      <div className="font-medium">{kb.sliceCount || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">结构点数</div>
                      <div className="font-medium">{kb.totalTextCount || 0}</div>
                    </div>
                  </div>
                </div>

                {/* 令牌配置 */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-600 mb-1">令牌配置</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">段落令牌</div>
                      <div className="font-medium">{kb.maxTokensPerParagraph || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">行令牌</div>
                      <div className="font-medium">{kb.maxTokensPerLine || '-'}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">重叠令牌</div>
                      <div className="font-medium">{kb.overlappingTokens || '-'}</div>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="mt-auto flex justify-end space-x-2 pt-2 border-t">
                  <IconButton onClick={() => onView(kb)} title="查看">
                    <Iconify icon="solar:eye-bold-duotone" size={18} />
                  </IconButton>
                  <IconButton onClick={() => onEdit(kb)} title="编辑">
                    <Iconify icon="solar:pen-bold-duotone" size={18} />
                  </IconButton>
                  <Popconfirm
                    title="Delete this Knowledge Base?"
                    okText="Yes"
                    cancelText="No"
                    placement="left"
                    onConfirm={() => onDelete(kb.id)}
                  >
                    <IconButton title="删除">
                      <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                    </IconButton>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
          {knowledgeBases.length === 0 && (
            <Col span={24}>
              <div className="flex justify-center p-8 text-gray-500">No knowledge bases found</div>
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
      <Modal
        title={knowledgeModalProps.title}
        open={knowledgeModalProps.show}
        onOk={knowledgeModalProps.onOk}
        onCancel={knowledgeModalProps.onCancel}
        width={700}
        confirmLoading={submitLoading} // 添加loading状态到确认按钮
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="name" label="知识库名称" rules={[{ required: true, message: "请输入知识库名称" }]}>
            <Input placeholder="请输入知识库名称" />
          </Form.Item>

          <Form.Item name="description" label="知识库描述">
            <Input.TextArea rows={3} placeholder="请输入知识库描述" />
          </Form.Item>

          <Form.Item name="chatModelID" label="聊天模型" rules={[{ required: true, message: "请选择聊天模型" }]}>
            <Select placeholder="请选择聊天模型" options={chatModelOptions} allowClear />
          </Form.Item>

          <Form.Item name="embeddingModelID" label="嵌入模型" rules={[{ required: true, message: "请选择嵌入模型" }]}>
            <Select placeholder="请选择嵌入模型" options={embeddingModelOptions} allowClear />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="maxTokensPerParagraph" label="段落最大令牌数" initialValue={700}>
                <InputNumber min={1} max={2000} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxTokensPerLine" label="每行最大令牌数" initialValue={300}>
                <InputNumber min={1} max={1000} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="overlappingTokens" label="重叠令牌数" initialValue={100}>
                <InputNumber min={0} max={500} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isOCR" valuePropName="checked" label="启用OCR">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

type KnowledgeModalProps = {
  formValue: Partial<Knowledge>;
  title: string;
  show: boolean;
  onOk: VoidFunction;
  onCancel: VoidFunction;
};
