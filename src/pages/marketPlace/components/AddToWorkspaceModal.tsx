import React, { useState } from "react";
import { Modal, Button, Form, Input, Select, Switch, Typography, Space, Alert } from "antd";
import { PlusOutlined, FolderOutlined } from "@ant-design/icons";
import type { MarketplaceItem } from "../types/marketplace";

const { Title, Text } = Typography;
const { Option } = Select;

interface AddToWorkspaceModalProps {
  item: MarketplaceItem | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (item: MarketplaceItem, options: ImportOptions) => void;
}

interface ImportOptions {
  targetWorkspace: string;
  customName?: string;
  importDependencies: boolean;
  replaceExisting: boolean;
  createBackup: boolean;
}

const AddToWorkspaceModal: React.FC<AddToWorkspaceModalProps> = ({
  item,
  visible,
  onClose,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const workspaces = [
    { id: "document-organize", name: "文档整理" },
    { id: "test", name: "test" },
    { id: "new", name: "创建新工作区..." }
  ];

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const options: ImportOptions = {
        targetWorkspace: values.targetWorkspace,
        customName: values.customName,
        importDependencies: values.importDependencies ?? true,
        replaceExisting: values.replaceExisting ?? false,
        createBackup: values.createBackup ?? true,
      };

      onConfirm(item, options);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("表单验证失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <PlusOutlined className="text-blue-600" />
          <span>添加到工作区</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={
        <div className="flex justify-end space-x-3">
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            确认添加
          </Button>
        </div>
      }
    >
      <div className="py-4">
        {/* 项目信息 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-lg">
                {item.type === 'agent' ? '🤖' : item.type === 'prompt' ? '📝' : '⚙️'}
              </span>
            </div>
            <div className="flex-1">
              <Title level={5} className="mb-1">
                {item.title}
              </Title>
              <Text className="text-gray-500 text-sm">
                {item.type === 'agent' ? 'AI Agent' :
                  item.type === 'prompt' ? '提示词' : '应用'} · {item.authorName}
              </Text>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            targetWorkspace: "document-organize",
            importDependencies: true,
            replaceExisting: false,
            createBackup: true,
          }}
        >
          {/* 目标工作区 */}
          <Form.Item
            label="选择工作区"
            name="targetWorkspace"
            rules={[{ required: true, message: "请选择目标工作区" }]}
          >
            <Select
              placeholder="选择要添加到的工作区"
              suffixIcon={<FolderOutlined />}
            >
              {workspaces.map(workspace => (
                <Option key={workspace.id} value={workspace.id}>
                  <div className="flex items-center space-x-2">
                    <FolderOutlined className="text-yellow-500" />
                    <span>{workspace.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* 自定义名称 */}
          <Form.Item
            label="自定义名称（可选）"
            name="customName"
          >
            <Input
              placeholder={`默认使用原名称: ${item.title}`}
              maxLength={50}
            />
          </Form.Item>

          {/* 导入选项 */}
          <div className="space-y-4">
            <Title level={5} className="mb-3">导入选项</Title>

            <Form.Item
              name="importDependencies"
              valuePropName="checked"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text className="font-medium">导入依赖项</Text>
                  <div className="text-sm text-gray-500">
                    同时导入该项目所需的相关依赖和配置
                  </div>
                </div>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item
              name="replaceExisting"
              valuePropName="checked"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text className="font-medium">替换同名项目</Text>
                  <div className="text-sm text-gray-500">
                    如果工作区中存在同名项目，是否替换
                  </div>
                </div>
                <Switch />
              </div>
            </Form.Item>

            <Form.Item
              name="createBackup"
              valuePropName="checked"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Text className="font-medium">创建备份</Text>
                  <div className="text-sm text-gray-500">
                    在替换前为现有项目创建备份
                  </div>
                </div>
                <Switch />
              </div>
            </Form.Item>
          </div>

          {/* 提示信息 */}
          <Alert
            message="导入说明"
            description="导入后，您可以在选定的工作区中找到该项目，并可以根据需要进行修改和使用。"
            type="info"
            showIcon
            className="mt-4"
          />
        </Form>
      </div>
    </Modal>
  );
};

export default AddToWorkspaceModal;
