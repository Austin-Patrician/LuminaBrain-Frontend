import React, { useState } from 'react';
import { Typography, Button, Input, message, Tooltip } from 'antd';
import { EditOutlined, CopyOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import './UserMessageBubble.css';

const { Text } = Typography;
const { TextArea } = Input;

interface UserMessageBubbleProps {
  content: string;
  onEdit?: (newContent: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({
  content,
  onEdit,
  onCopy,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // 处理编辑保存
  const handleSaveEdit = () => {
    if (!editContent.trim()) {
      message.error('消息内容不能为空');
      return;
    }

    if (editContent.trim() === content) {
      setIsEditing(false);
      return;
    }

    onEdit?.(editContent.trim());
    setIsEditing(false);
    message.success('消息已更新');
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  // 处理复制
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onCopy?.(content);
      message.success('消息已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  };

  return (
    <div className={`user-message-bubble-container ${className}`}>
      <div className="user-message-bubble-wrapper">
        {/* 消息气泡 */}
        <div className="user-message-bubble">
          {isEditing ? (
            // 编辑模式
            <div className="user-message-edit-container">
              <TextArea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoSize={{ minRows: 1, maxRows: 6 }}
                placeholder="输入消息内容..."
                className="user-message-edit-textarea"
                autoFocus
              />
              <div className="user-message-edit-actions">
                <Button
                  size="small"
                  onClick={handleCancelEdit}
                  icon={<CloseOutlined />}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleSaveEdit}
                  icon={<SaveOutlined />}
                >
                  保存
                </Button>
              </div>
            </div>
          ) : (
            // 显示模式
            <div className="user-message-content">
              <Text>{content}</Text>
            </div>
          )}
        </div>

        {/* 操作按钮 - 消息下方右对齐 */}
        {!isEditing && (
          <div className="user-message-actions">
            <Tooltip
              title="编辑消息"
              placement="bottom"
              overlayClassName="user-message-tooltip"
            >
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
                className="user-message-action-btn"
              />
            </Tooltip>
            <Tooltip
              title="复制消息"
              placement="bottom"
              overlayClassName="user-message-tooltip"
            >
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                className="user-message-action-btn"
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessageBubble;