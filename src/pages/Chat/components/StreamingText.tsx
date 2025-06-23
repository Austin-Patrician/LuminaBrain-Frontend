import React, { useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface StreamingTextProps {
  content: string;
  speed?: number; // 每秒显示的字符数
  onComplete?: () => void; // 流式输出完成后的回调
  className?: string;
  thinking?: boolean; // 是否显示思考过程
}

const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  speed = 50, // 默认每秒50个字符
  onComplete,
  className = '',
  thinking = false
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const cursorIntervalRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);

  // 光标闪烁效果
  useEffect(() => {
    cursorIntervalRef.current = window.setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  // 开始流式输出
  useEffect(() => {
    if (!content) return;

    // 重置状态
    setIsStreaming(true);
    setDisplayedContent('');
    setShowCursor(true);
    currentIndexRef.current = 0;

    // 清理之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 计算每个字符的延迟时间（毫秒）
    const delay = Math.max(20, 1000 / speed); // 最小20ms延迟，确保不会太快

    const startStreaming = () => {
      intervalRef.current = window.setInterval(() => {
        currentIndexRef.current++;
        const currentIndex = currentIndexRef.current;

        if (currentIndex > content.length) {
          // 流式输出完成
          setIsStreaming(false);
          setShowCursor(false);
          setDisplayedContent(content); // 确保显示完整内容
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onComplete?.();
          return;
        }

        // 累积显示内容
        setDisplayedContent(content.substring(0, currentIndex));
      }, delay);
    };

    // 添加小延迟后开始流式输出
    const startTimer = setTimeout(startStreaming, 200);

    return () => {
      clearTimeout(startTimer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [content, speed, onComplete]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  // 处理思考模式的显示
  const renderThinkingContent = () => {
    if (!thinking) return displayedContent;

    // 简单的思考过程模拟
    const thinkingProcess = `思考中...

让我分析一下这个问题：
1. 理解问题的核心要求
2. 搜索相关知识和信息
3. 组织逻辑结构
4. 生成回答

---

${displayedContent}`;

    return thinkingProcess;
  };

  return (
    <div className={`streaming-text ${className}`}>
      <Text>
        {thinking ? renderThinkingContent() : displayedContent}
        {(isStreaming || showCursor) && (
          <span
            className={`streaming-cursor ${showCursor ? 'visible' : 'hidden'}`}
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.2em',
              backgroundColor: '#1890ff',
              marginLeft: '1px',
              animation: isStreaming ? 'none' : 'blink 1s infinite'
            }}
          />
        )}
      </Text>
    </div>
  );
};

export default StreamingText;
