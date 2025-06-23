import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';

interface AttachmentUploadProps {
  onUpload: (file: File) => void;
  maxSize?: number; // MB
  acceptTypes?: string[];
  className?: string; // 新增className支持
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  onUpload,
  maxSize = 10,
  acceptTypes = ['image/*', 'text/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    // 检查文件类型
    const isValidType = acceptTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      message.error('不支持的文件类型');
      return;
    }

    onUpload(file);

    // 清空输入框，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={acceptTypes.join(',')}
        multiple={false}
      />
      <Button
        type="text"
        icon={<PaperClipOutlined />}
        onClick={handleClick}
        title="上传附件"
        size="small"
        className={className}
      />
    </>
  );
};

export default AttachmentUpload;