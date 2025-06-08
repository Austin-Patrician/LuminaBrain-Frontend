// 流程状态常量定义 - 全局状态字典映射
export interface FlowStatusMap {
  id: string;      // GUID
  name: string;    // 状态名称
  label: string;   // 显示标签
  color: string;   // 颜色标识
  description: string;  // 状态描述
}

// 全局流程状态字典映射
export const FLOW_STATUS_DICTIONARY: Record<string, FlowStatusMap> = {
  draft: {
    id: 'A1B2C3D4-E5F6-7890-1234-56789ABCDEF0',
    name: 'draft',
    label: '草稿',
    color: '#8B949E',
    description: '流程正在编辑中，尚未发布'
  },
  published: {
    id: 'B2C3D4E5-F6G7-8901-2345-6789ABCDEF01',
    name: 'published',
    label: '已发布',
    color: '#00C853',
    description: '流程已发布，可以正常使用'
  },
  archived: {
    id: 'C3D4E5F6-G7H8-9012-3456-789ABCDEF012',
    name: 'archived',
    label: '已归档',
    color: '#FF9800',
    description: '流程已归档，不再使用但保留记录'
  },
  suspended: {
    id: 'D4E5F6G7-H8I9-0123-4567-89ABCDEF0123',
    name: 'suspended',
    label: '已暂停',
    color: '#F44336',
    description: '流程已暂停，暂时不可使用'
  },
  testing: {
    id: 'E5F6G7H8-I9J0-1234-5678-9ABCDEF01234',
    name: 'testing',
    label: '测试中',
    color: '#2196F3',
    description: '流程正在测试阶段'
  }
};

// 状态类型定义
export type FlowStatus = keyof typeof FLOW_STATUS_DICTIONARY;

// 获取状态信息的工具函数
export const getFlowStatusInfo = (status: FlowStatus): FlowStatusMap => {
  return FLOW_STATUS_DICTIONARY[status];
};

// 获取状态GUID
export const getFlowStatusId = (status: FlowStatus): string => {
  return FLOW_STATUS_DICTIONARY[status].id;
};

// 根据GUID获取状态名称
export const getFlowStatusByGuid = (guid: string): FlowStatus | null => {
  const entry = Object.entries(FLOW_STATUS_DICTIONARY).find(
    ([_, statusInfo]) => statusInfo.id === guid
  );
  return entry ? entry[0] as FlowStatus : null;
};

// 获取所有状态选项（用于下拉列表等）
export const getFlowStatusOptions = (): Array<{ value: FlowStatus; label: string; color: string }> => {
  return Object.entries(FLOW_STATUS_DICTIONARY).map(([key, value]) => ({
    value: key as FlowStatus,
    label: value.label,
    color: value.color
  }));
};

// 默认状态
export const DEFAULT_FLOW_STATUS: FlowStatus = 'draft';
