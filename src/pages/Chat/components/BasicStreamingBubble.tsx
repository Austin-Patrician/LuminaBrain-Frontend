import React, { useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface BasicStreamingBubbleProps {
  content: string;
  thinking?: boolean;
  onComplete?: () => void;
  className?: string;
  isStreaming?: boolean;
}

/**
 * 基础流式输出气泡组件
 * 专为不支持SSE的模型设计，使用简单的字符串流式显示
 */
const BasicStreamingBubble: React.FC<BasicStreamingBubbleProps> = ({
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

  // 内容更新处理 - 简单字符串显示
  useEffect(() => {
    console.log('BasicStreamingBubble content updated:', content);
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

  const messageStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px 16px',
    minWidth: 0,
    flexGrow: 1,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    /* 使用Source Sans Pro作为聊天内容字体 */
    fontFamily: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif"
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
        {/* 消息内容 - 移除头像 */}
        <div style={messageStyle}>
          <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
            {/* 使用简单的文本显示，保留换行 */}
            <div style={{ display: 'inline-block', width: '100%' }}>
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                color: '#374151',
                fontSize: '14px',
                lineHeight: 1.6
              }}>
                {displayedContent}
              </div>
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
              <Text type="secondary" style={{ fontSize: '12px', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif" }}>思考中...</Text>
            </div>
          )}

          {isStreaming && (
            <div style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <Text type="secondary" style={{ fontSize: '12px', color: '#6b7280', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif" }}>
                正在生成回复...
              </Text>
            </div>
          )}
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

export default BasicStreamingBubble;
