import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { HistoryContextType, ContextProviderProps } from '../types/context';
import { HistoryRecord } from '../types/history';
import { HistoryStorageService } from '../services/storage/historyStorage';

/**
 * 历史记录状态类型
 */
interface HistoryState {
  records: HistoryRecord[];
  selectedRecord: HistoryRecord | null;
  isLoading: boolean;
  error: string | null;
  totalRecords: number;
  totalProcessingTime: number;
}

/**
 * 历史记录Action类型
 */
type HistoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RECORDS'; payload: HistoryRecord[] }
  | { type: 'ADD_RECORD'; payload: HistoryRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'CLEAR_RECORDS' }
  | { type: 'SELECT_RECORD'; payload: HistoryRecord | null }
  | { type: 'UPDATE_STATISTICS'; payload: { totalRecords: number; totalProcessingTime: number } };

/**
 * 历史记录Reducer
 */
const historyReducer = (state: HistoryState, action: HistoryAction): HistoryState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_RECORDS':
      return { 
        ...state, 
        records: action.payload, 
        isLoading: false, 
        error: null 
      };
    
    case 'ADD_RECORD':
      return { 
        ...state, 
        records: [action.payload, ...state.records], 
        error: null 
      };
    
    case 'DELETE_RECORD':
      return { 
        ...state, 
        records: state.records.filter(r => r.id !== action.payload),
        selectedRecord: state.selectedRecord?.id === action.payload ? null : state.selectedRecord,
        error: null 
      };
    
    case 'CLEAR_RECORDS':
      return { 
        ...state, 
        records: [], 
        selectedRecord: null, 
        error: null 
      };
    
    case 'SELECT_RECORD':
      return { ...state, selectedRecord: action.payload };
    
    case 'UPDATE_STATISTICS':
      return { 
        ...state, 
        totalRecords: action.payload.totalRecords,
        totalProcessingTime: action.payload.totalProcessingTime 
      };
    
    default:
      return state;
  }
};

/**
 * 初始状态
 */
const initialState: HistoryState = {
  records: [],
  selectedRecord: null,
  isLoading: true,
  error: null,
  totalRecords: 0,
  totalProcessingTime: 0,
};

/**
 * 历史记录Context
 */
const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

/**
 * 历史记录Provider组件
 */
