// 导出所有调试面板组件
export { default as EnhancedDebugPanel } from './EnhancedDebugPanel';
export { default as DebugOverview } from './DebugOverview';
export { default as DebugExecutionLogs } from './DebugExecutionLogs';
export { default as DebugResults } from './DebugResults';
export { default as DebugStatistics } from './DebugStatistics';

// 重新导出原有的调试面板以保持向后兼容
export { default as DebugPanel } from '../DebugPanel';
