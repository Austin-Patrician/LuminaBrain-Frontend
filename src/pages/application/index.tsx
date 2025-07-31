import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import applicationService from "@/api/services/applicationService";
import { IconButton, Iconify } from "@/components/icon";
import CreateApplicationModalNew from "./components/CreateApplicationModalNew";
import EditApplicationModal from "./components/EditApplicationModal";
import PublishApplicationModal from "./components/PublishApplicationModal";
import styles from "./index.module.css";

import type { Application } from "#/entity";

const { Title, Paragraph } = Typography;

// 添加应用类型常量
const APPLICATION_TYPES = [
  { id: "BD5A8BA5-CCB0-4E77-91E6-2D4637F7F26D", name: "Chat" },
  { id: "A8E78CD3-4FBA-4B33-B996-FE5B04571C00", name: "Knowledge" },
  { id: "A8E78CD3-4FBA-4B33-B996-FE5B04571C01", name: "Text2SQL" },
  { id: "830ADB85-9B0E-413F-BB86-6E099059EDA7", name: "Agent" },
];

// 状态ID常量
const STATUS_TYPES = [
  { id: "DE546396-5B62-41E5-8814-4C072C74F26A", name: "Active" },
  { id: "57B7ADD1-2A86-4BFF-8A22-2324658D604A", name: "Inactive" },
];

// 模型类型颜色映射
const MODEL_TAG_COLORS = {
  Chat: "blue",
  Embedding: "green",
  Rerank: "purple",
  Image: "orange",
  Vector: "cyan",
};

// 更新搜索表单类型
type SearchFormFieldType = Pick<Application, "name" | "statusId"> & {
  applicationType: string;
};

