import { useMutation } from "@tanstack/react-query";
import { Form, Input, Modal, Select, message } from "antd";
import { useEffect } from "react";

import apiKeyService from "@/api/services/apiKeyService";
import { VALID_DAYS_OPTIONS } from "#/dto/apiKey";
import type { CreateApiKeyDto, ApiKey } from "#/dto/apiKey";

interface CreateApiKeyModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: (apiKeyData: ApiKey) => void;
}

export default function CreateApiKeyModal({
  visible,
  onCancel,
  onSuccess,
}: CreateApiKeyModalProps) {
  const [form] = Form.useForm();

  const createApiKey = useMutation({
    mutationFn: apiKeyService.createApiKey,
    onSuccess: (response) => {
      message.success("API Key created successfully");
      form.resetFields();
      // 传递创建成功的API Key数据给父组件
      onSuccess(response);
    },
    onError: (error) => {
      message.error(`Failed to create API Key: ${error}`);
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const createDto: CreateApiKeyDto = {
        apiKeyName: values.apiKeyName,
        validDays: values.validDays,
      };
      createApiKey.mutate(createDto);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 重置表单当模态框关闭时
  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  // 有效期选项直接使用VALID_DAYS_OPTIONS

  return (
    <Modal
      title="Create API Key"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={createApiKey.isPending}
      okText="Create"
      cancelText="Cancel"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="mt-6"
      >
        <Form.Item
          name="apiKeyName"
          label="API Key Name"
          rules={[
            {
              required: true,
              message: "Please enter API Key name",
            },
            {
              min: 2,
              message: "API Key name must be at least 2 characters",
            },
            {
              max: 50,
              message: "API Key name cannot exceed 50 characters",
            },
          ]}
        >
          <Input
            placeholder="Enter a descriptive name for your API Key"
            maxLength={50}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="validDays"
          label="Valid Period"
          rules={[
            {
              required: true,
              message: "Please select valid period",
            },
          ]}
          initialValue={30}
        >
          <Select
            placeholder="Select valid period"
            options={VALID_DAYS_OPTIONS}
          />
        </Form.Item>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Once created, the API Key cannot be viewed again</li>
                  <li>Make sure to copy and store it securely</li>
                  <li>You can only update the name after creation</li>
                  <li>Expired keys will be automatically disabled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
}