import React from 'react';
import ReactMarkdown from "react-markdown";
import type { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styled from "styled-components";
import { themeVars } from "@/theme/theme.css";
import "@/utils/highlight";

// 商业级聊天Markdown样式 - 紧凑版本 + 专业字体
const ChatMarkdownContainer = styled.div`
  line-height: 1.4;
  color: inherit;
  font-size: 14px;
  font-family: var(--font-family-content);
  font-weight: 400;
  letter-spacing: 0.01em;
  
  // 移除默认的第一个和最后一个元素的外边距
  > *:first-child {
    margin-top: 0 !important;
  }
  > *:last-child {
    margin-bottom: 0 !important;
  }
  
  // 标题 - 现代化设计，紧凑间距，专业字体
  h1 {
    font-size: 18px;
    line-height: 1.2;
    font-weight: 700;
    margin: 8px 0 4px 0;
    color: ${themeVars.colors.text.primary};
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 3px;
    font-family: var(--font-family-heading);
    letter-spacing: -0.01em;
  }
  h2 {
    font-size: 16px;
    line-height: 1.2;
    font-weight: 600;
    margin: 6px 0 3px 0;
    color: ${themeVars.colors.text.primary};
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 2px;
    font-family: var(--font-family-heading);
    letter-spacing: -0.005em;
  }
  h3 {
    font-size: 15px;
    line-height: 1.2;
    font-weight: 600;
    margin: 5px 0 2px 0;
    color: ${themeVars.colors.text.primary};
    font-family: var(--font-family-heading);
  }
  h4, h5, h6 {
    font-size: 14px;
    line-height: 1.2;
    font-weight: 600;
    margin: 4px 0 2px 0;
    color: ${themeVars.colors.text.primary};
    font-family: var(--font-family-heading);
  }

  // 段落 - 大幅减少间距，优化字体
  p {
    margin: 2px 0;
    line-height: 1.5;
    color: inherit;
    word-wrap: break-word;
    hyphens: auto;
    font-family: var(--font-family-content);
    font-weight: 400;
  }

  // 链接 - 现代化样式
  a {
    color: #0066cc;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
    font-weight: 500;
    
    &:hover {
      color: #0052a3;
      border-bottom-color: #0052a3;
    }
  }

  // 强调 - 更突出的样式
  strong {
    font-weight: 600;
    color: ${themeVars.colors.text.primary};
    font-family: var(--font-family-content);
  }
  
  em {
    font-style: italic;
    color: #666;
    font-family: var(--font-family-content);
  }

  // 行内代码 - 现代化设计，专业等宽字体
  code {
    font-size: 12px;
    font-family: var(--font-family-mono);
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #d73a49;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e1e4e8;
    font-weight: 500;
    letter-spacing: 0;
  }

  // 代码块 - 专业级样式，紧凑间距，JetBrains Mono字体
  pre {
    background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
    border: 1px solid #4a5568;
    border-radius: 6px;
    padding: 10px 12px;
    margin: 8px 0;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    font-family: var(--font-family-mono);
    letter-spacing: 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
    }
    
    code {
      background: none;
      border: none;
      padding: 0;
      color: #e2e8f0;
      font-size: inherit;
      font-weight: 400;
      font-family: var(--font-family-mono);
    }

    // 代码高亮样式增强
    .hljs {
      background: transparent;
      font-family: var(--font-family-mono);
    }
  }

  // 列表 - 现代化设计，紧凑间距
  ul, ol {
    margin: 4px 0;
    padding-left: 16px;
    font-family: var(--font-family-content);
    
    li {
      margin: 1px 0;
      line-height: 1.4;
      position: relative;
      font-weight: 400;
      
      &::marker {
        color: #6b7280;
      }
    }
    
    // 嵌套列表
    ul, ol {
      margin: 1px 0;
    }
  }

  // 无序列表自定义样式
  ul li {
    list-style: none;
    
    &::before {
      content: '•';
      color: #0066cc;
      font-weight: bold;
      position: absolute;
      left: -12px;
    }
  }

  // 引用块 - 现代化设计，紧凑间距
  blockquote {
    margin: 6px 0;
    padding: 6px 10px;
    border-left: 3px solid #0066cc;
    background: linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(0, 102, 204, 0.02) 100%);
    border-radius: 0 4px 4px 0;
    position: relative;
    font-family: var(--font-family-content);
    
    &::before {
      content: '"';
      position: absolute;
      top: -3px;
      left: 8px;
      font-size: 18px;
      color: #0066cc;
      opacity: 0.3;
    }
    
    p {
      margin: 1px 0;
      color: #4a5568;
      font-style: italic;
      line-height: 1.4;
      font-weight: 400;
    }
  }

  // 表格 - 专业级样式，紧凑间距
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 12px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    font-family: var(--font-family-content);
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      text-align: left;
      line-height: 1.3;
      font-weight: 400;
    }
    
    th {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-weight: 600;
      color: #2d3748;
      border-bottom: 2px solid #cbd5e0;
      font-family: var(--font-family-heading);
    }
    
    tbody tr {
      transition: background-color 0.2s ease;
      
      &:nth-child(even) {
        background-color: #f8fafc;
      }
      
      &:hover {
        background-color: #edf2f7;
      }
    }

    td {
      border-bottom: 1px solid #e2e8f0;
    }
  }

  // 分割线 - 现代化样式，紧凑间距
  hr {
    border: none;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
    margin: 8px 0;
    border-radius: 1px;
  }

  // 删除线
  del {
    text-decoration: line-through;
    color: #a0aec0;
    opacity: 0.7;
  }

  // 任务列表 - 现代化复选框
  input[type="checkbox"] {
    margin-right: 4px;
    width: 14px;
    height: 14px;
    accent-color: #0066cc;
    cursor: pointer;
  }

  // 图片 - 现代化样式，紧凑间距
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 4px 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
  
  // 特殊处理：连续元素间距进一步减少
  p + p {
    margin-top: 0px;
  }
  
  // 标题后的内容间距优化
  h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p {
    margin-top: 1px;
  }

  // 列表项内的段落不要额外间距
  li p {
    margin: 0;
    display: inline;
  }

  // 代码块语言标签
  pre[class*="language-"] {
    position: relative;
    
    &::after {
      content: attr(class);
      position: absolute;
      top: 6px;
      right: 8px;
      background: rgba(0, 0, 0, 0.2);
      color: #a0aec0;
      padding: 1px 4px;
      border-radius: 2px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: var(--font-family-ui);
      font-weight: 600;
    }
  }

  // 键盘按键样式
  kbd {
    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    border: 1px solid #cbd5e0;
    border-radius: 3px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    color: #2d3748;
    font-family: var(--font-family-mono);
    font-size: 11px;
    padding: 1px 3px;
    font-weight: 500;
  }

  // 高亮文本
  mark {
    background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
    padding: 0px 2px;
    border-radius: 2px;
  }

  // 数学公式（如果需要支持）
  .math {
    font-family: 'KaTeX_Main', 'Times New Roman', serif;
    font-style: italic;
  }
`;

interface ChatMarkdownProps extends Omit<ReactMarkdownOptions, 'children'> {
  children: string;
}

const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ children, ...props }) => {
  return (
    <ChatMarkdownContainer>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </ChatMarkdownContainer>
  );
};

export default ChatMarkdown;