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
import { usePathname, useRouter } from "@/router/hooks";

import knowledgeService from "@/api/services/knowledgeService";
import { IconButton, Iconify } from "@/components/icon";
import StepFormModal from "@/components/organization/StepFormModal";

import type { Knowledge } from "#/entity";

const { Title, Paragraph } = Typography;

// 状态ID常量
const STATUS_TYPES = [
  { id: "DE546396-5B62-41E5-8814-4C072C74F26A", name: "Active" },
  { id: "DISABLED_STATUS_ID", name: "Inactive" },
];

// 模型类型颜色映射 - 使用更柔和的颜色
const MODEL_TAG_COLORS = {
  ChatModel: "geekblue",
  EmbeddingModel: "purple",
};

// 更新颜色映射 - 使用更柔和的颜色
const FEATURE_COLORS = {
  active: "green",
  inactive: "volcano",
  ocr: "cyan",
};

// 添加一些颜色和图标对应
const STATUS_COLOR_MAP = {
  active: "success",
  inactive: "error",
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

  const [knowledgeModalProps, setKnowledgeModalProps] =
    useState<KnowledgeModalProps>({
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
      onOk: () => {
        const values = form.getFieldsValue();
        if (values.id) {
          updateKnowledge.mutate(values);
        } else {
          createKnowledge.mutate(values);
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
  // 访问嵌套数据结构
  const knowledgeBases: Knowledge[] = data?.data || [];
  const totalCount = data?.total || 0;

  // Mutations for create, update, delete
  const createKnowledge = useMutation({
    mutationFn: knowledgeService.createKnowledge,
    onSuccess: () => {
      message.success("Knowledge base created successfully");
      setKnowledgeModalProps((prev) => ({ ...prev, show: false }));
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error) => {
      message.error(`Failed to create knowledge base: ${error}`);
    },
  });

  const updateKnowledge = useMutation({
    mutationFn: knowledgeService.updateKnowledge,
    onSuccess: () => {
      message.success("Knowledge base updated successfully");
      setKnowledgeModalProps((prev) => ({ ...prev, show: false }));
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
    onError: (error) => {
      message.error(`Failed to update knowledge base: ${error}`);
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
    setKnowledgeModalProps((prev) => ({
      ...prev,
      show: true,
      title: "Create New Knowledge Base",
      formValue: {
        ...prev.formValue,
        id: "",
        name: "",
        description: "",
        statusId: "DE546396-5B62-41E5-8814-4C072C74F26A",
      },
    }));
  };

  const onView = (knowledgeBase: Knowledge) => {
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
      form.setFieldsValue(knowledgeModalProps.formValue);
    }
  }, [knowledgeModalProps.formValue, knowledgeModalProps.show, form]);

  return (
    <Space direction="vertical" size="large" className="w-full">
      <Card>
        <Form form={searchForm}>
          <Row gutter={[16, 16]}>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType>
                label="Name"
                name="name"
                className="!mb-0"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType>
                label="Status"
                name="statusId"
                className="!mb-0"
              >
                <Select allowClear placeholder="Select Status">
                  {STATUS_TYPES.map((status) => (
                    <Select.Option key={status.id} value={status.id}>
                      <Tag
                        color={
                          status.id === "DE546396-5B62-41E5-8814-4C072C74F26A"
                            ? "success"
                            : "error"
                        }
                      >
                        {status.name}
                      </Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24} lg={8}>
              <Form.Item<SearchFormFieldType>
                label="OCR"
                name="isOCR"
                className="!mb-0"
              >
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
                  <Tag
                    color={
                      kb.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A"
                        ? "success"
                        : "error"
                    }
                  >
                    {kb.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A"
                      ? "Active"
                      : "Inactive"}
                  </Tag>
                </div>

                {/* 描述信息 */}
                <Paragraph className="mb-4 text-left" ellipsis={{ rows: 2 }}>
                  {kb.description || "No description available"}
                </Paragraph>

                {/* 特性区域 */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {kb.chatModel && (
                    <Tag color={MODEL_TAG_COLORS.ChatModel}>{kb.chatModel}</Tag>
                  )}
                  {kb.embeddingModel && (
                    <Tag color={MODEL_TAG_COLORS.EmbeddingModel}>
                      {kb.embeddingModel}
                    </Tag>
                  )}
                  {kb.isOCR && (
                    <Tag color={FEATURE_COLORS.ocr}>OCR Enabled</Tag>
                  )}
                </div>

                {/* 统计信息 - 基本统计 */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    基本统计
                  </div>
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
                      <div className="font-medium">
                        {kb.pointStructCount || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 令牌配置 */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    令牌配置
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">段落令牌</div>
                      <div className="font-medium">
                        {kb.maxTokensPerParagraph || "-"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">行令牌</div>
                      <div className="font-medium">
                        {kb.maxTokensPerLine || "-"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500">重叠令牌</div>
                      <div className="font-medium">
                        {kb.overlappingTokens || "-"}
                      </div>
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
                      <Iconify
                        icon="mingcute:delete-2-fill"
                        size={18}
                        className="text-error"
                      />
                    </IconButton>
                  </Popconfirm>
                </div>
              </Card>
            </Col>
          ))}
          {knowledgeBases.length === 0 && (
            <Col span={24}>
              <div className="flex justify-center p-8 text-gray-500">
                No knowledge bases found
              </div>
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
      <StepFormModal
        title={knowledgeModalProps.title}
        open={knowledgeModalProps.show}
        formValue={knowledgeModalProps.formValue}
        onOk={knowledgeModalProps.onOk}
        onCancel={knowledgeModalProps.onCancel}
        form={form}
      />
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
