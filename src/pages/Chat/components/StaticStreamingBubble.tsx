import React from 'react';
import { Avatar, Typography, Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface StaticStreamingBubbleProps {
  content: string;
  avatar?: {
    src?: string;
    icon?: React.ReactNode;
  };
  thinking?: boolean;
  timestamp: Date;
  messageActions?: MenuProps['items'];
  className?: string;
}

const StaticStreamingBubble: React.FC<StaticStreamingBubbleProps> = ({
  content,
  avatar = { icon: '🤖' },
  thinking = false,
  timestamp,
  messageActions,
  className = ''
}) => {
  // 处理思考模式的显示
  const renderThinkingContent = () => {
    if (!thinking) return content;

    // 简单的思考过程模拟
    const thinkingProcess = `思考中...

让我分析一下这个问题：
1. 理解问题的核心要求
2. 搜索相关知识和信息
3. 组织逻辑结构和回答框架
4. 生成回答

---

${content}`;

    return thinkingProcess;
  };

  return (
    <div className={`streaming-bubble-container assistant fade-in ${className}`}>
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
              <Text style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {thinking ? renderThinkingContent() : content}
              </Text>
            </div>

            {thinking && (
              <div className="thinking-indicator">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  思考模式已完成
                </Text>
              </div>
            )}

            {/* 消息底部信息 */}
            <div
              className="message-footer"
              style={{
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Text type="secondary" className="message-time" style={{ fontSize: '12px' }}>
                {timestamp.toLocaleTimeString()}
              </Text>
              {messageActions && (
                <div className="message-actions">
                  <Dropdown
                    menu={{ items: messageActions }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<span>⋮</span>}
                      style={{ fontSize: '12px', padding: '2px 4px' }}
                    />
                  </Dropdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticStreamingBubble;
