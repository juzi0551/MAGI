import { useState, useEffect, useCallback } from 'react';
import { HistoryRecord } from '../types/history';
import { HistoryStorageService } from '../services/storage/historyStorage';

/**
 * 历史记录Hook的返回值
 */
export interface UseHistoryReturn {
  // 数据状态
  records: HistoryRecord[];
  selectedRecord: HistoryRecord | null;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  addRecord: (record: HistoryRecord) => Promise<boolean>;
  deleteRecord: (recordId: string) => Promise<boolean>;
  clearHistory: () => Promise<boolean>;
  selectRecord: (record: HistoryRecord | null) => void;
  searchRecords: (query: string) => HistoryRecord[];
  getRecordsByDateRange: (startDate: number, endDate: number) => HistoryRecord[];
  
  // 工具方法
  exportHistory: () => string | null;
  importHistory: (data: string, replace?: boolean) => Promise<boolean>;
  getStatistics: () => ReturnType<typeof HistoryStorageService.getStatistics>['data'] | null;
  refreshHistory: () => Promise<void>;
}

/**
 * 历史记录管理Hook
 * 提供完整的历史记录管理功能
 */
export function useHistory(): UseHistoryReturn {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 错误处理
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('历史记录管理错误:', errorMessage);
  }, []);

  // 加载历史记录
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = HistoryStorageService.getRecords();
      if (result.success && result.data) {
        setRecords(result.data);
      } else {
        handleError(result.error || '加载历史记录失败');
        setRecords([]);
      }
    } catch (err) {
      handleError(`加载历史记录异常: ${err instanceof Error ? err.message : '未知错误'}`);
      setRecords([]);
    }

    setIsLoading(false);
  }, [handleError]);

  // 初始化时加载历史记录
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 添加历史记录
  const addRecord = useCallback(async (record: HistoryRecord): Promise<boolean> => {
    try {
      const result = HistoryStorageService.addRecord(record);
      if (result.success) {
        // 重新加载历史记录
        await loadHistory();
        setError(null);
        return true;
      } else {
        handleError(result.error || '添加历史记录失败');
        return false;
      }
    } catch (err) {
      handleError(`添加历史记录异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadHistory, handleError]);

  // 删除历史记录
  const deleteRecord = useCallback(async (recordId: string): Promise<boolean> => {
    try {
      const result = HistoryStorageService.deleteRecord(recordId);
      if (result.success) {
        // 如果删除的是当前选中的记录，清除选择
        if (selectedRecord && selectedRecord.id === recordId) {
          setSelectedRecord(null);
        }
        
        // 重新加载历史记录
        await loadHistory();
        setError(null);
        return true;
      } else {
        handleError(result.error || '删除历史记录失败');
        return false;
      }
    } catch (err) {
      handleError(`删除历史记录异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [selectedRecord, loadHistory, handleError]);

  // 清空历史记录
  const clearHistory = useCallback(async (): Promise<boolean> => {
    try {
      const result = HistoryStorageService.clearHistory();
      if (result.success) {
        setSelectedRecord(null);
        await loadHistory();
        setError(null);
        return true;
      } else {
        handleError(result.error || '清空历史记录失败');
        return false;
      }
    } catch (err) {
      handleError(`清空历史记录异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadHistory, handleError]);

  // 选择记录
  const selectRecord = useCallback((record: HistoryRecord | null) => {
    setSelectedRecord(record);
  }, []);

  // 搜索记录
  const searchRecords = useCallback((query: string): HistoryRecord[] => {
    if (!query.trim()) {
      return records;
    }

    const result = HistoryStorageService.searchRecords(query);
    if (result.success && result.data) {
      return result.data;
    } else {
      handleError(result.error || '搜索历史记录失败');
      return [];
    }
  }, [records, handleError]);

  // 按日期范围获取记录
  const getRecordsByDateRange = useCallback((startDate: number, endDate: number): HistoryRecord[] => {
    const result = HistoryStorageService.getRecordsByDateRange(startDate, endDate);
    if (result.success && result.data) {
      return result.data;
    } else {
      handleError(result.error || '按日期获取历史记录失败');
      return [];
    }
  }, [handleError]);

  // 导出历史记录
  const exportHistory = useCallback((): string | null => {
    try {
      const result = HistoryStorageService.exportHistory();
      if (result.success && result.data) {
        return result.data;
      } else {
        handleError(result.error || '导出历史记录失败');
        return null;
      }
    } catch (err) {
      handleError(`导出历史记录异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return null;
    }
  }, [handleError]);

  // 导入历史记录
  const importHistory = useCallback(async (data: string, replace: boolean = false): Promise<boolean> => {
    try {
      const result = HistoryStorageService.importHistory(data, replace);
      if (result.success) {
        await loadHistory();
        setError(null);
        return true;
      } else {
        handleError(result.error || '导入历史记录失败');
        return false;
      }
    } catch (err) {
      handleError(`导入历史记录异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadHistory, handleError]);

  // 获取统计信息
  const getStatistics = useCallback(() => {
    const result = HistoryStorageService.getStatistics();
    if (result.success) {
      return result.data;
    } else {
      handleError(result.error || '获取统计信息失败');
      return null;
    }
  }, [handleError]);

  // 刷新历史记录
  const refreshHistory = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  return {
    // 数据状态
    records,
    selectedRecord,
    isLoading,
    error,
    
    // 操作方法
    addRecord,
    deleteRecord,
    clearHistory,
    selectRecord,
    searchRecords,
    getRecordsByDateRange,
    
    // 工具方法
    exportHistory,
    importHistory,
    getStatistics,
    refreshHistory
  };
}

/**
 * 简化版历史记录Hook，仅用于显示
 */
export function useHistoryList() {
  const {
    records,
    isLoading,
    error,
    searchRecords,
    getRecordsByDateRange
  } = useHistory();

  return {
    records,
    isLoading,
    error,
    searchRecords,
    getRecordsByDateRange
  };
}

/**
 * 历史记录详情Hook
 */
export function useHistoryDetail(recordId?: string) {
  const [record, setRecord] = useState<HistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordId) {
      setRecord(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = HistoryStorageService.getRecordById(recordId);
    if (result.success) {
      setRecord(result.data || null);
    } else {
      setError(result.error || '获取历史记录详情失败');
      setRecord(null);
    }

    setIsLoading(false);
  }, [recordId]);

  return {
    record,
    isLoading,
    error
  };
}