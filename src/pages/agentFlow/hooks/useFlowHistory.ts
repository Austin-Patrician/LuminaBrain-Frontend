import { useCallback, useState, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';
import { message } from 'antd';

interface FlowHistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface UseFlowHistoryReturn {
  history: FlowHistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (state: FlowHistoryState) => void;
  undo: () => FlowHistoryState | null;
  redo: () => FlowHistoryState | null;
  resetHistory: (initialState: FlowHistoryState) => void;
  ignoreNextChange: () => void;
}

interface UseFlowHistoryProps {
  maxHistorySize?: number;
  initialState: FlowHistoryState;
}

export const useFlowHistory = ({
  maxHistorySize = 50,
  initialState,
}: UseFlowHistoryProps): UseFlowHistoryReturn => {
  const [history, setHistory] = useState<FlowHistoryState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const ignoreNextChangeRef = useRef(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // 添加到历史记录
  const addToHistory = useCallback(
    (state: FlowHistoryState) => {
      // 如果设置了忽略下一次变更，则跳过
      if (ignoreNextChangeRef.current) {
        ignoreNextChangeRef.current = false;
        return;
      }

      setHistory((prev) => {
        // 移除当前位置之后的所有历史记录
        const newHistory = prev.slice(0, historyIndex + 1);
        
        // 添加新状态
        newHistory.push({
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
        });

        // 限制历史记录大小
        if (newHistory.length > maxHistorySize) {
          return newHistory.slice(-maxHistorySize);
        }

        return newHistory;
      });

      setHistoryIndex((prev) => {
        const newIndex = Math.min(prev + 1, maxHistorySize - 1);
        return newIndex;
      });
    },
    [historyIndex, maxHistorySize]
  );

  // 撤销操作
  const undo = useCallback((): FlowHistoryState | null => {
    if (!canUndo) {
      message.info('没有可撤销的操作');
      return null;
    }

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    ignoreNextChangeRef.current = true;
    return history[newIndex];
  }, [canUndo, historyIndex, history]);

  // 重做操作
  const redo = useCallback((): FlowHistoryState | null => {
    if (!canRedo) {
      message.info('没有可重做的操作');
      return null;
    }

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    ignoreNextChangeRef.current = true;
    return history[newIndex];
  }, [canRedo, historyIndex, history]);

  // 重置历史记录
  const resetHistory = useCallback((newInitialState: FlowHistoryState) => {
    setHistory([{
      nodes: JSON.parse(JSON.stringify(newInitialState.nodes)),
      edges: JSON.parse(JSON.stringify(newInitialState.edges)),
    }]);
    setHistoryIndex(0);
  }, []);

  // 忽略下一次变更
  const ignoreNextChange = useCallback(() => {
    ignoreNextChangeRef.current = true;
  }, []);

  return {
    history,
    historyIndex,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    resetHistory,
    ignoreNextChange,
  };
};
