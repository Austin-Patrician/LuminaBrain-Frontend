import ReactMarkdown from "react-markdown";
import type { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import styled from "styled-components";
import { themeVars } from "@/theme/theme.css";
import "@/utils/highlight";

const StyledModalMarkdown = styled.div`
  display: grid;
  font-size: 14px;
  line-height: 1.6;
  
  h1 {
    font-size: 24px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 16px;
    margin-top: 24px;
    color: ${themeVars.colors.text.primary};
  }
  
  h2 {
    font-size: 20px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 12px;
    margin-top: 20px;
    color: ${themeVars.colors.text.primary};
  }
  
  h3 {
    font-size: 18px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 10px;
    margin-top: 16px;
    color: ${themeVars.colors.text.primary};
  }
  
  h4 {
    font-size: 16px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 8px;
    margin-top: 14px;
    color: ${themeVars.colors.text.primary};
  }
  
  h5 {
    font-size: 15px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 6px;
    margin-top: 12px;
    color: ${themeVars.colors.text.primary};
  }
  
  h6 {
    font-size: 14px;
    line-height: 1.4;
    font-weight: 600;
    margin-bottom: 4px;
    margin-top: 10px;
    color: ${themeVars.colors.text.secondary};
  }
  
  p {
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.6;
    color: ${themeVars.colors.text.primary};
  }
  
  a {
    color: ${themeVars.colors.palette.primary.default};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  
  img {
    border-radius: 4px;
    max-width: 100%;
    height: auto;
  }
  
  br {
    display: grid;
    content: '';
    margin-top: 0.5em;
  }

  // Divider
  hr {
    margin: 16px 0;
    border: 0;
    border-top: 1px solid ${themeVars.colors.common.border};
  }

  // List
  ul,
  ol {
    margin: 0 0 12px 0;
    padding-left: 20px;
    
    li {
      line-height: 1.6;
      margin-bottom: 4px;
      font-size: 14px;
      color: ${themeVars.colors.text.primary};
    }
    
    ul, ol {
      margin-bottom: 0;
      margin-top: 4px;
    }
  }

  // Blockquote
  blockquote {
    line-height: 1.6;
    font-size: 14px;
    margin: 16px 0;
    padding: 12px 16px;
    border-left: 4px solid ${themeVars.colors.palette.primary.default};
    background-color: ${themeVars.colors.background.neutral};
    color: ${themeVars.colors.text.secondary};
    border-radius: 4px;
    
    p {
      margin-bottom: 0;
      font-size: inherit;
    }
  }

  // Code Block
  pre {
    font-size: 13px;
    overflow-x: auto;
    white-space: pre;
    border-radius: 6px;
    margin: 12px 0;
    padding: 12px;
    background-color: ${themeVars.colors.background.neutral};
    
    code {
      font-size: inherit;
      background: none;
      padding: 0;
    }
  }
  
  code {
    font-size: 13px;
    border-radius: 3px;
    padding: 2px 4px;
    background-color: ${themeVars.colors.background.neutral};
    color: ${themeVars.colors.text.primary};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  // Table
  table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid ${themeVars.colors.common.border};
    margin: 12px 0;
    font-size: 13px;
    
    th,
    td {
      padding: 8px 12px;
      border: 1px solid ${themeVars.colors.common.border};
      text-align: left;
    }
    
    th {
      background-color: ${themeVars.colors.background.neutral};
      font-weight: 600;
    }
    
    tbody tr:nth-of-type(odd) {
      background-color: ${themeVars.colors.background.neutral};
    }
  }

  // Checkbox
  input[type='checkbox'] {
    margin-right: 8px;
    position: relative;
    cursor: pointer;
  }
  
  // Strong and emphasis
  strong {
    font-weight: 600;
    color: ${themeVars.colors.text.primary};
  }
  
  em {
    font-style: italic;
    color: ${themeVars.colors.text.secondary};
  }
`;

type Props = ReactMarkdownOptions;

export default function ModalMarkdown({ children, ...props }: Props) {
  return (
    <StyledModalMarkdown>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </StyledModalMarkdown>
  );
}
