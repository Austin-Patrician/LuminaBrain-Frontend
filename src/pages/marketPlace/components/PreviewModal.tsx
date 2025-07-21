import React from "react";
import { Modal, Button, Typography, Tag, Space, Divider } from "antd";
import {
  PlusOutlined,
  ShareAltOutlined,
  CloseOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined
} from "@ant-design/icons";
import type { MarketplaceItem } from "../types/marketplace";

const { Title, Text, Paragraph } = Typography;

interface PreviewModalProps {
  item: MarketplaceItem | null;
  visible: boolean;
  onClose: () => void;
  onAddToWorkspace: (item: MarketplaceItem) => void;
  onShare: (item: MarketplaceItem) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  visible,
  onClose,
  onAddToWorkspace,
  onShare
}) => {
  if (!item) return null;

  const handleAddToWorkspace = () => {
    onAddToWorkspace(item);
    onClose();
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
      closeIcon={<CloseOutlined className="text-gray-400 hover:text-gray-600" />}
      className="preview-modal"
    >
      <div className="p-6">
        {/* 头部信息 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Title level={3} className="mb-2 text-gray-900">
                {item.title}
              </Title>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <span className="flex items-center">
                  <UserOutlined className="mr-1" />
                  {item.authorName}
                </span>
                <span className="flex items-center">
                  <CalendarOutlined className="mr-1" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <span>v{item.version}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag color={
                  item.type === 'agent' ? 'blue' :
                    item.type === 'prompt' ? 'green' : 'purple'
                }>
                  {item.type === 'agent' ? 'AI Agent' :
                    item.type === 'prompt' ? '提示词' : '应用'}
                </Tag>
                {item.tags.map(tag => (
                  <Tag key={tag} className="text-gray-600">
                    <TagOutlined className="mr-1" />
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 描述 */}
        <div className="mb-6">
          <Title level={5} className="mb-3 text-gray-900">
            描述
          </Title>
          <Paragraph className="text-gray-600 leading-relaxed">
            {item.description}
          </Paragraph>
        </div>

        {/* 配置详情 */}
        <div className="mb-6">
          <Title level={5} className="mb-3 text-gray-900">
            配置详情
          </Title>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-60">
              {JSON.stringify(item.content, null, 2)}
            </pre>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{item.likes}</div>
              <div className="text-sm text-gray-500">点赞</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{item.downloads}</div>
              <div className="text-sm text-gray-500">下载</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{item.views}</div>
              <div className="text-sm text-gray-500">查看</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{item.rating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">评分</div>
            </div>
          </div>
        </div>

        <Divider />

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <Button
            icon={<ShareAltOutlined />}
            onClick={() => onShare(item)}
            className="text-gray-600 hover:text-gray-800"
          >
            分享
          </Button>

          <div className="flex items-center space-x-3">
            <Button onClick={onClose}>
              取消
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleAddToWorkspace}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              添加到工作区
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PreviewModal;
