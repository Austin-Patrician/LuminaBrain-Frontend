import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  message,
  Switch,
  Spin
} from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateAgentDto } from "#/dto/agent";
import type { AiModelItem } from "#/entity";
import agentService from "@/api/services/agentService";

// 函数选择行为选项
const FUNCTION_CHOICE_BEHAVIORS = [
  { id: "auto", name: "自动" },
  { id: "required", name: "必需" },
  { id: "none", name: "无" },
];

// 状态选项
const STATUS_TYPES = [
  { id: "active", name: "活跃" },
  { id: "inactive", name: "非活跃" },
];

interface CreateAgentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取AI模型服务列表
  const { data: aiModelData, isLoading: aiModelLoading } = useQuery({
    queryKey: ["aiModels"],
    queryFn: () => agentService.getAiModelsByTypeId("0D826A41-45CE-4870-8893-A8D4FAECD3A4"),
    enabled: visible, // 只在modal可见时加载数据
  });

  const serviceOptions = aiModelData || [];

  // 使用 useMutation 处理创建请求
  const createMutation = useMutation({
    mutationFn: agentService.createAgent,
    onSuccess: () => {
      message.success("Agent创建成功");
      form.resetFields();
      onSuccess();
    },
    onError: (error: any) => {
      message.error(`创建Agent失败: ${error.message || '未知错误'}`);
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const agentData: CreateAgentDto = {
        name: values.name,
        instructions: values.instructions,
        serviceId: values.serviceId,
        statusId: values.statusId,
        extensionData: values.extensionData,
        temperature: values.temperature,
        topP: values.topP,
        frequencyPenalty: values.frequencyPenalty,
        presencePenalty: values.presencePenalty,
        maxTokens: values.maxTokens,
        functionChoiceBehavior: values.functionChoiceBehavior,
      };

      // 执行创建操作
      createMutation.mutate(agentData);
    } catch (error) {
      setLoading(false);
      // 表单验证错误由Form组件处理
    }
  };

  // 处理取消按钮点击
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="新增Agent"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          创建
        </Button>,
      ]}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          statusId: "active",
          functionChoiceBehavior: "auto",
          temperature: 0.7,
          topP: 1,
          maxTokens: 1000,
        }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: "请输入Agent名称" }]}
        >
          <Input placeholder="请输入Agent名称" />
        </Form.Item>

        <Form.Item
          name="instructions"
          label="指令说明"
          rules={[{ required: true, message: "请输入指令说明" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请输入Agent的指令说明"
          />
        </Form.Item>

        <Form.Item
          name="serviceId"
          label="服务"
          rules={[{ required: true, message: "请选择服务" }]}
        >
          <Select
            placeholder={aiModelLoading ? "加载中..." : "请选择服务"}
            loading={aiModelLoading}
            disabled={aiModelLoading}
          >
            {serviceOptions.map((model: AiModelItem) => (
              <Select.Option key={model.aiModelId} value={model.aiModelId}>
                {model.aiModelName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="statusId"
          label="状态"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select placeholder="请选择状态">
            {STATUS_TYPES.map((status) => (
              <Select.Option key={status.id} value={status.id}>
                {status.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="functionChoiceBehavior"
          label="函数选择行为"
        >
          <Select placeholder="请选择函数选择行为">
            {FUNCTION_CHOICE_BEHAVIORS.map((behavior) => (
              <Select.Option key={behavior.id} value={behavior.id}>
                {behavior.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="extensionData" label="扩展数据">
          <Input.TextArea rows={3} placeholder="JSON格式的扩展数据" />
        </Form.Item>

        <Form.Item label="模型参数" className="mb-0">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="temperature" label="Temperature" className="mb-0">
              <InputNumber
                min={0}
                max={1}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="topP" label="Top P" className="mb-0">
              <InputNumber
                min={0}
                max={1}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="frequencyPenalty" label="频率惩罚" className="mb-0">
              <InputNumber
                min={0}
                max={2}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="presencePenalty" label="存在惩罚" className="mb-0">
              <InputNumber
                min={0}
                max={2}
                step={0.1}
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Form.Item name="maxTokens" label="最大令牌数" className="mb-0">
              <InputNumber
                min={1}
                step={10}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAgentModal;