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
  ConfigProvider
} from "antd";
import {
  EditOutlined,
  ShareAltOutlined,
  PlusOutlined,
  ApiOutlined,
  RobotOutlined,
  SettingOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { aimodelService } from "@/api/services/aimodelService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AIModel } from "#/entity";
import LLMIcon from "@/components/icon/llmIcon";
import { motion } from "framer-motion";

const { Panel } = Collapse;
const { Title, Text } = Typography;

// 模型类型颜色映射
const MODEL_TYPE_COLORS = {
  Chat: "blue",
  Embedding: "green",
  Rerank: "purple",
  Image: "orange",
  Type: "cyan",
};

type ModelsResponse = {
  success: boolean;
  data: AIModel[];
};

// 模型类型图标映射
const MODEL_TYPE_ICONS = {
  Chat: <RobotOutlined />,
  Embedding: <ApiOutlined />,
  Rerank: <SettingOutlined />,
  Image: <ApiOutlined />,
  Type: <ApiOutlined />,
};

const AIModelCard = ({ model, onAdd }: { model: AIModel; onAdd: () => void }) => (
  <ConfigProvider theme={{
    components: {
      Card: {
        bodyPadding: 16
      },
      Divider: {
        marginLG: 8
      },
      Button: {
        defaultBg: '#1890ff',
        colorText: 'white',
        defaultBorderColor: '#1890ff',
      },
      Tag: {
        fontSize: 12
      }
    },
  }}>
    <Col key={model.id} xs={24} sm={12} md={8} lg={8} xl={6} className="mb-4">
      <Card
        hoverable
        className=" flex flex-col rounded-lg bg-[#fff] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300"
        classNames={{
          body: 'flex-1',
          cover: 'h-1/2'
        }}
        styles={{
          body: {
            paddingTop: 4
          }
        }}
        cover={

          <div
            style={{ backgroundColor: MODEL_TYPE_COLORS[model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS] + "15" }}
            className=" w-fit p-2 rounded-full"
          >
            <LLMIcon provider={model.provider} size={60} />
          </div>}
      >
        <div className="w-full h-full flex flex-col">
          <Space className="w-full" direction="vertical" size={8}>
            <div className="flex flex-row">
              <Text strong className="text-base flex-1" ellipsis={{ tooltip: model.modelName }}>
                {model.modelName}
              </Text>
              <div>
                <Tag color={MODEL_TYPE_COLORS[model.aiModelTypeName as keyof typeof MODEL_TYPE_COLORS]}>
                  {MODEL_TYPE_ICONS[model.aiModelTypeName as keyof typeof MODEL_TYPE_ICONS]} {model.aiModelTypeName}
                </Tag>
              </div>
            </div>


            {/* 模型描述 - 字体更小 */}
            <div className="flex-1">
              <Text type="secondary" style={{ fontSize: '12px' }} ellipsis={{ tooltip: model.modelDescription }}>
                {model.modelDescription || "暂无描述"}
              </Text>
            </div>
          </Space>


          {/* 添加分割线 */}
          <Divider />

          {/* 添加按钮 */}
          <div className="">
            <Button
              icon={<PlusOutlined />}
              className="w-full"
              onClick={onAdd}
            >
              添加模型
            </Button>
          </div>
        </div>

      </Card>
    </Col>
  </ConfigProvider >
)

const ModelManagementPage: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<AIModel | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");

  // 使用 React Query 获取模型数据
  const { data, isLoading } = useQuery<AIModel[], Error>({
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
  const models: AIModel[] = data || [];
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
          setCurrentModel(model);
          setShareUrl(response.data.shareUrl);
          setShareModalVisible(true);
        }
      })
      .catch(() => {
        message.error("生成分享链接失败");
      });
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        message.success("分享链接已复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败，请手动复制");
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
              availableModels.map((model: AIModel) => <AIModelCard key={model.aiModelTypeId} model={model} onAdd={() => handleAddModel(model)} />)
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
      >
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1a365d 0%, #3490dc 100%)',
          borderRadius: '12px',
          overflow: 'hidden',
          padding: '30px',
          color: 'white',
          minHeight: '400px'
        }}>
          {/* 动态背景效果 */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                }}
                animate={{
                  x: [Math.random() * 400, Math.random() * 400],
                  y: [Math.random() * 400, Math.random() * 400],
                  scale: [Math.random() * 0.5 + 0.5, Math.random() * 0.5 + 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
              />
            ))}
          </div>

          {/* LuminaBrain 标志 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ marginBottom: '20px' }}
          >
            <Text style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
              LuminaBrain
            </Text>
          </motion.div>

          {/* 邀请标题 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            style={{ textAlign: 'center', marginBottom: '30px' }}
          >
            <Text style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'block' }}>
              模型分享邀请
            </Text>
          </motion.div>

          {/* 模型图标动画 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5
            }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              margin: '20px 0'
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              {currentModel && <LLMIcon provider={currentModel.provider} size={80} />}
            </div>
          </motion.div>

          {/* 模型名称 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            style={{ textAlign: 'center', margin: '20px 0' }}
          >
            <Text style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
              {currentModel?.modelName}
            </Text>
            {currentModel?.provider && (
              <Tag color="blue" style={{ marginLeft: 10 }}>
                {currentModel.provider}
              </Tag>
            )}
          </motion.div>

          {/* 分享链接 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            style={{ margin: '30px 0' }}
          >
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 40px)' }}
                value={shareUrl}
                readOnly
                placeholder="分享链接"
              />
              <Button icon={<CopyOutlined />} onClick={handleCopyShareUrl} />
            </Input.Group>
          </motion.div>

          {/* 按钮区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}
          >
            <Space>
              <Button onClick={() => setShareModalVisible(false)}>
                取消
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  onClick={handleCopyShareUrl}
                  style={{
                    background: 'linear-gradient(45deg, #36d1dc 0%, #5b86e5 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(91, 134, 229, 0.4)'
                  }}
                >
                  确认分享
                </Button>
              </motion.div>
            </Space>
          </motion.div>
        </div>
      </Modal>
    </div>
  );
};

export default ModelManagementPage;
