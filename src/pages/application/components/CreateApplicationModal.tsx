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
  Divider,
  Upload,
  Space,
  Row,
  Col,
  Card,
  Typography,
  Slider,
  Tooltip,
  Tag,
  Tabs,
  theme,
} from "antd";
import { PlusOutlined, UploadOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { CreateApplicationDto } from "#/dto/application";
import applicationService from "@/api/services/applicationService";
import { AiModelItem } from "#/entity";
import { useTranslation } from "react-i18next";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// AI模型类型ID常量
const MODEL_TYPE_IDS = {
  CHAT: "0D826A41-45CE-4870-8893-A8D4FAECD3A4", // 聊天模型类型ID
  IMAGE: "944ABBC8-1611-4E29-9EC8-F9A11BAD7709", // 图像模型类型ID
  EMBEDDING: "F37AF2F3-37A1-418B-8EEE-3675A5A36784", // 嵌入模型类型ID
  RERANK: "F8AC00C2-F4E7-4FC3-8677-CF8AE86CE23F", // 重排序模型类型ID
};

// 应用类型ID常量
const APPLICATION_TYPES = {
  CHAT: "BD5A8BA5-CCB0-4E77-91E6-2D4637F7F26D", // 聊天应用
  KNOWLEDGE_BASE: "A8E78CD3-4FBA-4B33-B996-FE5B04571C00", // 知识库应用
  TEXT2SQL: "A8E78CD3-4FBA-4B33-B996-FE5B04571C01", // Text2SQL
};

interface CreateApplicationModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatModels, setChatModels] = useState<AiModelItem[]>([]);
  const [imageModels, setImageModels] = useState<AiModelItem[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<AiModelItem[]>([]);
  const [rerankModels, setRerankModels] = useState<AiModelItem[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<{ value: string, label: string }[]>([]);
  const [selectedAppType, setSelectedAppType] = useState<string>(""); // 跟踪选择的应用类型

  const [applicationTypes, setApplicationTypes] = useState<{ value: string, label: string }[]>([
    { value: APPLICATION_TYPES.CHAT, label: "聊天应用" },
    { value: APPLICATION_TYPES.KNOWLEDGE_BASE, label: "知识库应用" },
    { value: APPLICATION_TYPES.TEXT2SQL, label: "Text2SQL" },
  ]);

  const { token } = theme.useToken();

  // 为温度和TopP添加标记点和提示文字
  const temperatureMarks = {
    0: <Text>确定</Text>,
    0.6: <Text>均衡</Text>,
    1: <Text>发散</Text>
  };

  const topPMarks = {
    0: <Text type="secondary">低</Text>,
    0.8: <Text type="secondary">均衡</Text>,
    1: <Text type="secondary">高</Text>
  };

  // 格式化slider值的函数
  const formatTooltip = (value: number) => value.toFixed(2);

  // 高级UI风格的卡片样式
  const cardStyle = {
    marginBottom: 16,
    borderRadius: 8,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  const cardHeadStyle = {
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    padding: '12px 18px',
    fontWeight: 500,
  };

  const cardBodyStyle = {
    padding: '18px',
  };

  // 处理应用类型变更
  const handleAppTypeChange = (value: string) => {
    setSelectedAppType(value);
    // 重置相关表单项
    if (value === APPLICATION_TYPES.CHAT) {
      form.setFieldsValue({
        embeddingModelId: undefined,
        rerankModelID: undefined,
        matchCount: 1,
        relevance: 1,
        isRerank: true,
        needModelSupport: false,
        knowledgeIds: [],
      });
    }
  };

  // 加载模型数据
  useEffect(() => {
    const loadModels = async () => {
      try {
        // 加载聊天模型
        const chatModelRes = await applicationService.getAiModelsByTypeId(MODEL_TYPE_IDS.CHAT);
        setChatModels(chatModelRes);

        // 加载图像模型
        const imageModelRes = await applicationService.getAiModelsByTypeId(MODEL_TYPE_IDS.IMAGE);
        setImageModels(imageModelRes);

        // 加载嵌入模型
        const embeddingModelRes = await applicationService.getAiModelsByTypeId(MODEL_TYPE_IDS.EMBEDDING);
        setEmbeddingModels(embeddingModelRes);

        // 加载重排序模型
        const rerankModelRes = await applicationService.getAiModelsByTypeId(MODEL_TYPE_IDS.RERANK);
        setRerankModels(rerankModelRes);

        // 加载知识库列表
        const knowledgeRes = await applicationService.GetKnowledgeList();
        const formattedKnowledgeList = knowledgeRes.map(item => ({
          value: item.knowledgeId,
          label: item.knowledgeName
        }));
        setKnowledgeList(formattedKnowledgeList);

      } catch (error) {
        console.error("加载模型数据失败", error);
        message.error(t("加载模型数据失败"));
      }
    };

    if (visible) {
      loadModels();
    }
  }, [visible, t]);

  // 检查是否为知识库应用
  const isKnowledgeBaseApp = () => selectedAppType === APPLICATION_TYPES.KNOWLEDGE_BASE;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue(true);

      // 转换表单值为DTO，根据应用类型处理不同字段
      const applicationData: CreateApplicationDto = {
        name: values.name,
        applicationTypeId: values.applicationTypeId,
        chatModelId: values.chatModelId,
        description: values.description || null,
        icon: values.icon || null,
        maxResponseTokens: values.maxResponseTokens || 8000,
        maxRequestTokens: values.maxRequestTokens || 3000,
        temperature: values.temperature || 1,
        topP: values.topP || 1,
        frequencyPenalty: values.frequencyPenalty || 1,
        presencePenalty: values.presencePenalty || 1,
        promptWord: values.promptWord || "",

        // 根据应用类型设置特定字段
        imageModelID: values.imageModelID || null,
        embeddingModelId: isKnowledgeBaseApp() ? values.embeddingModelId : null,
        rerankModelID: isKnowledgeBaseApp() ? values.rerankModelID : null,
        knowledgeIds: isKnowledgeBaseApp() ? values.knowledgeIds || [] : [],
        matchCount: isKnowledgeBaseApp() ? values.matchCount || 1 : 1,
        relevance: isKnowledgeBaseApp() ? values.relevance || 1 : 1,
        isSummary: values.isSummary !== undefined ? values.isSummary : true,
        isRerank: isKnowledgeBaseApp() ? values.isRerank !== undefined ? values.isRerank : true : false,
        needModelSupport: isKnowledgeBaseApp() ? values.needModelSupport !== undefined ? values.needModelSupport : false : false
      };

      const response = await applicationService.createApplication(applicationData);

      message.success(t("应用创建成功"));
      form.resetFields();
      setCurrentStep(0);
      onSuccess();
    } catch (error) {
      console.error("创建应用失败", error);
      message.error(t("创建应用失败，请重试"));
    } finally {
      setLoading(false);
    }
  };

  // 处理取消和关闭modal
  const handleCancel = () => {
    form.resetFields(); // 重置表单数据
    setCurrentStep(0); // 重置步骤
    setSelectedAppType(""); // 清空应用类型选择
    onCancel(); // 调用父组件的onCancel
  };

  return (
    <Modal
      title={<Title level={4} style={{ margin: 0 }}>{t("创建应用")}</Title>}
      open={visible}
      onCancel={handleCancel} // 使用我们自定义的handleCancel
      width={1000}
      style={{ top: 20 }}
      bodyStyle={{
        padding: '20px',
        maxHeight: '80vh',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        size="middle"
        initialValues={{
          maxResponseTokens: 8000,
          maxRequestTokens: 3000,
          matchCount: 1,
          relevance: 0.7,
          isSummary: true,
          isRerank: true,
          temperature: 0.7,
          topP: 0.8,
          frequencyPenalty: 0,
          presencePenalty: 0
        }}
      >
        <Tabs
          activeKey={currentStep === 0 ? "basic" : "advanced"}
          onChange={(key) => setCurrentStep(key === "basic" ? 0 : 1)}
          className="mb-4"
          type="card"
          size="large"
        >
          <TabPane tab={t("基本信息")} key="basic">
            <Row gutter={[24, 0]}>
              <Col span={24}>
                <Card
                  title={t("基本应用信息")}
                  bordered={false}
                  style={cardStyle}
                  headStyle={cardHeadStyle}
                  bodyStyle={cardBodyStyle}
                >
                  <Row gutter={[24, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label={t("应用名称")}
                        rules={[{ required: true, message: t("请输入应用名称") }]}
                      >
                        <Input placeholder={t("请输入应用名称")} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="applicationTypeId"
                        label={t("应用类型")}
                        rules={[{ required: true, message: t("请选择应用类型") }]}
                      >
                        <Select
                          placeholder={t("请选择应用类型")}
                          options={applicationTypes}
                          onChange={handleAppTypeChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="icon"
                        label={t("应用图标")}
                      >
                        <Input placeholder={t("请输入图标URL")} />
                      </Form.Item>
                    </Col>
                    {isKnowledgeBaseApp() && (
                      <Col span={12}>
                        <Form.Item
                          name="needModelSupport"
                          label={t("需要模型支持")}
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={24}>
                      <Form.Item
                        name="description"
                        label={t("应用描述")}
                      >
                        <TextArea rows={3} placeholder={t("请输入应用描述")} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  title={t("核心模型配置")}
                  bordered={false}
                  style={cardStyle}
                  headStyle={cardHeadStyle}
                  bodyStyle={cardBodyStyle}
                >
                  <Row gutter={[24, 16]}>
                    {isKnowledgeBaseApp() && (
                      <Col span={24}>
                        <Form.Item
                          name="knowledgeIds"
                          label={t("选择知识库")}
                          rules={[{ required: isKnowledgeBaseApp(), message: t("请选择知识库") }]}
                        >
                          <Select
                            mode="multiple"
                            placeholder={t("请选择知识库")}
                            options={knowledgeList}
                            maxTagCount={5}
                            showSearch
                            optionFilterProp="label"
                          />
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={12}>
                      <Form.Item
                        name="chatModelId"
                        label={t("聊天模型")}
                        rules={[{ required: true, message: t("请选择聊天模型") }]}
                      >
                        <Select placeholder={t("请选择聊天模型")}>
                          {chatModels.map(model => (
                            <Select.Option key={model.aiModelId} value={model.aiModelId}>
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="imageModelID"
                        label={t("图像模型")}
                      >
                        <Select placeholder={t("请选择图像模型")} allowClear>
                          {imageModels.map(model => (
                            <Select.Option key={model.aiModelId} value={model.aiModelId}>
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="maxResponseTokens"
                        label={t("最大响应Token数")}
                        initialValue={8000}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="maxRequestTokens"
                        label={t("最大请求Token数")}
                        initialValue={3000}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={t("高级配置")} key="advanced">
            <div className="advanced-settings">
              {isKnowledgeBaseApp() && (
                <Card
                  title={t("高级模型配置")}
                  bordered={false}
                  style={cardStyle}
                  headStyle={cardHeadStyle}
                  bodyStyle={cardBodyStyle}
                >
                  <Row gutter={[24, 16]}>
                    <Col span={12}>
                      <Form.Item
                        name="embeddingModelId"
                        label={t("嵌入模型")}
                        rules={[{ required: isKnowledgeBaseApp(), message: t("请选择嵌入模型") }]}
                      >
                        <Select placeholder={t("请选择嵌入模型")} allowClear>
                          {embeddingModels.map(model => (
                            <Select.Option key={model.aiModelId} value={model.aiModelId}>
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="rerankModelID"
                        label={t("重排序模型")}
                      >
                        <Select placeholder={t("请选择重排序模型")} allowClear>
                          {rerankModels.map(model => (
                            <Select.Option key={model.aiModelId} value={model.aiModelId}>
                              {model.aiModelName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              )}

              <Card
                title={t("参数配置")}
                bordered={false}
                style={cardStyle}
                headStyle={cardHeadStyle}
                bodyStyle={cardBodyStyle}
              >
                <Row gutter={[24, 24]}>
                  {isKnowledgeBaseApp() && (
                    <>
                      <Col span={12}>
                        <Form.Item
                          name="matchCount"
                          label={t("匹配数量")}
                          initialValue={1}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="relevance"
                          label={
                            <Space>
                              {t("相关性")}
                              <Tooltip title={t("控制匹配结果的相关性阈值")}>
                                <InfoCircleOutlined />
                              </Tooltip>
                            </Space>
                          }
                          initialValue={0.7}
                        >
                          <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            marks={{
                              0: t("低"),
                              0.5: t("中"),
                              1: t("高")
                            }}
                            tooltip={{ formatter: formatTooltip }}
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="temperature"
                      label={
                        <Space>
                          {t("温度")}
                          <Tooltip title={t("控制生成文本的创造性和多样性，值越高结果越随机")}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      initialValue={0.7}
                    >
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        marks={temperatureMarks}
                        tooltip={{ formatter: formatTooltip }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="topP"
                      label={
                        <Space>
                          {t("Top P")}
                          <Tooltip title={t("控制生成文本的词汇多样性，值越高考虑的词越多")}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      initialValue={0.8}
                    >
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        marks={topPMarks}
                        tooltip={{ formatter: formatTooltip }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="frequencyPenalty"
                      label={
                        <Space>
                          {t("频率惩罚")}
                          <Tooltip title={t("减少重复内容生成的可能性")}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      initialValue={0}
                    >
                      <Slider
                        min={0}
                        max={2}
                        step={0.01}
                        marks={{
                          0: t("无"),
                          1: t("中"),
                          2: t("强")
                        }}
                        tooltip={{ formatter: formatTooltip }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="presencePenalty"
                      label={
                        <Space>
                          {t("存在惩罚")}
                          <Tooltip title={t("增加模型讨论新主题的可能性")}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      initialValue={0}
                    >
                      <Slider
                        min={0}
                        max={2}
                        step={0.01}
                        marks={{
                          0: t("无"),
                          1: t("中"),
                          2: t("强")
                        }}
                        tooltip={{ formatter: formatTooltip }}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="promptWord"
                      label={t("提示词")}
                    >
                      <TextArea
                        rows={3}
                        placeholder={t("请输入提示词")}
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={t("功能开关")}
                bordered={false}
                style={cardStyle}
                headStyle={cardHeadStyle}
                bodyStyle={cardBodyStyle}
              >
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Form.Item
                      name="isSummary"
                      label={t("启用摘要")}
                      valuePropName="checked"
                      initialValue={true}
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  {isKnowledgeBaseApp() && (
                    <Col span={8}>
                      <Form.Item
                        name="isRerank"
                        label={t("启用重排序")}
                        valuePropName="checked"
                        initialValue={true}
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Card>
            </div>
          </TabPane>
        </Tabs>

        <div className="mt-6 flex justify-end">
          {currentStep === 1 && (
            <Button
              style={{ margin: '0 12px' }}
              size="large"
              onClick={() => setCurrentStep(0)}
            >
              {t("上一步")}
            </Button>
          )}
          {currentStep === 0 && (
            <Button
              type="primary"
              size="large"
              onClick={() => setCurrentStep(1)}
            >
              {t("下一步")}
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
            >
              {t("提交")}
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CreateApplicationModal;