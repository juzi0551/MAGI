import { HistoryRecord } from '../../types/history';
import { StorageUtils, StorageResult } from './storageUtils';

/**
 * 历史记录存储格式
 */
export interface HistoryStorage {
  version: string;
  records: HistoryRecord[];
  lastUpdated: number;
}

/**
 * 历史记录存储服务
 */
export class HistoryStorageService {
  private static readonly STORAGE_KEY = 'magi_history';
  private static readonly CURRENT_VERSION = '1.0.0';
  private static readonly MAX_RECORDS = 1000; // 最大存储记录数

  /**
   * 获取历史记录
   */
  static getHistory(): StorageResult<HistoryStorage> {
    const result = StorageUtils.getItem<HistoryStorage>(this.STORAGE_KEY);
    
    if (!result.success || !result.data) {
      // 返回空的历史记录
      const emptyHistory: HistoryStorage = {
        version: this.CURRENT_VERSION,
        records: [],
        lastUpdated: Date.now()
      };
      return { success: true, data: emptyHistory };
    }

    // 检查版本并进行迁移
    const migratedHistory = this.migrateHistory(result.data);
    return { success: true, data: migratedHistory };
  }

  /**
   * 添加历史记录
   */
  static addRecord(record: HistoryRecord): StorageResult<void> {
    const historyResult = this.getHistory();
    if (!historyResult.success || !historyResult.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    const history = historyResult.data;
    
    // 添加新记录到开头
    history.records.unshift(record);
    
    // 限制记录数量
    if (history.records.length > this.MAX_RECORDS) {
      history.records = history.records.slice(0, this.MAX_RECORDS);
    }
    
    history.lastUpdated = Date.now();
    
    return StorageUtils.setItem(this.STORAGE_KEY, history);
  }

  /**
   * 删除单个历史记录
   */
  static deleteRecord(recordId: string): StorageResult<void> {
    const historyResult = this.getHistory();
    if (!historyResult.success || !historyResult.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    const history = historyResult.data;
    history.records = history.records.filter(record => record.id !== recordId);
    history.lastUpdated = Date.now();
    
    return StorageUtils.setItem(this.STORAGE_KEY, history);
  }

  /**
   * 清空所有历史记录
   */
  static clearHistory(): StorageResult<void> {
    const emptyHistory: HistoryStorage = {
      version: this.CURRENT_VERSION,
      records: [],
      lastUpdated: Date.now()
    };
    
    return StorageUtils.setItem(this.STORAGE_KEY, emptyHistory);
  }

  /**
   * 获取历史记录列表（仅记录部分）
   */
  static getRecords(): StorageResult<HistoryRecord[]> {
    const result = this.getHistory();
    if (!result.success || !result.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    return { success: true, data: result.data.records };
  }

  /**
   * 根据ID获取单个记录
   */
  static getRecordById(recordId: string): StorageResult<HistoryRecord | null> {
    const recordsResult = this.getRecords();
    if (!recordsResult.success || !recordsResult.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    const record = recordsResult.data.find(r => r.id === recordId) || null;
    return { success: true, data: record };
  }

  /**
   * 搜索历史记录
   */
  static searchRecords(query: string): StorageResult<HistoryRecord[]> {
    const recordsResult = this.getRecords();
    if (!recordsResult.success || !recordsResult.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    const lowerQuery = query.toLowerCase();
    const filteredRecords = recordsResult.data.filter(record => 
      record.question.toLowerCase().includes(lowerQuery) ||
      record.answers.some(answer => 
        answer.response.toLowerCase().includes(lowerQuery)
      )
    );

    return { success: true, data: filteredRecords };
  }

  /**
   * 按日期范围获取记录
   */
  static getRecordsByDateRange(startDate: number, endDate: number): StorageResult<HistoryRecord[]> {
    const recordsResult = this.getRecords();
    if (!recordsResult.success || !recordsResult.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    const filteredRecords = recordsResult.data.filter(record => 
      record.timestamp >= startDate && record.timestamp <= endDate
    );

    return { success: true, data: filteredRecords };
  }

  /**
   * 获取统计信息
   */
  static getStatistics(): StorageResult<{
    totalRecords: number;
    totalQuestions: number;
    averageResponseTime: number;
    decisionDistribution: Record<string, number>;
  }> {
    const recordsResult = this.getRecords();
    if (!recordsResult.success || !recordsResult.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    const records = recordsResult.data;
    const totalRecords = records.length;
    const totalQuestions = records.length;
    
    // 计算平均响应时间
    const responseTimes = records
      .filter(record => record.duration)
      .map(record => record.duration!);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // 决策分布统计
    const decisionDistribution = records.reduce((dist, record) => {
      dist[record.finalStatus] = (dist[record.finalStatus] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    return {
      success: true,
      data: {
        totalRecords,
        totalQuestions,
        averageResponseTime,
        decisionDistribution
      }
    };
  }

  /**
   * 历史记录迁移逻辑
   */
  private static migrateHistory(history: HistoryStorage): HistoryStorage {
    // 如果版本相同，直接返回
    if (history.version === this.CURRENT_VERSION) {
      return history;
    }

    // 这里可以添加版本迁移逻辑
    const migratedHistory = { ...history };

    // 确保所有必需字段存在
    if (!migratedHistory.records) {
      migratedHistory.records = [];
    }

    // 验证和修复记录格式
    migratedHistory.records = migratedHistory.records.filter(record => {
      // 基础字段验证
      if (!record || 
          !record.id || 
          !record.timestamp || 
          !record.question || 
          !Array.isArray(record.answers)) {
        return false;
      }

      // 验证answers数组内部结构
      const validAnswers = record.answers.every(answer => 
        answer &&
        typeof answer.id === 'string' &&
        typeof answer.name === 'string' &&
        typeof answer.response === 'string' &&
        typeof answer.status === 'string' &&
        (typeof answer.timestamp === 'number' || typeof answer.timestamp === 'string') // 兼容旧格式
      );

      if (!validAnswers) {
        return false;
      }

      // 修复答案中的timestamp格式（如果是Date字符串，转换为number）
      record.answers = record.answers.map(answer => ({
        ...answer,
        timestamp: typeof answer.timestamp === 'string' 
          ? new Date(answer.timestamp).getTime() 
          : answer.timestamp
      }));

      return true;
    });

    // 更新版本号
    migratedHistory.version = this.CURRENT_VERSION;
    migratedHistory.lastUpdated = Date.now();

    // 保存迁移后的历史记录
    StorageUtils.setItem(this.STORAGE_KEY, migratedHistory);

    return migratedHistory;
  }

  /**
   * 导出历史记录（用于备份）
   */
  static exportHistory(): StorageResult<string> {
    const result = this.getHistory();
    if (!result.success || !result.data) {
      return { success: false, error: '无法获取历史记录' };
    }

    try {
      const exportData = JSON.stringify(result.data, null, 2);
      return { success: true, data: exportData };
    } catch (error) {
      return { 
        success: false, 
        error: `导出历史记录失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  /**
   * 导入历史记录（用于恢复）
   */
  static importHistory(historyData: string, replace: boolean = false): StorageResult<void> {
    try {
      const parsedHistory = JSON.parse(historyData) as HistoryStorage;
      
      // 验证历史记录格式
      if (!Array.isArray(parsedHistory.records)) {
        return { success: false, error: '历史记录格式无效' };
      }

      if (replace) {
        // 替换现有历史记录
        const migratedHistory = this.migrateHistory(parsedHistory);
        return StorageUtils.setItem(this.STORAGE_KEY, migratedHistory);
      } else {
        // 合并到现有历史记录
        const currentResult = this.getHistory();
        if (!currentResult.success || !currentResult.data) {
          return { success: false, error: '无法获取当前历史记录' };
        }

        const mergedHistory: HistoryStorage = {
          version: this.CURRENT_VERSION,
          records: [...parsedHistory.records, ...currentResult.data.records],
          lastUpdated: Date.now()
        };

        // 去重（基于ID）
        const uniqueRecords = mergedHistory.records.filter((record, index, arr) => 
          arr.findIndex(r => r.id === record.id) === index
        );

        // 按时间戳排序（最新的在前）
        uniqueRecords.sort((a, b) => b.timestamp - a.timestamp);

        // 限制记录数量
        if (uniqueRecords.length > this.MAX_RECORDS) {
          uniqueRecords.splice(this.MAX_RECORDS);
        }

        mergedHistory.records = uniqueRecords;
        
        return StorageUtils.setItem(this.STORAGE_KEY, mergedHistory);
      }
    } catch (error) {
      return { 
        success: false, 
        error: `导入历史记录失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }
}