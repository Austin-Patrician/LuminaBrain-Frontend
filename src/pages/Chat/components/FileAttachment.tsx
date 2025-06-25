import React from 'react';
import { Button, Tooltip, Modal, Image, Typography } from 'antd';
import { DeleteOutlined, EyeOutlined, FileOutlined, FileImageOutlined } from '@ant-design/icons';
import './FileAttachment.css';

const { Text } = Typography;

interface FileAttachmentProps {
  file: File;
  onRemove: () => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  file,
  onRemove
}) => {
  const [previewVisible, setPreviewVisible] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  const isImage = file.type.startsWith('image/');

  // 获取文件图标
  const getFileIcon = () => {
    if (isImage) {
      return <FileImageOutlined />;
    }
    return <FileOutlined />;
  };

  // 处理预览
  const handlePreview = () => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewVisible(true);
    } else {
      // 对于非图片文件，显示文件信息
      Modal.info({
        title: '文件信息',
        content: (
          <div>
            <p><strong>文件名:</strong> {file.name}</p>
            <p><strong>文件大小:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>文件类型:</strong> {file.type || '未知'}</p>
            <p><strong>最后修改:</strong> {new Date(file.lastModified).toLocaleString()}</p>
          </div>
        ),
      });
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 获取文件类型用于样式
  const getFileType = () => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (file.type.startsWith('image/')) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'doc';
    if (['xls', 'xlsx'].includes(extension)) return 'xls';
    if (['txt', 'md'].includes(extension)) return 'text';
    return 'file';
  };

  return (
    <>
      <div 
        className="file-attachment" 
        data-file-type={getFileType()}
      >
        <div className="file-attachment-content">
          <div className="file-icon">
            {getFileIcon()}
          </div>
          <div className="file-info">
            <Tooltip title={file.name} placement="top">
              <Text className="file-name" ellipsis>
                {file.name}
              </Text>
            </Tooltip>
            <Text className="file-size" type="secondary">
              {formatFileSize(file.size)}
            </Text>
          </div>
        </div>

        <div className="file-attachment-actions">
          <Tooltip title="预览文件">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={handlePreview}
              className="file-action-btn preview-btn"
            />
          </Tooltip>
          <Tooltip title="删除文件">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={onRemove}
              className="file-action-btn delete-btn"
              danger
            />
          </Tooltip>
        </div>
      </div>

      {/* 图片预览模态框 */}
      <Modal
        open={previewVisible}
        title={file.name}
        footer={null}
        onCancel={() => {
          setPreviewVisible(false);
          URL.revokeObjectURL(previewUrl);
        }}
        width={800}
        centered
      >
        <Image
          src={previewUrl}
          alt={file.name}
          style={{ width: '100%' }}
          preview={false}
        />
      </Modal>
    </>
  );
};

export default FileAttachment;