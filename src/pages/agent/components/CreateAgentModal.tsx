
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Divider,
  Typography,
  Tooltip,
  Button,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

// 函数选择行为选项
const FUNCTION_CHOICE_BEHAVIORS = [
  { id: "auto", name: "自动" },
  { id: "required", name: "必需" },
  { id: "none", name: "无" },
];

// 服务ID选项
const SERVICE_IDS = [
  { id: "openai", name: "OpenAI" },
  { id: "azure-openai", name: "Azure OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "google-ai", name: "Google AI" },
];

interface CreateAgentModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const { Title } = Typography;

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 这里应该调用创建Agent的API
      console.log("创建Agent:", values);

      // 模拟API调用
      setTimeout(() => {
        setLoading(false);
        form.resetFields();
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  return (
    <Modal
      title="创建AI Agent"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          创建
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        initialValues={{
          functionChoiceBehavior: "auto",
          serviceId: "openai",
          topP: 1,
          temperature: 0.7,
          maxTokens: 1000,
          enabled: true,
        }}
      >
        <Title level={5}>基本信息</Title>
        <Form.Item
          label="Agent名称"
          name="name"
          rules={[{ required: true, message: "请输入Agent名称" }]}
        >
          <Input placeholder="为您的Agent起个名字" />
        </Form.Item>

        <Form.Item
          label="指令内容"
          name="instructions"
          rules={[{ required: true, message: "请输入指令内容" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="提供详细的指令内容，描述Agent的行为和目标"
          />
        </Form.Item>

        <Divider />
        <Title level={5}>参数配置</Title>

        <Form.Item
          label={
            <span>
              服务提供商
              <Tooltip title="选择AI服务提供商">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          name="serviceId"
          rules={[{ required: true, message: "请选择服务提供商" }]}
        >
          <Select>
            {SERVICE_IDS.map((service) => (
              <Select.Option key={service.id} value={service.id}>
                {service.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span>
              函数选择行为
              <Tooltip title="决��Agent如何选择和使用函数">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          name="functionChoiceBehavior"
          rules={[{ required: true, message: "请选择函数选择行为" }]}
        >
          <Select>
            {FUNCTION_CHOICE_BEHAVIORS.map((behavior) => (
              <Select.Option key={behavior.id} value={behavior.id}>
                {behavior.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span>
              Top P
              <Tooltip title="控制随机性，较低的值会使输出更确定">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          name="topP"
        >
          <InputNumber
            min={0}
            max={1}
            step={0.01}
            precision={2}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              温度
              <Tooltip title="控制回答的随机性，值越高回答越多样化">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          name="temperature"
        >
          <InputNumber
            min={0}
            max={2}
            step={0.1}
            precision={1}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={
            <span>
              最大Token数
              <Tooltip title="控制回答的最大长度">
                <QuestionCircleOutlined style={{ marginLeft: 4 }} />
              </Tooltip>
            </span>
          }
          name="maxTokens"
        >
          <InputNumber min={1} max={4096} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="启用状态"
          name="enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateAgentModal;