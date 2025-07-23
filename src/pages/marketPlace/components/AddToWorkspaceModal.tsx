import React, { useState } from "react";
import { Modal, Button, Form, Input } from "antd";
import { SHARED_ICON_OPTIONS } from "@/constant/icons";
import type { MarketplaceItem } from "../types/marketplace";

interface AddToWorkspaceModalProps {
  item: MarketplaceItem | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (item: MarketplaceItem, options: ImportOptions) => void;
}

interface ImportOptions {
  customName?: string;
  description?: string;
  selectedIcon?: string;
}



const AddToWorkspaceModal: React.FC<AddToWorkspaceModalProps> = ({
  item,
  visible,
  onClose,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('🤖');

  if (!item) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const options: ImportOptions = {
        customName: values.customName,
        description: values.description,
        selectedIcon: selectedIcon,
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
    setSelectedIcon('🤖');
    onClose();
  };

  const handleIconSelect = (iconKey: string) => {
    setSelectedIcon(iconKey);
  };

  return (
    <Modal
      title="添加到工作区"
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
            创建
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            customName: item.title,
            description: item.description,
          }}
        >
          {/* 应用名称 & 图标 */}
          <Form.Item
            label="应用名称 & 图标"
            name="customName"
            rules={[{ required: true, message: "请输入应用名称" }]}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                  {selectedIcon}
                </div>
                <Input
                  placeholder="输入应用名称"
                  bordered={false}
                  className="bg-transparent"
                  maxLength={50}
                />
              </div>

              {/* 图标选择器 */}
              <div className="">
                <div className="text-sm text-gray-600 mb-2">选择图标：</div>
                <div className="grid grid-cols-6 gap-2">
                  {SHARED_ICON_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleIconSelect(option.key)}
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all
                        ${selectedIcon === option.key
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                        }
                      `}
                      title={option.label}
                    >
                      {option.key}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Form.Item>

          {/* 描述 */}
          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              placeholder="输入应用的描述"
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddToWorkspaceModal;
