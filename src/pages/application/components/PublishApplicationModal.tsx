import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  message,
  Upload,
  UploadProps,
  Popover,
  Tabs,
} from "antd";
import {
  UploadOutlined
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import applicationService from "@/api/services/applicationService";
import { SHARED_ICON_OPTIONS, EMOJI_ICONS } from "@/constant/icons";
import type { Application } from "#/entity";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PublishApplicationModalProps {
  visible: boolean;
  application: Application | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PublishFormData {
  name: string;
  description: string;
  icon?: string;
}



export default function PublishApplicationModal({
  visible,
  application,
  onCancel,
  onSuccess,
}: PublishApplicationModalProps) {
  const [form] = Form.useForm<PublishFormData>();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [iconUrl, setIconUrl] = useState<string>("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [iconSelectorVisible, setIconSelectorVisible] = useState(false);

  // 发布应用的mutation
  const publishMutation = useMutation({
    mutationFn: (data: any) => applicationService.publishApplication(data),
    onSuccess: () => {
      message.success("应用发布成功！");
      setConfirmModalVisible(false);
      onSuccess();
      form.resetFields();
      setIconUrl("");
    },
    onError: (error: any) => {
      message.error(`发布失败: ${error.message || "未知错误"}`);
    },
  });

  // 当弹窗打开时，初始化表单数据
  const handleModalOpen = () => {
    if (application) {
      form.setFieldsValue({
        name: application.name,
        description: application.description || "",
      });
      setIconUrl(""); // 可以根据需要设置默认图标
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 确认发布
  const handleConfirmPublish = () => {
    const formValues = form.getFieldsValue();
    const publishData = {
      applicationId: application?.id,
      name: formValues.name,
      description: formValues.description,
      icon: selectedEmoji || iconUrl,
    };

    publishMutation.mutate(publishData);
  };

  // 处理表情选择
  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setIconUrl(""); // 清除上传的图标
    setIconSelectorVisible(false);
  };

  // 处理图标上传
  const uploadProps: UploadProps = {
    name: "file",
    action: "/api/upload", // 需要根据实际API调整
    headers: {
      authorization: "authorization-text",
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === "done") {
        setIconUrl(info.file.response?.url || "");
        setSelectedEmoji(""); // 清除选择的表情
        message.success(`${info.file.name} 上传成功`);
        setIconSelectorVisible(false);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} 上传失败`);
      }
    },
    showUploadList: false,
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    setIconUrl("");
    setSelectedEmoji("");
    setIconSelectorVisible(false);
    setConfirmModalVisible(false);
    onCancel();
  };

  // 图标选择器内容
  const iconSelectorContent = (
    <div className="w-96">
      <Tabs
        defaultActiveKey="preset"
        items={[
          {
            key: 'preset',
            label: '预设图标',
            children: (
              <div className="max-h-64 overflow-y-auto">
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-3">常用图标</div>
                  <div className="grid grid-cols-6 gap-2">
                    {SHARED_ICON_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${selectedEmoji === option.key
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                          }`}
                        onClick={() => handleEmojiSelect(option.key)}
                        title={option.label}
                      >
                        {option.key}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-3">表情图标</div>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_ICONS.map((emoji, index) => (
                      <button
                        key={index}
                        className={`w-8 h-8 flex items-center justify-center text-lg transition-colors ${selectedEmoji === emoji
                            ? 'bg-blue-100 border-2 border-blue-500 rounded'
                            : 'hover:bg-gray-100 rounded'
                          }`}
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'upload',
            label: '上传图片',
            children: (
              <div className="py-4">
                <div className="text-center">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} size="large">
                      点击上传图片
                    </Button>
                  </Upload>
                  <div className="text-sm text-gray-500 mt-2">
                    支持 JPG、PNG 格式，文件大小不超过 2MB
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );

  return (
    <>
      <Modal
        title="发布应用到探索社区"
        open={visible}
        onCancel={handleCancel}
        afterOpenChange={(open) => {
          if (open) {
            handleModalOpen();
          }
        }}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={publishMutation.isPending}
            onClick={handleSubmit}
          >
            确认发布
          </Button>,
        ]}
        width={600}
      >
        <div className="py-4">
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
          >
            {/* 应用图标 */}
            <Form.Item label="应用图标">
              <div className="flex items-center space-x-4">
                <Popover
                  content={iconSelectorContent}
                  title="选择应用图标"
                  trigger="click"
                  open={iconSelectorVisible}
                  onOpenChange={setIconSelectorVisible}
                  placement="bottomLeft"
                >
                  <div className="cursor-pointer">
                    <Avatar
                      size={64}
                      src={iconUrl}
                      style={{
                        backgroundColor: (iconUrl || selectedEmoji) ? "transparent" : "#f56a00",
                        fontSize: selectedEmoji ? "24px" : "24px",
                        border: "2px dashed #d9d9d9",
                      }}
                      className="hover:border-blue-400 transition-colors"
                    >
                      {selectedEmoji || (!iconUrl && (application?.name?.charAt(0) || "A"))}
                    </Avatar>
                  </div>
                </Popover>
                <div className="text-xs text-gray-500 mt-2">
                  点击头像选择图标
                </div>
              </div>
            </Form.Item>

            {/* 应用名称 */}
            <Form.Item
              label="应用名称"
              name="name"
              rules={[
                { required: true, message: "请输入应用名称" },
                { max: 50, message: "应用名称不能超过50个字符" },
              ]}
            >
              <Input placeholder="请输入应用名称" />
            </Form.Item>

            {/* 应用描述 */}
            <Form.Item
              label="应用描述"
              name="description"
              rules={[
                { required: true, message: "请输入应用描述" },
                { max: 500, message: "应用描述不能超过500个字符" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="请详细描述您的应用功能和特点，这将帮助其他用户更好地了解您的应用"
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>

          {/* 提示信息 */}
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <Text type="secondary" className="text-sm">
              💡 发布后，您的应用将在探索社区中展示，其他用户可以查看和使用您的应用。
            </Text>
          </div>
        </div>
      </Modal>

      {/* 二次确认弹窗 */}
      <Modal
        title="确认发布"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={publishMutation.isPending}
            onClick={handleConfirmPublish}
          >
            确认发布
          </Button>,
        ]}
        width={400}
      >
        <div className="py-4">
          <div className="text-center">
            <div className="text-lg mb-4">⚠️ 重要提醒</div>
            <div className="text-gray-600 mb-4">
              您即将将应用「{form.getFieldValue("name")}」发布到探索社区。
            </div>
            <div className="text-gray-600 mb-4">
              发布后，该应用将成为开源应用，所有用户都可以查看和使用。
            </div>
            <div className="text-red-500 font-medium">
              此操作不可撤销，请确认是否继续？
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}