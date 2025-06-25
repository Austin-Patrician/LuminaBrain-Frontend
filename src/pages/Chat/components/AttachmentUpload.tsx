import React, { useRef } from 'react';
import { Button, message } from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';

interface AttachmentUploadProps {
  onUpload: (files: File[]) => void; // 修改为支持多文件
  maxSize?: number; // MB
  acceptTypes?: string[];
  className?: string;
  multiple?: boolean; // 新增多文件支持选项
}

const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  onUpload,
  maxSize = 10,
  acceptTypes = ['image/*', 'text/*', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  className,
  multiple = true // 默认支持多文件
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    // 检查每个文件
    Array.from(files).forEach((file) => {
      // 检查文件大小
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`文件 "${file.name}" 大小超过 ${maxSize}MB`);
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
        errors.push(`文件 "${file.name}" 类型不支持`);
        return;
      }

      validFiles.push(file);
    });

    // 显示错误信息
    if (errors.length > 0) {
      message.error(errors.join(', '));
    }

    // 上传有效文件
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }

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
        multiple={multiple}
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