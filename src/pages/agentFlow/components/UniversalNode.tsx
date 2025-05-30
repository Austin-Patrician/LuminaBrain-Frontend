import React from 'react';
import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { CloseCircleFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { getNodeConfig, HANDLE_STYLES, generateHandleId } from '../config/nodeConfig';
import * as Icons from '@ant-design/icons';

// 图标映射函数
const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? React.createElement(IconComponent) : React.createElement(Icons.SettingOutlined);
};

// 节点数据类型定义
interface NodeData {
  label?: string;
  description?: string;
  model?: string;
  nodeType?: string;
  [key: string]: any;
}

// 节点包装器组件 - 带删除功能
const NodeWrapper = ({
  children,
  id,
  isStart = false,
  isEnd = false
}: {
  children: React.ReactNode;
  id: string;
  isStart?: boolean;
  isEnd?: boolean;
}) => {
  const { setNodes, setEdges } = useReactFlow();

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();

    // 删除节点和相关连线
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) =>
      edges.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  return (
    <div className="relative group">
      {!isStart && !isEnd && (
        <Tooltip title="删除节点">
          <div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                       flex items-center justify-center text-xs cursor-pointer opacity-0 
                       group-hover:opacity-100 transition-opacity duration-200 z-20
                       hover:bg-red-600 shadow-lg"
            onClick={handleDelete}
          >
            <CloseCircleFilled className="text-xs" />
          </div>
        </Tooltip>
      )}
      {children}
    </div>
  );
};

// 通用节点组件
interface UniversalNodeProps extends NodeProps {
  nodeType?: string;
}

const UniversalNode: React.FC<UniversalNodeProps> = ({
  id,
  data,
  selected,
  nodeType
}) => {
  const nodeData = data as NodeData;
  const config = getNodeConfig(nodeType || nodeData?.nodeType || 'basicNode');
  const isStart = config.type === 'startNode';
  const isEnd = config.type === 'endNode' || config.type === 'responseNode';

  return (
    <NodeWrapper id={id} isStart={isStart} isEnd={isEnd}>
      <div
        className={`
          relative px-4 py-3 shadow-lg rounded-lg border-2 transition-all duration-200
          ${config.bgColor} ${config.borderColor}
          ${selected ? 'ring-4 ring-blue-200 ring-opacity-50' : ''}
          hover:shadow-xl transform hover:scale-105
          min-w-[160px] max-w-[280px]
        `}
      >
        {/* 目标连接点 - 顶部，蓝色 */}
        {config.hasTarget && (
          <Handle
            type="target"
            position={Position.Top}
            id={generateHandleId(id, 'target')}
            style={HANDLE_STYLES.TARGET}
            className="!w-5 !h-5"
          />
        )}

        {/* 节点内容 */}
        <div className="flex items-center gap-3">
          {/* 节点图标 */}
          <div
            className={`
              rounded-full w-10 h-10 flex items-center justify-center 
              ${config.iconBgColor} transition-colors duration-200
              border-2 border-white shadow-sm
            `}
            style={{ color: config.color }}
          >
            {getIconComponent(config.iconName)}
          </div>

          {/* 节点信息 */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-800 text-sm truncate">
              {nodeData?.label || config.label}
            </div>
            {nodeData?.description && (
              <div className="text-xs text-gray-500 truncate mt-1">
                {String(nodeData.description)}
              </div>
            )}
            {/* 显示一些关键配置信息 */}
            {nodeData?.model && (
              <div className="text-xs text-blue-600 truncate mt-1">
                {String(nodeData.model)}
              </div>
            )}
          </div>
        </div>

        {/* 源连接点处理 */}
        {config.hasSource && !config.hasMultipleOutputs && (
          <Handle
            type="source"
            position={Position.Bottom}
            id={generateHandleId(id, 'source')}
            style={HANDLE_STYLES.SOURCE}
            className="!w-5 !h-5"
          />
        )}

        {/* 多输出连接点（条件节点） */}
        {config.hasMultipleOutputs && (
          <>
            <Handle
              type="source"
              position={Position.Left}
              id={generateHandleId(id, 'source', 'true')}
              style={HANDLE_STYLES.CONDITION_TRUE}
              className="!w-5 !h-5"
            />
            <Handle
              type="source"
              position={Position.Right}
              id={generateHandleId(id, 'source', 'false')}
              style={HANDLE_STYLES.CONDITION_FALSE}
              className="!w-5 !h-5"
            />
            {/* 添加文字标签 */}
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-xs text-green-600 font-medium">
              是
            </div>
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs text-red-600 font-medium">
              否
            </div>
          </>
        )}
      </div>
    </NodeWrapper>
  );
};

export default UniversalNode;