import React from 'react';

interface NodeIconProps {
  type?: string;
}

const NodeIcon: React.FC<NodeIconProps> = ({ type }) => {
  const colors: Record<string, string> = {
    // AI节点
    aiDialogNode: 'bg-blue-500',
    aiSummaryNode: 'bg-cyan-500',
    aiExtractNode: 'bg-purple-500',
    aiJsonNode: 'bg-pink-500',
    // 数据节点
    databaseNode: 'bg-teal-500',
    knowledgeBaseNode: 'bg-lime-500',
    bingNode: 'bg-orange-500',
    // 响应节点
    responseNode: 'bg-green-500',
    // 基础节点
    basicNode: 'bg-blue-500',
    processNode: 'bg-green-500',
    decisionNode: 'bg-yellow-500',
    startNode: 'bg-purple-500',
    endNode: 'bg-red-500',
    conditionNode: 'bg-orange-500',
    customNode: 'bg-indigo-500',
    jsonExtractor: 'bg-pink-500',
  };

  return (
    <div className="w-6 h-6 mr-2 rounded-full border-2 border-gray-400 flex items-center justify-center">
      <div className={`w-4 h-4 rounded-full ${colors[type || ''] || 'bg-gray-300'}`}></div>
    </div>
  );
};

export default NodeIcon;
