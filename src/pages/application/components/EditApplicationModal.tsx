import React, { useState, useEffect } from "react";
import { Modal, Form, Button, message, Typography, theme } from "antd";
import applicationService from "@/api/services/applicationService";
import { Application } from "#/entity";
import { useTranslation } from "react-i18next";
import { AgentConfig, CreateApplicationDto } from "#/dto/application";

import ChatApplicationForm from "./types/ChatApplicationForm";
import KnowledgeApplicationForm from "./types/KnowledgeApplicationForm";
import AgentApplicationForm from "./types/AgentApplicationForm";
import Text2SqlApplicationForm from "./types/Text2SqlApplicationForm";

const { Title } = Typography;

// 应用类型ID常量
const APPLICATION_TYPE_IDS = {
  CHAT: "BD5A8BA5-CCB0-4E77-91E6-2D4637F7F26D",
  KNOWLEDGE: "A8E78CD3-4FBA-4B33-B996-FE5B04571C00",
  TEXT2SQL: "A8E78CD3-4FBA-4B33-B996-FE5B04571C01",
  AGENT: "830ADB85-9B0E-413F-BB86-6E099059EDA7",
};

interface EditApplicationModalProps {
  visible: boolean;
  application: Application | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  visible,
  application,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  // 根据应用类型渲染对应的表单
  const renderApplicationForm = () => {
    if (!application?.applicationTypeId) return null;

    switch (application.applicationTypeId) {
      case APPLICATION_TYPE_IDS.CHAT:
        return <ChatApplicationForm form={form} />;
      case APPLICATION_TYPE_IDS.KNOWLEDGE:
        return <KnowledgeApplicationForm form={form} />;
      case APPLICATION_TYPE_IDS.AGENT:
        return <AgentApplicationForm form={form} />;
      case APPLICATION_TYPE_IDS.TEXT2SQL:
        return <Text2SqlApplicationForm form={form} />;
      default:
        return null;
    }
  };

  // 获取应用类型名称
  const getApplicationTypeName = () => {
    if (!application?.applicationTypeId) return "应用";

    switch (application.applicationTypeId) {
      case APPLICATION_TYPE_IDS.CHAT:
        return "聊天应用";
      case APPLICATION_TYPE_IDS.KNOWLEDGE:
        return "知识库应用";
      case APPLICATION_TYPE_IDS.AGENT:
        return "Agent应用";
      case APPLICATION_TYPE_IDS.TEXT2SQL:
        return "Text2SQL应用";
      default:
        return "应用";
    }
  };

  // 数据映射函数 - 将API返回的数据转换为表单所需的格式
  const mapApplicationDataToForm = (appData: any) => {
    const baseData = {
      id: appData.id,
      name: appData.name,
      description: appData.description || "",
      applicationTypeId: appData.applicationTypeId,
      icon: appData.icon || "",
      promptWord: appData.promptWord || "",

      // Chat和Knowledge通用参数
      chatModelId: appData.chatModelId || "",
      imageModelID: appData.imageModelId || "",
      maxResponseTokens: appData.maxResponseTokens || 8000,
      maxRequestTokens: appData.maxRequestTokens || 3000,
      temperature: appData.temperature || 0.7,
      topP: appData.topP || 0.8,
      frequencyPenalty: appData.frequencyPenalty || 0,
      presencePenalty: appData.presencePenalty || 0,
      isSummary: appData.isSummary !== undefined ? appData.isSummary : true,
    };

    // Knowledge特有参数
    if (appData.applicationTypeId === APPLICATION_TYPE_IDS.KNOWLEDGE) {
      return {
        ...baseData,
        knowledgeIds: appData.knowledgeIds || [],
        embeddingModelId: appData.embeddingModelId || "",
        rerankModelID: appData.rerankModelId || "",
        matchCount: appData.matchCount || 1,
        relevance: appData.relevance || 0.7,
        isRerank: appData.isRerank !== undefined ? appData.isRerank : true,
        needModelSupport:
          appData.needModelSupport !== undefined
            ? appData.needModelSupport
            : false,
      };
    }

    // Agent特有参数
    if (appData.applicationTypeId === APPLICATION_TYPE_IDS.AGENT) {
      return {
        ...baseData,
        agentConfigs: appData.agentConfigs || [],
        kernelFunctionTerminationStrategy:
          appData.kernelFunctionTerminationStrategy || "",
        kernelFunctionSelectionStrategy:
          appData.kernelFunctionSelectionStrategy || "",
        maximumIterations: appData.maximumIterations || 10,
        isInLine: appData.isInLine !== undefined ? appData.isInLine : false,
      };
    }

    return baseData;
  };

  // 加载表单数据
  useEffect(() => {
    if (visible && application) {
      const formData = mapApplicationDataToForm(application);
      form.setFieldsValue(formData);
    }
  }, [visible, application, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建更新数据
      const updateData: CreateApplicationDto = {
        // 基本信息
        name: values.name,
        applicationTypeId: values.applicationTypeId,
        description: values.description || null,
        icon: values.icon || null,
        promptWord: values.promptWord || "",

        // Chat和Knowledge通用参数
        chatModelId: values.chatModelId || null,
        imageModelID: values.imageModelID || null,
        maxResponseTokens: values.maxResponseTokens || 8000,
        maxRequestTokens: values.maxRequestTokens || 3000,
        temperature: values.temperature || 0.7,
        topP: values.topP || 0.8,
        frequencyPenalty: values.frequencyPenalty || 0,
        presencePenalty: values.presencePenalty || 0,
        isSummary: values.isSummary !== undefined ? values.isSummary : true,

        // Knowledge特有参数
        knowledgeIds: values.knowledgeIds || [],
        embeddingModelId: values.embeddingModelId || null,
        rerankModelID: values.rerankModelID || null,
        matchCount: values.matchCount || 1,
        relevance: values.relevance || 0.7,
        isRerank: values.isRerank !== undefined ? values.isRerank : true,
        needModelSupport:
          values.needModelSupport !== undefined
            ? values.needModelSupport
            : null,

        // Agent特有参数
        agentConfigs: values.agentConfigs || [],
        kernelFunctionTerminationStrategy:
          values.kernelFunctionTerminationStrategy || "",
        kernelFunctionSelectionStrategy:
          values.kernelFunctionSelectionStrategy || "",
        maximumIterations: values.maximumIterations || 10,
        isInLine: values.isInLine !== undefined ? values.isInLine : false,
      };

      // 调用更新接口
      await applicationService.updateApplication({
        id: application!.id,
        ...updateData,
      } as any);

      message.success(t("应用更新成功"));
      onSuccess();
    } catch (error) {
      console.error("更新应用失败", error);
      message.error(t("更新应用失败，请重试"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {t("编辑")} {getApplicationTypeName()}
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      width={1200}
      style={{ top: 20 }}
      bodyStyle={{
        padding: "24px",
        maxHeight: "80vh",
        overflowY: "auto",
        overflowX: "hidden",
      }}
      footer={
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}
        >
          <Button size="large" onClick={handleCancel}>
            {t("取消")}
          </Button>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleSubmit}
          >
            {t("保存")}
          </Button>
        </div>
      }
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="middle" preserve={false}>
        <Form.Item name="id" hidden>
          <input type="hidden" />
        </Form.Item>
        <Form.Item name="applicationTypeId" hidden>
          <input type="hidden" />
        </Form.Item>

        {renderApplicationForm()}
      </Form>
    </Modal>
  );
};

export default EditApplicationModal;
