import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Switch,
  message,
  Space,
  Row,
  Col,
  Card,
  Typography,
  Tabs,
  theme,
  Tooltip,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import knowledgeService from "@/api/services/knowledgeService";
import { AiModelItem } from "#/entity";

const { TextArea } = Input;
const { Title } = Typography;
const { TabPane } = Tabs;

// AI模型类型ID常量
const MODEL_TYPE_IDS = {
  CHAT: "0D826A41-45CE-4870-8893-A8D4FAECD3A4",
  IMAGE: "944ABBC8-1611-4E29-9EC8-F9A11BAD7709",
  EMBEDDING: "F37AF2F3-37A1-418B-8EEE-3675A5A36784",
  RERANK: "F8AC00C2-F4E7-4FC3-8677-CF8AE86CE23F",
};

interface CreateKnowledgeModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateKnowledgeModal: React.FC<CreateKnowledgeModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatModels, setChatModels] = useState<AiModelItem[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<AiModelItem[]>([]);
  const [rerankModels, setRerankModels] = useState<AiModelItem[]>([]);

  const { token } = theme.useToken();

  // 高级UI风格的卡片样式
  const cardStyle = {
    marginBottom: 16,
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  const cardHeadStyle = {
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    padding: "12px 18px",
    fontWeight: 500,
  };

  const cardBodyStyle = {
    padding: "18px",
  };

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setCurrentStep(0);
  };

  // 加载模型数据
  useEffect(() => {
    const loadModels = async () => {
      try {
        // 加载聊天模型
        const chatModelRes = await knowledgeService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.CHAT
        );
        setChatModels(chatModelRes || []);

        // 加载嵌入模型
        const embeddingModelRes = await knowledgeService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.EMBEDDING
        );
        setEmbeddingModels(embeddingModelRes || []);

        // 加载rerank模型
        const rerankModelRes = await knowledgeService.getAiModelsByTypeId(
          MODEL_TYPE_IDS.RERANK
        );
        setRerankModels(rerankModelRes || []);
      } catch (error) {
        console.error("加载模型数据失败", error);
        message.error("加载模型数据失败");
      }
    };

    if (visible) {
      loadModels();
    }
  }, [visible]);

  // 当模态框打开时重置表单
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建创建数据
      const createData = {
        name: values.name,
        description: values.description || "",
        chatModelID: values.chatModelID || null,
        embeddingModelID: values.embeddingModelID || null,
        rerankModelID: values.rerankModelID || null,
        maxTokensPerParagraph: values.maxTokensPerParagraph,
        maxTokensPerLine: values.maxTokensPerLine,
        overlappingTokens: values.overlappingTokens,
        isOCR: values.isOCR || false,
        avatar: values.avatar || "",
      };

      await knowledgeService.createKnowledge(createData);

      message.success("知识库创建成功");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("创建知识库失败", error);
      message.error("创建知识库失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleNextStep = async () => {
    try {
      // 验证当前步骤的必填字段
      await form.validateFields(["name", "chatModelID", "embeddingModelID"]);
      setCurrentStep(1);
    } catch (error) {
      // 表单验证失败，不能进入下一步
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          创建知识库
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{
        padding: "20px",
        maxHeight: "80vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        size="middle"
        initialValues={{
          maxTokensPerParagraph: 700,
          maxTokensPerLine: 300,
          overlappingTokens: 100,
          isOCR: false,
        }}
      >
        <Tabs
          activeKey={currentStep === 0 ? "basic" : "advanced"}
          onChange={(key) => setCurrentStep(key === "basic" ? 0 : 1)}
          className="mb-4"
          type="card"
          size="large"
        >
          <TabPane tab="基本信息" key="basic">
            <Row gutter={[24, 0]}>
              <Col span={24}>
                <Card
                  title="基本知识库信息"
                  bordered={false}
                  style={cardStyle}
                  headStyle={cardHeadStyle}
                  bodyStyle={cardBodyStyle}
                >
                  <Row gutter={[24, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="知识库名称"
                        rules={[
                          { required: true, message: "请输入知识库名称" },
                          { max: 100, message: "名称长度不能超过100个字符" },
                        ]}
                      >
                        <Input placeholder="请输入知识库名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="avatar" label="知识库图标">
                        <Input placeholder="请输入图标URL（可选）" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="isOCR"
                        label="OCR支持"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="description" label="知识库描述">
                        <TextArea
                          rows={3}
                          placeholder="请输入知识库描述（可选）"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  title="模型配置"
                  bordered={false}
                  style={cardStyle}
                  headStyle={cardHeadStyle}
                  bodyStyle={cardBodyStyle}
                >
                  <Row gutter={[24, 16]}>
                    <Col span={8}>
                      <Form.Item
                        name="chatModelID"
                        label="聊天模型"
                        rules={[{ required: true, message: "请选择聊天模型" }]}
                      >
                        <Select placeholder="请选择聊天模型">
                          {chatModels.map((model) => (
                            <Select.Option
                              key={model.aiModelId}
                              value={model.aiModelId}
                            >
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="embeddingModelID"
                        label="嵌入模型"
                        rules={[{ required: true, message: "请选择嵌入模型" }]}
                      >
                        <Select placeholder="请选择嵌入模型">
                          {embeddingModels.map((model) => (
                            <Select.Option
                              key={model.aiModelId}
                              value={model.aiModelId}
                            >
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="rerankModelID" label="重排模型">
                        <Select placeholder="请选择重排模型（可选）" allowClear>
                          {rerankModels.map((model) => (
                            <Select.Option
                              key={model.aiModelId}
                              value={model.aiModelId}
                            >
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="高级配置" key="advanced">
            <div className="advanced-settings">
              <Card
                title="令牌配置"
                bordered={false}
                style={cardStyle}
                headStyle={cardHeadStyle}
                bodyStyle={cardBodyStyle}
              >
                <Row gutter={[24, 24]}>
                  <Col span={8}>
                    <Form.Item
                      name="maxTokensPerParagraph"
                      label={
                        <Space>
                          段落最大令牌数
                          <Tooltip title="控制每个段落的最大令牌数量">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { required: true, message: "请输入段落最大令牌数" },
                        {
                          type: "number",
                          min: 1,
                          max: 5000,
                          message: "请输入1-5000之间的数字",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={5000}
                        style={{ width: "100%" }}
                        placeholder="推荐值：700"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="maxTokensPerLine"
                      label={
                        <Space>
                          行最大令牌数
                          <Tooltip title="控制每行的最大令牌数量">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { required: true, message: "请输入行最大令牌数" },
                        {
                          type: "number",
                          min: 1,
                          max: 2000,
                          message: "请输入1-2000之间的数字",
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={2000}
                        style={{ width: "100%" }}
                        placeholder="推荐值：300"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item
                      name="overlappingTokens"
                      label={
                        <Space>
                          重叠令牌数
                          <Tooltip title="控制段落之间的重叠令牌数量">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      rules={[
                        { required: true, message: "请输入重叠令牌数" },
                        {
                          type: "number",
                          min: 0,
                          max: 500,
                          message: "请输入0-500之间的数字",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={500}
                        style={{ width: "100%" }}
                        placeholder="推荐值：100"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </div>
          </TabPane>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button
            style={{ marginRight: 12 }}
            size="large"
            onClick={handleCancel}
          >
            取消
          </Button>
          {currentStep === 0 && (
            <Button type="primary" size="large" onClick={handleNextStep}>
              下一步
            </Button>
          )}
          {currentStep === 1 && (
            <>
              <Button
                style={{ marginRight: 12 }}
                size="large"
                onClick={() => setCurrentStep(0)}
              >
                上一步
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loading}
                onClick={handleSubmit}
              >
                创建知识库
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CreateKnowledgeModal;
