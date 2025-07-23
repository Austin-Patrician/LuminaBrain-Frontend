import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Switch,
  Button,
  Typography,
  Space,
  Divider,
  Alert,
  Select,
  message as antdMessage,
} from "antd";
import {
  FunctionOutlined,
  ExperimentOutlined,
  BulbOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { flowService } from "@/api/services/flowService";
import type {
  GeneratePromptInput,
  OptimizationResult,
  StreamingContent,
} from "../types";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface OptimizationModalProps {
  visible: boolean;
  optimizationType: "function-calling" | "prompt-optimization" | null;
  onCancel: () => void;
  onConfirm: (config: GeneratePromptInput) => void;
  initialData: Partial<GeneratePromptInput>;
  // 新增优化结果相关属性
  optimizationResult?: OptimizationResult | null;
  streamingContent?: StreamingContent;
  isOptimizing?: boolean;
  // 新增状态展示相关属性
  isDeepReasoning?: boolean;
  isEvaluating?: boolean;
  reasoningDuration?: number;
  reasoningStartTime?: number | null;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({
  visible,
  optimizationType,
  onCancel,
  onConfirm,
  initialData,
  isOptimizing,
}) => {
  const [form] = Form.useForm();

  // 获取模型列表
  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const response = await flowService.getAiModelsByTypeId();
      setModelOptions(response);
    } catch (error) {
      console.error("Failed to fetch AI models:", error);
      antdMessage.error("获取模型列表失败");
    } finally {
      setLoadingModels(false);
    }
  };

  // 组件加载时获取模型列表
  useEffect(() => {
    if (visible) {
      fetchModels();
    }
  }, [visible]);
  const [loading, setLoading] = useState(false);
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // 重置表单数据
  useEffect(() => {
    if (visible && initialData) {
      form.setFieldsValue({
        Prompt: initialData.Prompt || "",
        Requirements: initialData.Requirements || "",
        EnableDeepReasoning: initialData.EnableDeepReasoning || false,
        ModelId: initialData.ModelId || "",
      });
    }
  }, [visible, initialData, form]);

  // 获取优化类型配置
  const getOptimizationConfig = () => {
    switch (optimizationType) {
      case "function-calling":
        return {
          title: "Function Calling 优化配置",
          icon: <FunctionOutlined className="text-blue-600" />,
          description: "优化函数调用相关的提示词，提升AI工具使用的准确性和效率",
          color: "blue",
          requirementsPlaceholder:
            "请描述您希望如何优化Function Calling，例如：\n- 提高函数参数识别准确率\n- 优化多步骤函数调用逻辑\n- 改善错误处理机制",
        };
      case "prompt-optimization":
        return {
          title: "通用提示词优化配置",
          icon: <ExperimentOutlined className="text-green-600" />,
          description: "全面优化提示词结构、逻辑和表达，提升AI理解和响应质量",
          color: "green",
          requirementsPlaceholder:
            "请描述您的优化需求，例如：\n- 提高回答的准确性和相关性\n- 优化语言表达和逻辑结构\n- 增强特定场景的适用性",
        };
      default:
        return null;
    }
  };

  const config = getOptimizationConfig();

  // 处理确认提交
  const handleConfirm = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const optimizationConfig: GeneratePromptInput = {
        Prompt: values.Prompt,
        Requirements: values.Requirements || "",
        EnableDeepReasoning: values.EnableDeepReasoning || false,
        ModelId: values.ModelId,
      };

      onConfirm(optimizationConfig);
    } catch (error) {
      console.error("表单验证失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 监听优化状态变化
  useEffect(() => {
    if (isOptimizing && !showResultModal) {
      setShowResultModal(true);
    }
  }, [isOptimizing, showResultModal]);

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!config) return null;

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          {config.icon}
          <Title level={4} className="mb-0">
            {config.title}
          </Title>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={720}
      footer={
        <div className="flex justify-end space-x-2">
          <Button size="large" onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            loading={loading}
            onClick={handleConfirm}
          >
            开始优化
          </Button>
        </div>
      }
      destroyOnClose
    >
      <div className="space-y-6">
        {/* 优化类型说明 */}
        <Alert
          message={config.description}
          type="info"
          showIcon
          className="mb-4"
        />

        <Form
          form={form}
          layout="vertical"
          size="middle"
          initialValues={{
            EnableDeepReasoning: false,
          }}
        >
          {/* 提示词内容 */}
          <Form.Item
            label={
              <Space>
                <Text strong>需要优化的提示词</Text>
                <Text type="secondary">(必填)</Text>
              </Space>
            }
            name="Prompt"
            rules={[
              { required: true, message: "请输入需要优化的提示词" },
              { min: 10, message: "提示词内容至少需要10个字符" },
            ]}
          >
            <TextArea
              placeholder="请输入您的提示词内容..."
              rows={6}
              showCount
              maxLength={5000}
            />
          </Form.Item>

          {/* 优化需求 */}
          <Form.Item
            label={
              <Space>
                <Text strong>优化需求描述</Text>
                <Text type="secondary">(可选)</Text>
              </Space>
            }
            name="Requirements"
          >
            <TextArea
              placeholder={config.requirementsPlaceholder}
              rows={4}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          {/* 模型选择 */}
          <Form.Item
            label={
              <Space>
                <Text strong>选择优化模型</Text>
                <Text type="secondary">(必填)</Text>
              </Space>
            }
            name="ModelId"
            rules={[{ required: true, message: "请选择用于优化的模型" }]}
          >
            <Select
              value={form.getFieldValue("ModelId")}
              onChange={(modelId) => form.setFieldValue("ModelId", modelId)}
              style={{ width: '100%' }}
              placeholder="选择模型"
              loading={loadingModels}
              options={modelOptions.map(model => ({
                label: model.aiModelName,
                value: model.aiModelId
              }))}
            />
          </Form.Item>

          <Divider />

          {/* 高级选项 */}
          <div className="space-y-4">
            <Text strong className="block">
              高级选项
            </Text>

            {/* 深度推理开关 */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <BulbOutlined className="text-orange-500 mt-1" />
                <div>
                  <Text strong>启用深度推理</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    AI将展示详细的思考过程和推理逻辑，帮助您理解优化决策
                  </Text>
                </div>
              </div>
              <Form.Item
                name="EnableDeepReasoning"
                valuePropName="checked"
                className="mb-0"
              >
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Form>

        {/* 使用提示 */}
        <Alert
          message="优化过程中将实时显示进度，支持查看推理过程、优化结果和评估报告。"
          type="success"
          showIcon
          className="mt-4"
        />
      </div>

    </Modal>
  );
};

export default OptimizationModal;
