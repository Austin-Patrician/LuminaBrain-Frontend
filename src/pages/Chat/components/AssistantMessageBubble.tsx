import React, { useState } from 'react';
import { Typography, Button, Tooltip } from 'antd';
import {
  RedoOutlined,
  CopyOutlined,
  ShareAltOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons';
import ChatMarkdown from './ChatMarkdown';
import './AssistantMessageBubble.css';

const { Text } = Typography;

interface AssistantMessageBubbleProps {
  content: string;
  responseTime?: number; // 响应时间，以秒为单位
  onRegenerate?: () => void;
  onCopy?: (content: string) => void;
  onShare?: (content: string) => void;
  onLike?: () => void;
  onDislike?: () => void;
  thinking?: boolean;
  className?: string;
}

const AssistantMessageBubble: React.FC<AssistantMessageBubbleProps> = ({
  content,
  responseTime,
  onRegenerate,
  onCopy,
  onShare,
  onLike,
  onDislike,
  thinking = false,
  className = ''
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // 处理复制
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onCopy?.(content);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 处理共享链接复制
  const handleShare = async () => {
    try {
      // 生成分享链接（这里可以根据实际需求调整）
      const shareUrl = `${window.location.origin}/share?content=${encodeURIComponent(content)}`;
      await navigator.clipboard.writeText(shareUrl);
      onShare?.(content);
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  // 处理点赞
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    onLike?.();
  };

  // 处理点踩
  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    onDislike?.();
  };

  // 处理重新生成
  const handleRegenerate = () => {
    onRegenerate?.();
  };

  return (
    <div className={`assistant-message-bubble-container ${className}`}>
      <div className="assistant-message-bubble-wrapper">
        {/* 消息气泡 - 移除头像 */}
        <div className="assistant-message-bubble">
          {/* 消息内容 - 直接显示，无头像 */}
          <div className="assistant-message-content-wrapper">
            <div className="assistant-message-content">
              <ChatMarkdown>{content}</ChatMarkdown>
            </div>

            {thinking && (
              <div className="assistant-thinking-indicator">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  思考模式已完成
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* 工具栏 */}
        <div className="assistant-message-toolbar">
          <div className="assistant-toolbar-left">
            {/* 重新生成 */}
            <Tooltip title="重新生成" placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                onClick={handleRegenerate}
                className="assistant-toolbar-btn"
              />
            </Tooltip>

            {/* 复制 */}
            <Tooltip title="复制" placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                className="assistant-toolbar-btn"
              />
            </Tooltip>

            {/* 复制分享链接 */}
            <Tooltip title="复制分享链接" placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                className="assistant-toolbar-btn"
              />
            </Tooltip>

            {/* 点赞 */}
            <Tooltip title="赞" placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<LikeOutlined />}
                onClick={handleLike}
                className={`assistant-toolbar-btn ${isLiked ? 'liked' : ''}`}
              />
            </Tooltip>

            {/* 需要改进 */}
            <Tooltip title="需要改进" placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<DislikeOutlined />}
                onClick={handleDislike}
                className={`assistant-toolbar-btn ${isDisliked ? 'disliked' : ''}`}
              />
            </Tooltip>
          </div>

          <div className="assistant-toolbar-right">
            {/* 响应时间 */}
            <div className="assistant-time-info">
              {responseTime && (
                <Text type="secondary" className="assistant-response-time">
                  {responseTime}秒
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantMessageBubble;