import React, { useState } from "react";
import {
  Collapse,
  Card,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  Divider,
  Row,
  Col,
  message,
} from "antd";
import {
  EditOutlined,
  ShareAltOutlined,
  PlusOutlined,
  CopyOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { aimodelService } from "@/api/services/aimodelService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AIModel, AIProvider, UpdateProviderModel } from "#/entity";
import LLMIcon from "@/components/icon/llmIcon";
import "./index.css";

const { Panel } = Collapse;
const { Title, Text } = Typography;

// 模型类型颜色映射
const MODEL_TYPE_COLORS = {
  Chat: "blue",
  Embedding: "green",
  Rerank: "purple",
  Image: "orange",
  Type: "cyan",
  Tts: "magenta",
};

const ModelManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  // 添加提供商模态框状态
  const [providerModalVisible, setProviderModalVisible] =
    useState<boolean>(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider | null>(
    null
  );
  const [providerForm] = Form.useForm();

  // 使用 React Query 获取模型数据
  const { data, isLoading } = useQuery<{
    success: boolean;
    statusCode: number;
    message: string;
    data: AIProvider[];
  }>({
    queryKey: ["models"],
    queryFn: aimodelService.getModels,
  });

  // 使用 React Query 更新模型配置
  const updateModelMutation = useMutation({
    mutationFn: aimodelService.updateProvider,
    onSuccess: (response) => {
      if (response.success) {
        message.success("模型配置已更新");
        queryClient.invalidateQueries({ queryKey: ["models"] });
        setIsModalVisible(false);
      }
    },
    onError: () => {
      message.error("更新模型配置失败");
    },
  });

  // 使用 React Query 更新提供商配置
  const updateProviderMutation = useMutation({
    mutationFn: aimodelService.updateProvider,
    onSuccess: (_) => {
      // 关闭加载中状态
      message.destroy("providerUpdate");

      // 先关闭弹窗
      setProviderModalVisible(false);
      // 然后显示成功消息
      message.success(`${currentProvider?.providerName} 提供商配置已更新`);
      // 最后刷新数据
      queryClient.invalidateQueries({ queryKey: ["models"] });
    },
    onError: (error) => {
      // 关闭加载中状态
      message.destroy("providerUpdate");

      console.error("Provider update error:", error);
      message.error("更新提供商配置失败");
    },
  });

  // 添加展开状态管理
  const [expandedProviders, setExpandedProviders] = useState<
    Record<string, boolean>
  >({});

  // 切换展开状态
  const toggleProviderExpand = (providerId: string) => {
    setExpandedProviders((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  // 根据 isConfigured 过滤提供商
  const providers: AIProvider[] = data || [];
  const configuredProviders = providers.filter(
    (provider) => provider.isConfigured
  );
  const availableProviders = providers.filter(
    (provider) => !provider.isConfigured
  );

  // 处理设置编辑
  const handleEditSettings = (model: AIModel) => {
    console.log("Editing settings for model:", model);
    setCurrentModel(model);
    form.setFieldsValue({
      apiUrl: model.endPoint || "",
      apiKey: model.modelKey || "",
    });
    setIsModalVisible(true);
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        message.success("分享链接已复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败，请手动复制");
      });
  };

  // 保存设置
  const handleSaveSettings = () => {
    console.log("执行UpdatreModelMutation");
    form.validateFields().then((values) => {
      if (currentModel) {
        const updatedModel: UpdateProviderModel = {
          id: currentModel.id,
          endpoint: values.apiUrl,
          modelKey: values.apiKey,
        };
        updateModelMutation.mutate(updatedModel);
      }
    });
  };

  // 处理添加提供商
  const handleAddProvider = (provider: AIProvider) => {
    setCurrentProvider(provider);
    providerForm.resetFields();
    setProviderModalVisible(true);
  };

  // 保存提供商配置
  const handleSaveProviderSettings = () => {
    providerForm
      .validateFields()
      .then((values) => {
        if (currentProvider) {
          // 显示加载中状态，设置duration为0表示不自动关闭
          message.loading({
            content: "正在更新提供商配置...",
            key: "providerUpdate",
            duration: 0,
          });

          // 构建API请求数据
          const updatedProvider: UpdateProviderModel = {
            id: currentProvider.id,
            endpoint: values.apiEndpoint,
            modelKey: values.apiKey,
          };

          // 调用mutation更新提供商
          updateProviderMutation.mutate(updatedProvider);
        }
      })
      .catch((errorInfo) => {
        console.error("表单验证失败:", errorInfo);
      });
  };

  // 渲染提供商卡片 - 重新设计
  const renderProviderCard = (provider: AIProvider) => (
    <Card
      key={provider.id}
      className="provider-card"
      bodyStyle={{ padding: "16px" }}
    >
      {/* 提供商信息和操作按钮区域 */}
      <Row align="middle" justify="space-between" gutter={16}>
        <Col>
          <Space size="middle" align="center">
            <div className="provider-icon-container">
              <LLMIcon provider={provider.providerName} size={40} />
            </div>
            <Text strong className="provider-name">
              {provider.providerName}
            </Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => handleAddProvider(provider)}
            >
              编辑
            </Button>
            <Button
              type={expandedProviders[provider.id] ? "primary" : "default"}
              icon={
                expandedProviders[provider.id] ? (
                  <CaretRightOutlined rotate={90} />
                ) : (
                  <CaretRightOutlined />
                )
              }
              onClick={() => toggleProviderExpand(provider.id)}
            >
              {expandedProviders[provider.id] ? "收起模型" : "展开模型"}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 模型列表部分 - 条件渲染 */}
      {expandedProviders[provider.id] && (
        <div className="models-expanded-section">
          <Divider className="models-divider" />
          <Row gutter={[16, 24]}>
            {provider.aiModels.map((model: AIModel) => (
              <Col key={model.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  className="model-card"
                  bodyStyle={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  {/* 模型头部区域 */}
                  <div className="model-header">
                    <div className="model-title-section">
                      <Text
                        strong
                        className="model-name"
                        ellipsis={{ tooltip: model.modelName }}
                      >
                        {model.modelName}
                      </Text>
                    </div>
                    <Tag
                      color={
                        MODEL_TYPE_COLORS[
                          model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS
                        ]
                      }
                      className="model-type-tag"
                    >
                      {model.aiModelTypeName}
                    </Tag>
                  </div>

                  {/* 模型描述区域 */}
                  <div className="model-description-section">
                    <Text
                      className="model-description"
                      title={model.modelDescription || "该模型暂无详细描述信息"}
                    >
                      {model.modelDescription || "该模型暂无详细描述信息"}
                    </Text>
                  </div>

                  {/* 操作区域 */}
                  <div className="model-actions">
                    <Button
                      size="small"
                      type="primary"
                      icon={<EditOutlined />}
                      className="model-config-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSettings(model);
                      }}
                    >
                      配置
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
            {provider.aiModels.length === 0 && (
              <Col span={24}>
                <div className="empty-models">
                  <Text className="empty-models-text">
                    该提供商暂无已添加的模型
                  </Text>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}
    </Card>
  );

  return (
    <div className="ai-model-page">
      <Title level={2}>AI 模型管理</Title>
      <Divider />

      <Collapse defaultActiveKey={["1"]} bordered={false}>
        <Panel
          header={
            <Title level={4}>
              已添加的提供商 ({configuredProviders.length})
            </Title>
          }
          key="1"
          className="panel-style configured-panel"
        >
          <div>
            {isLoading ? (
              <div className="loading-section">加载中...</div>
            ) : (
              configuredProviders.map((provider: AIProvider) =>
                renderProviderCard(provider)
              )
            )}
            {!isLoading && configuredProviders.length === 0 && (
              <div className="empty-configured-providers">
                暂无已配置的模型提供商
              </div>
            )}
          </div>
        </Panel>

        <Panel
          header={
            <Title level={4}>
              待添加的提供商 ({availableProviders.length})
            </Title>
          }
          key="2"
          className="panel-style"
        >
          <Row gutter={[16, 16]}>
            {isLoading ? (
              <Col span={24} className="loading-section">
                加载中...
              </Col>
            ) : (
              availableProviders.map((provider: AIProvider) => (
                <Col key={provider.id} xs={24} sm={12} md={8} lg={6} xl={6}>
                  <Card
                    hoverable
                    className="available-provider-card"
                    bodyStyle={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      padding: "20px",
                    }}
                  >
                    {/* 图标居中显示 */}
                    <div className="available-provider-icon-section">
                      <div className="available-provider-icon-container">
                        <LLMIcon provider={provider.providerName} size={50} />
                      </div>
                    </div>

                    {/* 提供商名称居中显示 */}
                    <div className="available-provider-name-section">
                      <Text strong className="available-provider-name">
                        {provider.providerName}
                      </Text>
                    </div>

                    {/* 标签居中显示 */}
                    <div className="available-provider-tags-section">
                      <div className="available-provider-tags-container">
                        {provider.tag.split(",").map((tag, index) => (
                          <Tag
                            key={index}
                            color="default"
                            className="available-provider-tag"
                          >
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    {/* 分隔线 */}
                    <Divider className="available-provider-divider" />

                    {/* 添加按钮 */}
                    <Button
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={() => handleAddProvider(provider)}
                      block
                    >
                      添加提供商
                    </Button>
                  </Card>
                </Col>
              ))
            )}
            {!isLoading && availableProviders.length === 0 && (
              <Col span={24} className="empty-available-providers">
                暂无可添加的模型提供商
              </Col>
            )}
          </Row>
        </Panel>
      </Collapse>

      {/* 模型设置表单 */}
      <Modal
        title={currentModel ? `配置 ${currentModel.modelName}` : "模型配置"}
        open={isModalVisible}
        onOk={handleSaveSettings}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="apiUrl"
            label="API URL"
            rules={[{ required: true, message: "请输入API URL" }]}
          >
            <Input placeholder="https://api.example.com/v1" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: "请输入API Key" }]}
          >
            <Input.Password placeholder="您的API密钥" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分享邀请函模态框 */}
      <Modal
        open={shareModalVisible}
        footer={null}
        onCancel={() => setShareModalVisible(false)}
        width={500}
        centered
        destroyOnClose
        className="share-invitation-modal"
        bodyStyle={{ padding: 0 }}
        style={{ background: "transparent" }}
        modalRender={(node) => <div className="modal-wrapper">{node}</div>}
      >
        <div
          style={{
            position: "relative",
            background: "linear-gradient(135deg, #1a365d 0%, #3490dc 100%)",
            borderRadius: "12px",
            overflow: "hidden",
            padding: 0,
            color: "white",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* 简化的背景 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 20%), radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 20%)",
            }}
          />

          {/* 内容区域 - 添加内边距 */}
          <div style={{ padding: "30px" }}>
            {/* LuminaBrain 标志 */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <Text
                style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}
              >
                LuminaBrain
              </Text>
            </div>

            {/* 邀请标题 */}
            <div
              style={{
                position: "relative",
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold",
                  display: "block",
                }}
              >
                模型分享邀请
              </Text>
            </div>

            {/* 模型图标 */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                margin: "20px 0",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                }}
              >
                {currentModel && (
                  <LLMIcon provider={currentModel.provider} size={80} />
                )}
              </div>
            </div>

            {/* 模型名称 */}
            <div
              style={{
                position: "relative",
                textAlign: "center",
                margin: "20px 0",
              }}
            >
              <Text
                style={{ color: "white", fontSize: "28px", fontWeight: "bold" }}
              >
                {currentModel?.modelName}
              </Text>
              {currentModel?.provider && (
                <Tag color="blue" style={{ marginLeft: 10 }}>
                  {currentModel.provider}
                </Tag>
              )}
            </div>

            {/* 分享链接 */}
            <div style={{ position: "relative", margin: "30px 0" }}>
              <Input.Group compact>
                <Input
                  style={{ width: "calc(100% - 40px)" }}
                  value={shareUrl}
                  readOnly
                  placeholder="分享链接"
                />
                <Button icon={<CopyOutlined />} onClick={handleCopyShareUrl} />
              </Input.Group>
            </div>

            {/* 按钮区域 */}
            <div
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                marginTop: "30px",
              }}
            >
              <Space>
                <Button onClick={() => setShareModalVisible(false)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={handleCopyShareUrl}
                  style={{
                    background:
                      "linear-gradient(45deg, #36d1dc 0%, #5b86e5 100%)",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(91, 134, 229, 0.4)",
                  }}
                >
                  确认分享
                </Button>
              </Space>
            </div>
          </div>
        </div>
      </Modal>

      {/* 添加提供商模态框 */}
      <Modal
        title={
          currentProvider
            ? `配置 ${currentProvider.providerName} 提供商`
            : "提供商配置"
        }
        open={providerModalVisible}
        onOk={handleSaveProviderSettings}
        onCancel={() => setProviderModalVisible(false)}
        destroyOnClose
      >
        <Form form={providerForm} layout="vertical">
          <Form.Item
            name="apiEndpoint"
            label="API 端点"
            rules={[{ required: true, message: "请输入API端点" }]}
          >
            <Input placeholder="https://api.provider.com/v1" />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[{ required: true, message: "请输入API Key" }]}
          >
            <Input.Password placeholder="您的API密钥" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagementPage;
