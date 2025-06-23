import React, { useEffect, useState } from 'react';
import { Avatar, Typography } from 'antd';

const { Text } = Typography;

interface ThinkingBubbleProps {
  avatar?: {
    src?: string;
    icon?: React.ReactNode;
  };
  thinkingMode?: boolean;
}

const ThinkingBubble: React.FC<ThinkingBubbleProps> = ({
  avatar = { icon: '🤖' },
  thinkingMode = false
}) => {
  const [dots, setDots] = useState('');
  const [thinkingText, setThinkingText] = useState('正在思考');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    const thinkingTexts = [
      '正在思考',
      '分析问题',
      '搜索知识',
      '组织回答',
      '准备回复'
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      setThinkingText(thinkingTexts[textIndex]);
      textIndex = (textIndex + 1) % thinkingTexts.length;
    }, 1500);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="streaming-bubble-container assistant fade-in">
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

          {/* 思考内容 */}
          <div className="streaming-message">
            <div className="streaming-message-content">
              <Text style={{ color: '#6b7280', fontStyle: 'italic' }}>
                {thinkingMode ? `思考模式：${thinkingText}${dots}` : `${thinkingText}${dots}`}
              </Text>
            </div>

            {/* 思考指示器 */}
            <div className="thinking-indicator" style={{ marginTop: '8px' }}>
              <span className="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                AI正在处理您的请求
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingBubble;
