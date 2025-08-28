import { useMutation } from "@tanstack/react-query";
import { Form, Input, Modal, message } from "antd";
import { useEffect } from "react";

import apiKeyService from "@/api/services/apiKeyService";
import type { ApiKey, UpdateApiKeyDto } from "#/dto/apiKey";

interface EditApiKeyModalProps {
  visible: boolean;
  apiKey: ApiKey | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EditApiKeyModal({
  visible,
  apiKey,
  onCancel,
  onSuccess,
}: EditApiKeyModalProps) {
  const [form] = Form.useForm();

  const updateApiKey = useMutation({
    mutationFn: apiKeyService.updateApiKey,
    onSuccess: () => {
      message.success("API Key updated successfully");
      form.resetFields();
      onSuccess();
    },
    onError: (error) => {
      message.error(`Failed to update API Key: ${error}`);
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!apiKey) return;

      const updateDto: UpdateApiKeyDto = {
        apiKeyId: apiKey.apiKeyId,
        apiKeyName: values.apiKeyName,
      };
      updateApiKey.mutate(updateDto);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 当模态框打开时设置表单初始值
  useEffect(() => {
    if (visible && apiKey) {
      form.setFieldsValue({
        apiKeyName: apiKey.apiKeyName,
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, apiKey, form]);

  return (
    <Modal
      title="Edit API Key"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={updateApiKey.isPending}
      okText="Update"
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

        {apiKey && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">API Key ID:</span>
                <span className="text-sm text-gray-900 font-mono">
                  {apiKey.apiKeyId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Expires At:</span>
                <span className="text-sm text-gray-900">
                  {new Date(apiKey.expirationTimeStamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Edit Limitations
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Only the API Key name can be modified</li>
                  <li>Valid period and other settings cannot be changed</li>
                  <li>To change validity, you need to create a new API Key</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
}