import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Select, message, Typography, Steps } from "antd";
import { useTranslation } from "react-i18next";
import { CreateApplicationDto } from "#/dto/application";
import applicationService from "@/api/services/applicationService";

// Import type-specific form components
import ChatApplicationForm from "./types/ChatApplicationForm";
import KnowledgeApplicationForm from "./types/KnowledgeApplicationForm";
import AgentApplicationForm from "./types/AgentApplicationForm";
import Text2SqlApplicationForm from "./types/Text2SqlApplicationForm";

const { Title } = Typography;
const { Step } = Steps;

// 应用类型ID常量
const APPLICATION_TYPES = {
  CHAT: "BD5A8BA5-CCB0-4E77-91E6-2D4637F7F26D",
  KNOWLEDGE_BASE: "A8E78CD3-4FBA-4B33-B996-FE5B04571C00",
  TEXT2SQL: "A8E78CD3-4FBA-4B33-B996-FE5B04571C01",
  AGENT: "830ADB85-9B0E-413F-BB86-6E099059EDA7", // 新增Agent类型
};

interface CreateApplicationModalNewProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateApplicationModalNew: React.FC<CreateApplicationModalNewProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedAppType, setSelectedAppType] = useState<string>("");

  const applicationTypes = [
    { value: APPLICATION_TYPES.CHAT, label: t("聊天应用") },
    { value: APPLICATION_TYPES.KNOWLEDGE_BASE, label: t("知识库应用") },
    { value: APPLICATION_TYPES.TEXT2SQL, label: t("Text2SQL") },
    { value: APPLICATION_TYPES.AGENT, label: t("Agent应用") },
  ];

  // 处理应用类型变更
  const handleAppTypeChange = (value: string) => {
    setSelectedAppType(value);
    form.setFieldsValue({ applicationTypeId: value });
  };

  // 渲染对应的表单组件
  const renderApplicationForm = () => {
    if (!selectedAppType) return null;

    switch (selectedAppType) {
      case APPLICATION_TYPES.CHAT:
        return <ChatApplicationForm form={form} />;
      case APPLICATION_TYPES.KNOWLEDGE_BASE:
        return <KnowledgeApplicationForm form={form} />;
      case APPLICATION_TYPES.TEXT2SQL:
        return <Text2SqlApplicationForm form={form} />;
      case APPLICATION_TYPES.AGENT:
        return <AgentApplicationForm form={form} />;
      default:
        return null;
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 构建通用的应用数据结构
      const applicationData: CreateApplicationDto = {
        // 通用基础参数
        name: values.name,
        applicationTypeId: selectedAppType,
        description: values.description || null,
        icon: values.icon || null,
        promptWord: values.promptWord || "",

        // Chat相关参数
        chatModelId: values.chatModelId || null,
        imageModelID: values.imageModelID || null,
        maxResponseTokens: values.maxResponseTokens || 8000,
        maxRequestTokens: values.maxRequestTokens || 3000,
        temperature: values.temperature || 0.7,
        topP: values.topP || 0.8,
        frequencyPenalty: values.frequencyPenalty || 0,
        presencePenalty: values.presencePenalty || 0,
        isSummary: values.isSummary !== undefined ? values.isSummary : true,

        // Knowledge相关参数
        knowledgeIds: values.knowledgeIds || [],
        embeddingModelId: values.embeddingModelId || null,
        rerankModelID: values.rerankModelID || null,
        matchCount: values.matchCount || 1,
        relevance: values.relevance || 0.7,
        isRerank: values.isRerank !== undefined ? values.isRerank : true,
        needModelSupport:
          values.needModelSupport !== undefined
            ? values.needModelSupport
            : false,

        // Agent相关参数
        agentConfigs: values.agentConfigs || [],
        kernelFunctionTerminationStrategy:
          values.kernelFunctionTerminationStrategy || "",
        kernelFunctionSelectionStrategy:
          values.kernelFunctionSelectionStrategy || "",
        maximumIterations: values.maximumIterations || 10,
        isInLine: values.isInLine !== undefined ? values.isInLine : false,
      };

      await applicationService.createApplication(applicationData);
      message.success(t("应用创建成功"));
      handleCancel();
      onSuccess();
    } catch (error) {
      console.error("创建应用失败", error);
      message.error(t("创建应用失败，请重试"));
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedAppType("");
    onCancel();
  };

  // 下一步
  const handleNext = () => {
    if (currentStep === 0 && !selectedAppType) {
      message.warning(t("请先选择应用类型"));
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 重置状态
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCurrentStep(0);
      setSelectedAppType("");
    }
  }, [visible, form]);

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {t("创建应用")}
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
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
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title={t("选择类型")} />
        <Step title={t("配置应用")} />
      </Steps>

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
          presencePenalty: 0,
        }}
      >
        {currentStep === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Title level={3} style={{ marginBottom: 24 }}>
              {t("选择应用类型")}
            </Title>
            <Form.Item
              name="applicationTypeId"
              rules={[{ required: true, message: t("请选择应用类型") }]}
            >
              <Select
                placeholder={t("请选择应用类型")}
                onChange={handleAppTypeChange}
                size="large"
                style={{ width: 300 }}
              >
                {applicationTypes.map((type) => (
                  <Select.Option key={type.value} value={type.value}>
                    {type.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        {currentStep === 1 && renderApplicationForm()}

        <div className="mt-6 flex justify-end">
          {currentStep > 0 && (
            <Button
              style={{ margin: "0 12px" }}
              size="large"
              onClick={handlePrev}
            >
              {t("上一步")}
            </Button>
          )}
          {currentStep === 0 && (
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              disabled={!selectedAppType}
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
              {t("创建应用")}
            </Button>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default CreateApplicationModalNew;
