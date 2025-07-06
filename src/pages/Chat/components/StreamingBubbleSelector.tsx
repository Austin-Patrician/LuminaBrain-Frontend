import React from 'react';
import SSEStreamingBubble from './SSEStreamingBubble';
import BasicStreamingBubble from './BasicStreamingBubble';

interface StreamingBubbleSelectorProps {
  content: string;
  thinking?: boolean;
  onComplete?: () => void;
  className?: string;
  isStreaming?: boolean;
  useSSE?: boolean; // 是否使用SSE流式输出
}

/**
 * 智能流式输出气泡选择器组件
 * 根据模型的流式能力选择合适的bubble组件
 */
const StreamingBubbleSelector: React.FC<StreamingBubbleSelectorProps> = ({
  content,
  thinking = false,
  onComplete,
  className = '',
  isStreaming = true,
  useSSE = true
}) => {
  // 添加调试日志
  console.log('StreamingBubbleSelector props:', { content, useSSE, isStreaming });
  
  // 根据useSSE参数选择合适的bubble组件
  if (useSSE) {
    // 使用SSE流式输出 - 支持Markdown渲染
    return (
      <SSEStreamingBubble
        content={content}
        thinking={thinking}
        onComplete={onComplete}
        className={className}
        isStreaming={isStreaming}
      />
    );
  } else {
    // 使用基础流式输出 - 简单字符串显示
    return (
      <BasicStreamingBubble
        content={content}
        thinking={thinking}
        onComplete={onComplete}
        className={className}
        isStreaming={isStreaming}
      />
    );
  }
};

export default StreamingBubbleSelector;
