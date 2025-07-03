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
import { Knowledge, AiModelItem } from "#/entity";

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

interface EditKnowledgeModalProps {
  visible: boolean;
  knowledge: Partial<Knowledge> | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditKnowledgeModal: React.FC<EditKnowledgeModalProps> = ({
  visible,
  knowledge,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatModels, setChatModels] = useState<AiModelItem[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<AiModelItem[]>([]);

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

  // 加载表单数据
  useEffect(() => {
    if (visible && knowledge) {
      // 设置表单初始值
      form.setFieldsValue({
        id: knowledge.id,
        name: knowledge.name,
        description: knowledge.description,
        chatModelID: knowledge.chatModelID,
        embeddingModelID: knowledge.embeddingModelID,
        maxTokensPerParagraph: knowledge.maxTokensPerParagraph || 700,
        maxTokensPerLine: knowledge.maxTokensPerLine || 300,
        overlappingTokens: knowledge.overlappingTokens || 100,
        isOCR: knowledge.isOCR !== undefined ? knowledge.isOCR : false,
        avatar: knowledge.avatar || "",
      });
    }
  }, [visible, knowledge, form]);

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
      } catch (error) {
        console.error("加载模型数据失败", error);
        message.error("加载模型数据失败");
      }
    };

    if (visible) {
      loadModels();
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建更新数据
      const updateData = {
        ...values,
      };

      await knowledgeService.updateKnowledge(updateData);

      message.success("知识库更新成功");
      setCurrentStep(0);
      onSuccess();
    } catch (error) {
      console.error("更新知识库失败", error);
      message.error("更新知识库失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          编辑知识库
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
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>

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
                        ]}
                      >
                        <Input placeholder="请输入知识库名称" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="avatar" label="知识库图标">
                        <Input placeholder="请输入图标URL" />
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
                        <TextArea rows={3} placeholder="请输入知识库描述" />
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
                    <Col span={12}>
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
                    <Col span={12}>
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
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={5000}
                        style={{ width: "100%" }}
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
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={2000}
                        style={{ width: "100%" }}
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
                      rules={[{ required: true, message: "请输入重叠令牌数" }]}
                    >
                      <InputNumber
                        min={0}
                        max={500}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </div>
          </TabPane>
        </Tabs>

        <div className="mt-6 flex justify-end">
          {currentStep === 1 && (
            <Button
              style={{ margin: "0 12px" }}
              size="large"
              onClick={() => setCurrentStep(0)}
            >
              上一步
            </Button>
          )}
          {currentStep === 0 && (
            <Button
              type="primary"
              size="large"
              onClick={() => setCurrentStep(1)}
            >
              下一步
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
            >
              保存
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default EditKnowledgeModal;