export function HistoryProvider({ children }: ContextProviderProps) {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  /**
   * 错误处理
   */
  const handleError = useCallback((error: string) => {
    console.error('历史记录错误:', error);
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  /**
   * 加载历史记录
   */
  const loadRecords = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const result = HistoryStorageService.getRecords();
      if (result.success && result.data) {
        dispatch({ type: 'SET_RECORDS', payload: result.data });
        
        // 更新统计信息
        const statsResult = HistoryStorageService.getStatistics();
        if (statsResult.success && statsResult.data) {
          dispatch({ 
            type: 'UPDATE_STATISTICS', 
            payload: {
              totalRecords: statsResult.data.totalRecords,
              totalProcessingTime: statsResult.data.averageResponseTime * statsResult.data.totalRecords
            }
          });
        }
      } else {
        handleError(result.error || '加载历史记录失败');
      }
    } catch (error) {
      handleError(`加载历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [handleError]);

  /**
   * 初始化时加载历史记录
   */
  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  /**
   * 添加历史记录
   */
  const addRecord = useCallback((record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    try {
      const newRecord: HistoryRecord = {
        ...record,
        id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const result = HistoryStorageService.addRecord(newRecord);
      
      if (result.success) {
        dispatch({ type: 'ADD_RECORD', payload: newRecord });
        
        // 更新统计信息
        dispatch({ 
          type: 'UPDATE_STATISTICS', 
          payload: {
            totalRecords: state.totalRecords + 1,
            totalProcessingTime: state.totalProcessingTime + (record.duration || 0)
          }
        });
      } else {
        handleError(result.error || '添加历史记录失败');
      }
    } catch (error) {
      handleError(`添加历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [state.totalRecords, state.totalProcessingTime, handleError]);

  /**
   * 选择记录
   */
  const selectRecord = useCallback((record: HistoryRecord | null) => {
    dispatch({ type: 'SELECT_RECORD', payload: record });
  }, []);

  /**
   * 删除记录
   */
  const deleteRecord = useCallback((id: string) => {
    try {
      const result = HistoryStorageService.deleteRecord(id);
      if (result.success) {
        dispatch({ type: 'DELETE_RECORD', payload: id });
      } else {
        handleError(result.error || '删除历史记录失败');
      }
    } catch (error) {
      handleError(`删除历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [handleError]);

  /**
   * 清空历史记录
   */
  const clearHistory = useCallback(() => {
    try {
      const result = HistoryStorageService.clearHistory();
      if (result.success) {
        dispatch({ type: 'CLEAR_RECORDS' });
        dispatch({ 
          type: 'UPDATE_STATISTICS', 
          payload: { totalRecords: 0, totalProcessingTime: 0 }
        });
      } else {
        handleError(result.error || '清空历史记录失败');
      }
    } catch (error) {
      handleError(`清空历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [handleError]);

  /**
   * 导出历史记录
   */
  const exportHistory = useCallback((): string => {
    try {
      const result = HistoryStorageService.exportHistory();
      if (result.success && result.data) {
        return result.data;
      } else {
        handleError(result.error || '导出历史记录失败');
        return '';
      }
    } catch (error) {
      handleError(`导出历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
      return '';
    }
  }, [handleError]);

  /**
   * 导入历史记录
   */
  const importHistory = useCallback((data: string): boolean => {
    try {
      const result = HistoryStorageService.importHistory(data, false);
      if (result.success) {
        // 重新加载历史记录
        loadRecords();
        return true;
      } else {
        handleError(result.error || '导入历史记录失败');
        return false;
      }
    } catch (error) {
      handleError(`导入历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
      return false;
    }
  }, [loadRecords, handleError]);

  /**
   * 搜索记录
   */
  const searchRecords = useCallback((query: string): HistoryRecord[] => {
    if (!query.trim()) {
      return state.records;
    }

    try {
      const result = HistoryStorageService.searchRecords(query);
      if (result.success && result.data) {
        return result.data;
      } else {
        handleError(result.error || '搜索历史记录失败');
        return [];
      }
    } catch (error) {
      handleError(`搜索历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
      return [];
    }
  }, [state.records, handleError]);

  /**
   * 按日期范围获取记录
   */
  const getRecordsByDateRange = useCallback((start: Date, end: Date): HistoryRecord[] => {
    try {
      const result = HistoryStorageService.getRecordsByDateRange(start.getTime(), end.getTime());
      if (result.success && result.data) {
        return result.data;
      } else {
        handleError(result.error || '按日期获取历史记录失败');
        return [];
      }
    } catch (error) {
      handleError(`按日期获取历史记录异常: ${error instanceof Error ? error.message : '未知错误'}`);
      return [];
    }
  }, [handleError]);

  /**
   * 按状态获取记录
   */
  const getRecordsByStatus = useCallback((status: string): HistoryRecord[] => {
    return state.records.filter(record => record.finalStatus === status);
  }, [state.records]);

  /**
   * Context值
   */
  const contextValue: HistoryContextType = {
    // 状态
    records: state.records,
    selectedRecord: state.selectedRecord,
    isLoading: state.isLoading,
    error: state.error,
    totalRecords: state.totalRecords,
    totalProcessingTime: state.totalProcessingTime,
    
    // 操作方法
    addRecord,
    selectRecord,
    deleteRecord,
    clearHistory,
    
    // 数据管理
    exportHistory,
    importHistory,
    
    // 查询方法
    searchRecords,
    getRecordsByDateRange,
    getRecordsByStatus: getRecordsByStatus as any, // 类型兼容
  };

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
}

/**
 * 使用历史记录Context的Hook
 */
export function useHistory(): HistoryContextType {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}