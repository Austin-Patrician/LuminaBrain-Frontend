import { CopyOutlined } from "@ant-design/icons";
import { Button, Modal, Typography, message } from "antd";
import { useState } from "react";

import type { ApiKey } from "#/dto/apiKey";

const { Text } = Typography;

interface ApiKeySuccessModalProps {
  visible: boolean;
  apiKeyData: ApiKey | null;
  onClose: () => void;
}

export default function ApiKeySuccessModal({
  visible,
  apiKeyData,
  onClose,
}: ApiKeySuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (apiKeyData?.apiKeyValue) {
      try {
        await navigator.clipboard.writeText(apiKeyData.apiKeyValue);
        setCopied(true);
        message.success("API Key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        message.error("Failed to copy API Key");
      }
    }
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      title="Create a Key"
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      maskClosable={false}
      closable={true}
    >
      <div className="py-6">
        <div className="mb-4">
          <Text className="text-gray-600 block mb-4">
            Your new key:
          </Text>
          
          <div className="bg-gray-50 border rounded p-3 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono text-gray-800 break-all pr-2 flex-1">
                {apiKeyData?.apiKeyValue || 'Loading...'}
              </code>
              <Button
                type="text"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                className="ml-2 flex-shrink-0"
                size="small"
              />
            </div>
          </div>
          
          <Text className="text-gray-600 block mb-2">
            Please copy it now and write it down somewhere safe. <strong>You will not be able to see it again.</strong>
          </Text>
          
          <Text className="text-gray-500">
            You can use it with OpenAI-compatible apps, or{' '}
            <span className="text-blue-500 cursor-pointer">your own code</span>
          </Text>
        </div>
      </div>
    </Modal>
  );
}