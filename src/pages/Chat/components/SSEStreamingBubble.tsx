import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Typography } from 'antd';
import RobotOutlined from '@ant-design/icons/RobotOutlined';
import ChatMarkdown from './ChatMarkdown';

const { Text } = Typography;

interface SSEStreamingBubbleProps {
  content: string;
  thinking?: boolean;
  onComplete?: () => void;
  className?: string;
  isStreaming?: boolean;
}

/**
 * SSE流式输出气泡组件 - Markdown支持版本
 * 专为后台OpenAI流式输出设计，支持Markdown渲染
 */
const SSEStreamingBubble: React.FC<SSEStreamingBubbleProps> = ({
  content,
  thinking = false,
  onComplete,
  className = '',
  isStreaming = true
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const hideTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  // 稳定化回调引用
  onCompleteRef.current = onComplete;

  // 一次性初始化
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // 内容更新处理 - 直接设置显示内容，让 Markdown 组件处理渲染
  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  // 光标和状态管理
  useEffect(() => {
    // 清理之前的定时器
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (!isStreaming) {
      // 完成状态：延迟隐藏光标
      hideTimerRef.current = window.setTimeout(() => {
        setShowCursor(false);
        onCompleteRef.current?.();
      }, 1000);
    } else {
      setShowCursor(true);
    }
  }, [isStreaming]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // 样式定义
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '16px',
    opacity: isInitialized ? 1 : 0,
    transform: isInitialized ? 'translateY(0)' : 'translateY(10px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  };

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    maxWidth: '80%',
    minWidth: 0
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    minWidth: 0,
    width: '100%'
  };

  const avatarStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop: '2px'
  };

  const messageStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px 16px',
    minWidth: 0,
    flexGrow: 1,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  const cursorStyle: React.CSSProperties = {
    display: showCursor ? 'inline-block' : 'none',
    width: '2px',
    height: '1.2em',
    backgroundColor: '#1890ff',
    marginLeft: '2px',
    verticalAlign: 'text-bottom',
    animation: showCursor ? 'cursor-blink 1s infinite' : 'none'
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={wrapperStyle}>
        <div style={contentStyle}>
          {/* 头像 */}
          <div style={avatarStyle}>
            <Avatar
              size={32}
              icon={<RobotOutlined />}
              style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
            />
          </div>

          {/* 消息内容 */}
          <div style={messageStyle}>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
              {/* 使用 Markdown 组件渲染内容 */}
              <div style={{ display: 'inline-block', width: '100%' }}>
                <ChatMarkdown>{displayedContent}</ChatMarkdown>
                <span style={cursorStyle} />
              </div>
            </div>

            {thinking && (
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'flex', gap: '4px' }}>
                  <span style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                    animation: 'thinking-pulse 1.4s infinite ease-in-out both'
                  }}></span>
                  <span style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                    animation: 'thinking-pulse 1.4s infinite ease-in-out both',
                    animationDelay: '-0.16s'
                  }}></span>
                  <span style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#9ca3af',
                    animation: 'thinking-pulse 1.4s infinite ease-in-out both',
                    animationDelay: '0s'
                  }}></span>
                </span>
                <Text type="secondary" style={{ fontSize: '12px' }}>思考中...</Text>
              </div>
            )}

            {isStreaming && (
              <div style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <Text type="secondary" style={{ fontSize: '12px', color: '#6b7280' }}>
                  正在生成回复...
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加光标动画样式 */}
      <style>{`
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes thinking-pulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SSEStreamingBubble;