import React from 'react';
import { Button, Typography, Space } from 'antd';
import { CloseOutlined, CodeOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const { Title, Text } = Typography;

interface CanvasProps {
  content: string;
  type?: 'code' | 'document';
  onClose: () => void;
}

const Canvas: React.FC<CanvasProps> = ({
  content,
  type = 'code',
  onClose
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  const detectLanguage = (content: string): string => {
    if (content.includes('import React') || content.includes('jsx')) return 'jsx';
    if (content.includes('function') || content.includes('const') || content.includes('let')) return 'javascript';
    if (content.includes('def ') || content.includes('import ')) return 'python';
    if (content.includes('<html>') || content.includes('<div>')) return 'html';
    if (content.includes('{') && content.includes('}')) return 'json';
    return 'text';
  };

  const detectedLanguage = detectLanguage(content);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          {type === 'code' ? <CodeOutlined /> : <FileTextOutlined />}
          <Title level={5} className="m-0">
            {type === 'code' ? '代码预览' : '文档预览'}
          </Title>
          {type === 'code' && (
            <Text type="secondary" className="text-sm">
              {detectedLanguage.toUpperCase()}
            </Text>
          )}
        </div>

        <Space>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopy}
          >
            复制
          </Button>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
          />
        </Space>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {type === 'code' ? (
          <SyntaxHighlighter
            language={detectedLanguage}
            style={oneDark}
            customStyle={{
              margin: 0,
              height: '100%',
              fontSize: '14px',
            }}
            showLineNumbers
            wrapLines
          >
            {content}
          </SyntaxHighlighter>
        ) : (
          <div className="p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;