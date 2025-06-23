import React, { useState, useEffect } from 'react';
import { Avatar } from 'antd';
import StreamingText from './StreamingText';

interface StreamingBubbleProps {
  content: string;
  avatar?: {
    src?: string;
    icon?: React.ReactNode;
  };
  onComplete?: () => void;
  thinking?: boolean;
  speed?: number;
  className?: string;
}

const StreamingBubble: React.FC<StreamingBubbleProps> = ({
  content,
  avatar = { icon: '🤖' },
  onComplete,
  thinking = false,
  speed = 50, // 降低默认速度，让流式效果更明显
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 添加入场动画延迟
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`streaming-bubble-container assistant ${isVisible ? 'fade-in' : ''} ${className}`}
    >
      <div className="streaming-bubble-wrapper">
        <div className="streaming-bubble-content">
          {/* 头像 */}
          <div className="streaming-avatar">
            <Avatar
              size={32}
              src={avatar.src}
              icon={avatar.icon}
              className="assistant-avatar"
            />
          </div>

          {/* 消息内容 */}
          <div className="streaming-message">
            <div className="streaming-message-content">
              <StreamingText
                content={content}
                speed={speed}
                onComplete={onComplete}
                thinking={thinking}
                className="streaming-text-content"
              />
            </div>

            {thinking && (
              <div className="thinking-indicator">
                <span className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingBubble;
