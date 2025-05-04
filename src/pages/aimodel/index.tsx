import React, { useState, useEffect } from "react";
import {
  Collapse,
  Card,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
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
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { aimodelService } from "@/api/services/aimodelService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AIModel } from "#/entity";
import LLMIcon from "@/components/icon/llmIcon";
import { LLMFactory, IconMap } from "@/constant/llm"; // 确保正确导入

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { Option } = Select;

// 模型类型颜色映射
const MODEL_TYPE_COLORS = {
  Chat: "blue",
  Embedding: "green",
  Rerank: "purple",
  Image: "orange",
  Type: "cyan",
};

// 模型类型图标映射
const MODEL_TYPE_ICONS = {
  Chat: <RobotOutlined />,
  Embedding: <ApiOutlined />,
  Rerank: <SettingOutlined />,
  Image: <ApiOutlined />,
  Type: <ApiOutlined />,
};

const ModelManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 使用 React Query 获取模型数据
  const { data, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: aimodelService.getModels,
  });

  // 使用 React Query 更新模型配置
  const updateModelMutation = useMutation({
    mutationFn: aimodelService.updateModel,
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

  // 根据 isConfigured 过滤模型
	const models: AIModel[] = (data && "data" in data ? data.data : []) || [];
  const configuredModels = models.filter((model) => model.isConfigured);
  const availableModels = models.filter((model) => !model.isConfigured);

  // 处理设置编辑
  const handleEditSettings = (model: AIModel) => {
    setCurrentModel(model);
    form.setFieldsValue({
      apiUrl: model.endPoint || "",
      apiKey: model.modelKey || "",
    });
    setIsModalVisible(true);
  };

  // 处理分享
  const handleShare = (model: AIModel) => {
    aimodelService
      .shareModel(model.id)
      .then((response) => {
        if (response.success) {
          Modal.info({
            title: `分享 ${model.modelName}`,
            content: (
              <div>
                <p>模型配置分享链接已生成</p>
                <Input readOnly value={response.data.shareUrl} />
              </div>
            ),
          });
        }
      })
      .catch(() => {
        message.error("生成分享链接失败");
      });
  };

  // 保存设置
  const handleSaveSettings = () => {
    form.validateFields().then((values) => {
      if (currentModel) {
        const updatedModel = {
          ...currentModel,
          apiUrl: values.apiUrl,
          apiKey: values.apiKey,
          isConfigured: true,
        };
        updateModelMutation.mutate(updatedModel);
      }
    });
  };

  // 添加可用模型
  const handleAddModel = (model: AIModel) => {
    setCurrentModel(model);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 渲染已配置的模型卡片
  const renderConfiguredModelCard = (model: AIModel) => (
    <Card
      key={model.id}
      style={{
        marginBottom: 16,
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.09)",
      }}
    >
      <Row align="middle" gutter={16}>
        <Col span={1}>
          <LLMIcon provider={model.provider} size={32} />
        </Col>
        <Col span={15}>
          <Space direction="vertical" size={0}>
            <Space>
              <Text strong>{model.modelName}</Text>
              <Tag color={MODEL_TYPE_COLORS[model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS]}>
                {MODEL_TYPE_ICONS[model.aiModelTypeName as keyof typeof MODEL_TYPE_ICONS]} {model.aiModelTypeName}
              </Tag>
              {model.provider && <Tag color="default">{model.provider}</Tag>}
            </Space>
            {model.modelDescription && <Text type="secondary">{model.modelDescription}</Text>}
          </Space>
        </Col>
        <Col span={8} style={{ textAlign: "right" }}>
          <Space>
            <Button icon={<ShareAltOutlined />} onClick={() => handleShare(model)}>
              分享
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditSettings(model)}>
              编辑设置
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // 渲染待添加的模型卡片 - 图标更大更突出
  const renderAvailableModelCard = (model: AIModel) => (
    <Col key={model.id} xs={24} sm={12} md={8} lg={8} xl={6} style={{ marginBottom: 16 }}>
      <Card
        hoverable
        style={{
          height: 250,
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
        bodyStyle={{
          padding: "16px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 顶部图标和类型信息 */}
        <Row align="middle" style={{ marginBottom: 12 }}>
          <Col span={8}>
            <div
              style={{
                fontSize: 60, // 增加图标大小
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                height: 80, // 固定高度以保持一致
                width: 80, // 固定宽度
                backgroundColor: MODEL_TYPE_COLORS[model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS] + "15", // 带透明度的背景
                borderRadius: "12px", // 圆角边框
                padding: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                border: `1px solid ${MODEL_TYPE_COLORS[model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS] + "30"}`,
              }}
            >
              <LLMIcon provider={model.provider} size={60} />
            </div>
          </Col>
          <Col span={16} style={{ textAlign: "right" }}>
            <Tag color={MODEL_TYPE_COLORS[model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS]} style={{ fontSize: "12px" }}>
              {MODEL_TYPE_ICONS[model.aiModelTypeName as keyof typeof MODEL_TYPE_ICONS]} {model.aiModelTypeName}
            </Tag>
          </Col>
        </Row>

        {/* 模型名称 */}
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ fontSize: "16px" }}>
            {model.modelName}
          </Text>
        </div>

        {/* 模型描述 - 字体更小 */}
        <div style={{ flex: 1 }}>
          <Text type="secondary" style={{ fontSize: "12px" }} ellipsis={{ tooltip: model.modelDescription }}>
            {model.modelDescription || "暂无描述"}
          </Text>
        </div>

        {/* 添加分割线 */}
        <Divider style={{ margin: "12px 0 8px 0" }} />

        {/* 添加按钮 */}
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            style={{
              backgroundColor: "#1890ff",
              borderColor: "#1890ff",
            }}
            onClick={() => handleAddModel(model)}
          >
            添加模型
          </Button>
        </div>
      </Card>
    </Col>
  );

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>AI 模型管理</Title>
      <Divider />

      <Collapse defaultActiveKey={["1"]} bordered={false}>
        <Panel
          header={<Title level={4}>已添加的模型 ({configuredModels.length})</Title>}
          key="1"
          style={{ backgroundColor: "#f7f7f7", borderRadius: "8px", marginBottom: "16px" }}
        >
          <div>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>加载中...</div>
            ) : (
              configuredModels.map((model: AIModel) => renderConfiguredModelCard(model))
            )}
            {!isLoading && configuredModels.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px" }}>暂无已配置的模型</div>
            )}
          </div>
        </Panel>

        <Panel
          header={<Title level={4}>待添加的模型 ({availableModels.length})</Title>}
          key="2"
          style={{ backgroundColor: "#f7f7f7", borderRadius: "8px" }}
        >
          <Row gutter={16}>
            {isLoading ? (
              <Col span={24} style={{ textAlign: "center", padding: "20px" }}>
                加载中...
              </Col>
            ) : (
              availableModels.map((model: AIModel) => renderAvailableModelCard(model))
            )}
            {!isLoading && availableModels.length === 0 && (
              <Col span={24} style={{ textAlign: "center", padding: "20px" }}>
                暂无可添加的模型
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
          <Form.Item name="apiUrl" label="API URL" rules={[{ required: true, message: "请输入API URL" }]}>
            <Input placeholder="https://api.example.com/v1" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key" rules={[{ required: true, message: "请输入API Key" }]}>
            <Input.Password placeholder="您的API密钥" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelManagementPage;
