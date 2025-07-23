import React, { useState, useEffect, useRef } from 'react';
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
  responseTime?: number;
  onRegenerate?: () => void;
  onCopy?: (content: string) => void;
  onShare?: (content: string) => void;
  onLike?: () => void;
  onDislike?: () => void;
  thinking?: boolean;
  className?: string;
  streaming?: boolean;
  streamingContent?: string;
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
  className = '',
  streaming = false,
  streamingContent = ''
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [displayContent, setDisplayContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (streaming) {
      setDisplayContent(streamingContent);
    } else {
      setDisplayContent(content);
    }
  }, [streaming, streamingContent, content]);

  useEffect(() => {
    if (contentRef.current && streaming) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [displayContent, streaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onCopy?.(content);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/share?content=${encodeURIComponent(content)}`;
      await navigator.clipboard.writeText(shareUrl);
      onShare?.(content);
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    onLike?.();
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
    onDislike?.();
  };

  const handleRegenerate = () => {
    onRegenerate?.();
  };

  return (
    <div className={`assistant-message-bubble-container ${className}`}>
      <div className="assistant-message-bubble-wrapper">
        <div className="assistant-message-bubble">
          <div className="assistant-message-content-wrapper" ref={contentRef}>
            <div className="assistant-message-content">
              <ChatMarkdown>{displayContent}</ChatMarkdown>
              {streaming && <span className="streaming-cursor">▋</span>}
            </div>
            {thinking && !streaming && (
              <div className="assistant-thinking-indicator">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  思考模式已完成
                </Text>
              </div>
            )}
          </div>
        </div>

        <div className="assistant-message-toolbar">
          <div className="assistant-toolbar-left">
            <Tooltip title={streaming ? "流式输出中，请稍候" : "重新生成"} placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                onClick={handleRegenerate}
                disabled={streaming}
                className="assistant-toolbar-btn"
              />
            </Tooltip>

            <Tooltip title={streaming ? "流式输出中，请稍候" : "复制"} placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                disabled={streaming}
                className="assistant-toolbar-btn"
              />
            </Tooltip>

            <Tooltip title={streaming ? "流式输出中，请稍候" : "复制分享链接"} placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                disabled={streaming}
                className="assistant-toolbar-btn"
              />
            </Tooltip>

            <Tooltip title={streaming ? "流式输出中，请稍候" : "赞"} placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<LikeOutlined />}
                onClick={handleLike}
                disabled={streaming}
                className={`assistant-toolbar-btn ${isLiked ? 'liked' : ''}`}
              />
            </Tooltip>

            <Tooltip title={streaming ? "流式输出中，请稍候" : "需要改进"} placement="bottom" overlayClassName="assistant-message-tooltip">
              <Button
                type="text"
                size="small"
                icon={<DislikeOutlined />}
                onClick={handleDislike}
                disabled={streaming}
                className={`assistant-toolbar-btn ${isDisliked ? 'disliked' : ''}`}
              />
            </Tooltip>
          </div>

          <div className="assistant-toolbar-right">
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