export default function ApplicationPage() {
  const [searchForm] = Form.useForm();
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState<SearchFormFieldType>({
    name: "",
    statusId: "",
    applicationType: "",
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);

  // Query for fetching applications with search params and pagination
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["applications", searchParams, pagination],
    queryFn: () =>
      applicationService.getApplicationList({
        ...searchParams,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      }),
  });

  // 添加调试代码，查看返回的数据结构
  // 正确访问嵌套数据结构
  const applications: Application[] = data?.data || [];
  const totalCount = data?.total || 0;

  const deleteApplication = useMutation({
    mutationFn: applicationService.deleteApplication,
    onSuccess: () => {
      message.success("Application deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error) => {
      message.error(`Failed to delete application: ${error}`);
    },
  });

  const onSearch = () => {
    const values = searchForm.getFieldsValue();
    setSearchParams(values);
  };

  const onSearchFormReset = () => {
    searchForm.resetFields();
    setSearchParams({ name: "", statusId: "", applicationType: "" });
  };

  const onEdit = (application: Application) => {
    setCurrentApplication(application);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const onDelete = (id: string) => {
    deleteApplication.mutate(id);
  };

  const onShare = (app: Application) => {
    Modal.info({
      title: "Share Application",
      content: `Share link for "${app.name}" has been copied to clipboard.`,
    });
    // Implement actual share logic here
  };

  const onPublish = (app: Application) => {
    setCurrentApplication(app);
    setPublishModalVisible(true);
  };

  const handlePublishSuccess = () => {
    setPublishModalVisible(false);
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const onPageChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
  };

  const refreshList = () => {
    refetch();
  };

  return (
    <div className={styles.applicationPage}>
      <Space direction="vertical" size="large" className="w-full p-6">
        <Card>
          <Form form={searchForm}>
            <Row gutter={[16, 16]}>
              <Col span={24} lg={6}>
                <Form.Item<SearchFormFieldType>
                  label="Name"
                  name="name"
                  className="!mb-0"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24} lg={6}>
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
              <Col span={24} lg={6}>
                <Form.Item<SearchFormFieldType>
                  label="Type"
                  name="applicationType"
                  className="!mb-0"
                >
                  <Select allowClear placeholder="Select Application Type">
                    {APPLICATION_TYPES.map((type) => (
                      <Select.Option key={type.id} value={type.id}>
                        {type.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24} lg={6}>
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
          title="Application List"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              {t("新增应用")}
            </Button>
          }
          loading={isLoading}
        >
          <Row gutter={[24, 24]}>
            {applications.map((app: Application) => (
              <Col xs={24} sm={24} md={12} xl={8} key={app.id}>
                <Card
                  hoverable
                  className="h-full"
                  bodyStyle={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* 主要信息区域 - 顶部，视觉焦点 */}
                  <div className="mb-4">
                    {/* name、type和status在同一行并且垂直中心对齐 */}
                    <div className="flex items-center justify-between mb-4">
                      {/* 应用名称和类型 - 左侧 */}
                      <div className="flex items-center flex-1 min-w-0">
                        {/* 名称使用普通div而非Title，确保与标签垂直居中 */}
                        <div
                          className="text-base font-semibold text-gray-900 mr-3 truncate"
                          style={{ maxWidth: "60%" }}
                          title={app.name}
                        >
                          {app.name}
                        </div>

                        {/* 应用类型 - 与名称相同的垂直中心线 */}
                        {app.applicationTypeId && (
                          <Tag
                            color="processing"
                            className="flex-shrink-0 my-0"
                            style={{
                              borderRadius: "6px",
                              padding: "2px 8px",
                              fontSize: "14px",
                              fontWeight: "500",
                              lineHeight: "22px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {APPLICATION_TYPES.find(
                              (t) => t.id === app.applicationTypeId
                            )?.name || "Unknown"}
                          </Tag>
                        )}
                      </div>

                      {/* 状态 - 右侧，与左侧元素相同的垂直中心线 */}
                      <Tag
                        color={
                          app.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A"
                            ? "success"
                            : "error"
                        }
                        className="flex-shrink-0 my-0"
                        style={{
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          lineHeight: "22px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {app.statusId === "DE546396-5B62-41E5-8814-4C072C74F26A"
                          ? "Active"
                          : "Inactive"}
                      </Tag>
                    </div>
                  </div>

                  {/* 次要信息区域 - 中间，较小字体和灰色 */}
                  <div className="flex-1 mb-4">
                    {/* 描述信息 */}
                    <Paragraph
                      className="text-gray-500 text-sm leading-relaxed mb-3"
                      ellipsis={{ rows: 2, tooltip: app.description }}
                    >
                      {app.description || "No description available"}
                    </Paragraph>

                    {/* 应用类型相关的特殊信息 */}
                    {app.applicationTypeId ===
                      "A8E78CD3-4FBA-4B33-B996-FE5B04571C00" && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">聊天模型:</span>{" "}
                            {(app as any).chatModelName || "未配置"}
                          </div>
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">嵌入模型:</span>{" "}
                            {(app as any).embeddingModelName || "未配置"}
                          </div>
                          {(app as any).rerankModelName && (
                            <div className="text-xs text-gray-400">
                              <span className="font-medium">重排模型:</span>{" "}
                              {(app as any).rerankModelName}
                            </div>
                          )}
                        </div>
                      )}

                    {app.applicationTypeId ===
                      "830ADB85-9B0E-413F-BB86-6E099059EDA7" &&
                      (app as any).agentConfigs && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="text-xs text-gray-400 mr-1">
                            Agents:
                          </span>
                          {(app as any).agentConfigs
                            .slice(0, 3)
                            .map((agent: any, idx: number) => (
                              <Tag key={agent.agentId} color="cyan">
                                {agent.agentName}
                              </Tag>
                            ))}
                          {(app as any).agentConfigs.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{(app as any).agentConfigs.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                    {app.applicationTypeId ===
                      "BD5A8BA5-CCB0-4E77-91E6-2D4637F7F26D" && (
                        <div className="text-xs text-gray-400">
                          <span className="font-medium">聊天模型:</span>{" "}
                          {(app as any).chatModelName || "未配置"}
                        </div>
                      )}
                  </div>

                  {/* 操作区域 - 底部对齐 */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-end space-x-2">
                      <IconButton onClick={() => onEdit(app)} title="编辑应用">
                        <Iconify icon="solar:pen-bold-duotone" size={18} />
                      </IconButton>
                      <IconButton onClick={() => onShare(app)} title="分享应用">
                        <Iconify icon="solar:share-bold-duotone" size={18} />
                      </IconButton>
                      <IconButton onClick={() => onPublish(app)} title="发布应用">
                        <Iconify icon="solar:rocket-bold-duotone" size={18} />
                      </IconButton>
                      <Popconfirm
                        title="Delete the Application"
                        description="Are you sure you want to delete this application?"
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                        onConfirm={() => onDelete(app.id)}
                      >
                        <IconButton title="删除应用">
                          <Iconify
                            icon="mingcute:delete-2-fill"
                            size={18}
                            className="text-error"
                          />
                        </IconButton>
                      </Popconfirm>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
            {applications.length === 0 && (
              <Col span={24}>
                <div className="flex justify-center p-8 text-gray-500">
                  No applications found
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
                showQuickJumper
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
                }
              />
            </div>
          )}
        </Card>
        <CreateApplicationModalNew
          visible={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          onSuccess={() => {
            setCreateModalVisible(false);
            refreshList();
          }}
        />
        <EditApplicationModal
          visible={editModalVisible}
          application={currentApplication}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={handleEditSuccess}
        />
        <PublishApplicationModal
          visible={publishModalVisible}
          application={currentApplication}
          onCancel={() => setPublishModalVisible(false)}
          onSuccess={handlePublishSuccess}
        />
      </Space>
    </div>
  );
}
