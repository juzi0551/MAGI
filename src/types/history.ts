/**
 * 历史记录相关的类型定义
 */

import { QuestionType, WiseManAnswer, FinalStatus } from './ai';

// 历史记录项接口
export interface HistoryRecord {
  id: string;
  timestamp: number;
  question: string;
  questionType: QuestionType;
  finalStatus: FinalStatus;
  answers: WiseManAnswer[];
  duration?: number; // 处理时长（毫秒）
  
  // 新增：保存创建时的人格名称映射（用于历史记录显示）
  personalityNamesSnapshot?: {
    melchior: string;
    balthasar: string;
    casper: string;
  };
}

// 历史记录存储格式接口
export interface HistoryStorage {
  version: string;
  records: HistoryRecord[];
  lastUpdated: number;
  totalQuestions?: number;
  totalProcessingTime?: number;
}

// 历史记录上下文类型
export interface HistoryContextType {
  // 状态
  records: HistoryRecord[];
  selectedRecord: HistoryRecord | null;
  isLoading: boolean;
  
  // 操作方法
  addRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  selectRecord: (record: HistoryRecord | null) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
  
  // 统计方法
  getStatistics: () => HistoryStatistics;
}

// 历史记录统计接口
export interface HistoryStatistics {
  totalQuestions: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  statusDistribution: Record<FinalStatus, number>;
  questionTypeDistribution: Record<QuestionType, number>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
}

// 历史记录面板Props接口
export interface HistoryPanelProps {
  records: HistoryRecord[];
  onRecordDetail: (record: HistoryRecord & { _clickTimestamp?: number }) => void;
  onClearHistory: () => void;
  className?: string;
}

// 历史记录项Props接口
export interface HistoryItemProps {
  record: HistoryRecord;
  isSelected: boolean;
  onClick: (record: HistoryRecord) => void;
  onDelete?: (id: string) => void;
  showDetails?: boolean;
}

// 历史详情模态框Props接口
export interface HistoryDetailModalProps {
  record: HistoryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

// 历史记录过滤器接口
export interface HistoryFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  questionType?: QuestionType;
  finalStatus?: FinalStatus;
  searchText?: string;
}

// 历史记录排序选项
export type HistorySortBy = 'timestamp' | 'question' | 'finalStatus' | 'duration';
export type HistorySortOrder = 'asc' | 'desc';

export interface HistorySort {
  by: HistorySortBy;
  order: HistorySortOrder;
}

// 历史记录导出格式
export interface HistoryExportData {
  exportDate: string;
  version: string;
  records: HistoryRecord[];
  statistics: HistoryStatistics;
}

// 历史记录迁移接口
export interface HistoryMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (oldData: any) => HistoryStorage;
}

// 默认历史记录存储
export const DEFAULT_HISTORY_STORAGE: HistoryStorage = {
  version: '1.0',
  records: [],
  lastUpdated: Date.now(),
  totalQuestions: 0,
  totalProcessingTime: 0,
};

// 历史记录常量
export const HISTORY_CONSTANTS = {
  MAX_RECORDS: 1000, // 最大记录数
  AUTO_CLEANUP_DAYS: 90, // 自动清理天数
  EXPORT_FILENAME_PREFIX: 'magi-history',
  STORAGE_KEY: 'magi-history',
} as const;