import React, { useState } from 'react';
import { Typography, Button, Input, message, Tooltip } from 'antd';
import { EditOutlined, CopyOutlined, SaveOutlined } from '@ant-design/icons';
import { FileOutlined } from '@ant-design/icons';
import './UserMessageBubble.css';

const { Text } = Typography;
const { TextArea } = Input;

interface UserMessageBubbleProps {
  content: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>; // 新增附件支持
  onEdit?: (newContent: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({
  content,
  attachments,
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
            // 编辑模式 - 使用类似主输入框的样式
            <div className="user-message-edit-panel">
              <div className="user-message-edit-input-section">
                <TextArea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoSize={{ minRows: 2, maxRows: 8 }}
                  placeholder="编辑消息内容..."
                  className="user-message-edit-input"
                  autoFocus
                />
              </div>
              <div className="user-message-edit-controls">
                <div className="edit-controls-left">
                  <Text type="secondary" className="edit-char-count">
                    {editContent.length} 字符
                  </Text>
                </div>
                <div className="edit-controls-right">
                  <Button
                    size="middle"
                    onClick={handleCancelEdit}
                    className="edit-cancel-btn"
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    size="middle"
                    onClick={handleSaveEdit}
                    icon={<SaveOutlined />}
                    className="edit-save-btn"
                  >
                    保存
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // 显示模式
            <div className="user-message-content">
              <Text>{content}</Text>

              {/* 显示附件 */}
              {attachments && attachments.length > 0 && (
                <div className="user-message-attachments">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="user-attachment-item">
                      <FileOutlined className="attachment-icon" />
                      <Text className="attachment-name" ellipsis>
                        {attachment.name}
                      </Text>
                      <Text className="attachment-size" type="secondary">
                        ({(attachment.size / 1024 / 1024).toFixed(1)} MB)
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 工具栏 - 使用新的样式 */}
        {!isEditing && (
          <div className="user-message-toolbar">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UserMessageBubble;