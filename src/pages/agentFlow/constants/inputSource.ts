/**
 * 输入源配置常量
 * 统一管理工作流节点的输入源选项
 */

// 输入源类型枚举
export const INPUT_SOURCE = {
  USER_INPUT: '1',        // 用户输入
  PREVIOUS_RESULT: '2',   // 上一步结果
  CONTEXT_DATA: '3'       // 上下文数据
} as const;

// 输入源类型定义
export type InputSourceType = typeof INPUT_SOURCE[keyof typeof INPUT_SOURCE];

// 输入源选项配置（用于UI下拉框）
export const INPUT_SOURCE_OPTIONS = [
  {
    label: '用户输入',
    value: INPUT_SOURCE.USER_INPUT,
    description: '运行时由用户手动输入数据'
  },
  {
    label: '上一步结果',
    value: INPUT_SOURCE.PREVIOUS_RESULT,
    description: '使用前一个节点的执行结果'
  },
  {
    label: '上下文数据',
    value: INPUT_SOURCE.CONTEXT_DATA,
    description: '使用工作流上下文中的数据'
  }
] as const;

// 输入源标签映射
export const INPUT_SOURCE_LABELS: Record<InputSourceType, string> = {
  [INPUT_SOURCE.USER_INPUT]: '用户输入',
  [INPUT_SOURCE.PREVIOUS_RESULT]: '上一步结果',
  [INPUT_SOURCE.CONTEXT_DATA]: '上下文数据'
};

// 输入源描述映射
export const INPUT_SOURCE_DESCRIPTIONS: Record<InputSourceType, string> = {
  [INPUT_SOURCE.USER_INPUT]: '运行时由用户手动输入数据',
  [INPUT_SOURCE.PREVIOUS_RESULT]: '使用前一个节点的执行结果',
  [INPUT_SOURCE.CONTEXT_DATA]: '使用工作流上下文中的数据'
};

// 检查是否为有效的输入源值
export function isValidInputSource(value: any): value is InputSourceType {
  return Object.values(INPUT_SOURCE).includes(value);
}

// 获取输入源标签
export function getInputSourceLabel(value: InputSourceType): string {
  return INPUT_SOURCE_LABELS[value] || '未知';
}

// 获取输入源描述
export function getInputSourceDescription(value: InputSourceType): string {
  return INPUT_SOURCE_DESCRIPTIONS[value] || '';
}

// 判断是否需要用户输入
export function requiresUserInput(inputSource: string | undefined): boolean {
  return inputSource === INPUT_SOURCE.USER_INPUT;
}

// 判断是否使用前一步结果
export function usesPreviousResult(inputSource: string | undefined): boolean {
  return inputSource === INPUT_SOURCE.PREVIOUS_RESULT;
}

// 判断是否使用上下文数据
export function usesContextData(inputSource: string | undefined): boolean {
  return inputSource === INPUT_SOURCE.CONTEXT_DATA;
}

// 默认输入源（用于新创建的节点）
export const DEFAULT_INPUT_SOURCE = INPUT_SOURCE.PREVIOUS_RESULT;

export default {
  INPUT_SOURCE,
  INPUT_SOURCE_OPTIONS,
  INPUT_SOURCE_LABELS,
  INPUT_SOURCE_DESCRIPTIONS,
  isValidInputSource,
  getInputSourceLabel,
  getInputSourceDescription,
  requiresUserInput,
  usesPreviousResult,
  usesContextData,
  DEFAULT_INPUT_SOURCE
};
