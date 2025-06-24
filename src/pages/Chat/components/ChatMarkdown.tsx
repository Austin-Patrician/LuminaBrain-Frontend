import React from 'react';
import ReactMarkdown from "react-markdown";
import type { ReactMarkdownOptions } from "react-markdown/lib/react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "@/utils/highlight";
import "./ChatMarkdown.css";

interface ChatMarkdownProps extends Omit<ReactMarkdownOptions, 'children'> {
  children: string;
}

const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ children, ...props }) => {
  return (
    <div className="chat-markdown">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default ChatMarkdown;