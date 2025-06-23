import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Typography } from 'antd';
import RobotOutlined from '@ant-design/icons/RobotOutlined';

const { Text } = Typography;

interface LiveStreamingBubbleProps {
  content: string;
  thinking?: boolean;
  onComplete?: () => void;
  className?: string;
}

const LiveStreamingBubble: React.FC<LiveStreamingBubbleProps> = ({
  content,
  thinking = false,
  onComplete,
  className = ''
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
  const currentLengthRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const contentRef = useRef(content); // 添加content的ref

  // 更新content ref
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // 核心动画逻辑 - 使用 requestAnimationFrame 实现平滑动画
  const animate = () => {
    const now = Date.now();
    const timeDelta = now - lastUpdateTimeRef.current;

    // 控制动画速度：每50ms显示一个字符
    if (timeDelta >= 50) {
      const currentLength = currentLengthRef.current;
      const actualContentLength = contentRef.current.length; // 使用ref获取最新内容长度

      if (currentLength < actualContentLength) {
        currentLengthRef.current = currentLength + 1;
        setDisplayedContent(contentRef.current.substring(0, currentLengthRef.current));
        lastUpdateTimeRef.current = now;

        // 调试日志
        console.log(`[Streaming] 显示进度: ${currentLengthRef.current}/${actualContentLength}`);
      }
    }

    // 检查是否需要继续动画
    const currentLength = currentLengthRef.current;
    const actualContentLength = contentRef.current.length;

    if (currentLength < actualContentLength) {
      // 还有内容需要显示，继续动画
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // 已经显示完所有内容，延迟检查是否真正完成
      console.log(`[Streaming] 等待检查是否完成，当前长度: ${currentLength}, 内容长度: ${actualContentLength}`);
      setTimeout(() => {
        const finalContentLength = contentRef.current.length;
        console.log(`[Streaming] 检查完成状态: 显示=${currentLengthRef.current}, 内容=${finalContentLength}`);

        if (currentLengthRef.current >= finalContentLength && finalContentLength > 0) {
          // 确实完成了
          console.log(`[Streaming] 流式输出完成`);
          setIsComplete(true);
          onComplete?.();
          animationRef.current = null;
        } else {
          // 有新内容到达，继续动画
          console.log(`[Streaming] 发现新内容，继续动画`);
          if (!animationRef.current) {
            animationRef.current = requestAnimationFrame(animate);
          }
        }
      }, 100);
    }
  };

  // 监听内容变化
  useEffect(() => {
    console.log(`[Streaming] 内容变化: 长度=${content.length}, 当前显示=${currentLengthRef.current}, 动画运行=${!!animationRef.current}`);

    if (!content) {
      // 重置所有状态
      console.log(`[Streaming] 重置状态`);
      setDisplayedContent('');
      setIsComplete(false);
      currentLengthRef.current = 0;
      lastUpdateTimeRef.current = 0;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // 如果完成状态需要重置
    if (isComplete && content.length > currentLengthRef.current) {
      console.log(`[Streaming] 重置完成状态，继续流式输出`);
      setIsComplete(false);
    }

    // 如果有新内容且当前没有动画在运行，启动动画
    if (content.length > currentLengthRef.current && !animationRef.current) {
      console.log(`[Streaming] 启动动画，目标长度: ${content.length}`);
      lastUpdateTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [content, isComplete]);

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={`streaming-bubble-container assistant ${className}`}>
      <div className="streaming-bubble-wrapper">
        <div className="streaming-bubble-content">
          {/* 头像 */}
          <div className="streaming-avatar">
            <Avatar
              size={32}
              icon={<RobotOutlined />}
              className="assistant-avatar"
            />
          </div>

          {/* 消息内容 */}
          <div className="streaming-message">
            <div className="streaming-message-content">
              <Text>
                {displayedContent}
                {!isComplete && (
                  <span
                    className="streaming-cursor"
                    style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '1.2em',
                      backgroundColor: '#1890ff',
                      marginLeft: '2px',
                      animation: 'blink 1s infinite'
                    }}
                  />
                )}
              </Text>
            </div>

            {thinking && (
              <div className="thinking-indicator">
                <span className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <Text type="secondary" className="thinking-text">思考中...</Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamingBubble;
