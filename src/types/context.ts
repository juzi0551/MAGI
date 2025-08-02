/**
 * React Context接口定义
 */

import { 
  SystemStatus, 
  QuestionType, 
  WiseManAnswer, 
  FinalStatus, 
  AIProvider,
  AppError 
} from './ai';
import { HistoryRecord } from './history';
import { AudioSettings, UserConfig, PersonalitySettings } from './config';

// MAGI系统上下文类型
export interface MagiContextType {
  // 核心状态
  question: string;
  questionType: QuestionType | null;
  systemStatus: SystemStatus;
  wiseManAnswers: WiseManAnswer[];
  finalStatus: FinalStatus | null;
  refreshTrigger: number;
  
  // 处理状态
  isProcessing: boolean;
  processingStartTime: number | null;
  processingQuestion: string | null; // 新增：正在处理的原始问题
  error: AppError | null;
  
  // 操作方法
  setQuestion: (question: string) => void;
  processQuestion: () => Promise<void>;
  resetSystem: () => void;
  clearError: () => void;
  
  // 内部方法（通常不直接暴露给组件）
  updateSystemStatus: (status: SystemStatus) => void;
  updateWiseManAnswer: (answer: WiseManAnswer) => void;
  calculateFinalStatus: () => void;
}

// 配置上下文类型
export interface ConfigContextType {
  // 用户配置状态
  provider: AIProvider;
  model: string;
  apiKey: string;
  apiBase?: string;
  
  // 音频设置状态
  audioSettings: AudioSettings;
  
  // 自定义设置状态
  customBackground?: string;
  
  // 人格配置状态
  personalities?: PersonalitySettings;
  
  // 兼容性：保留旧字段
  customPrompts?: {
    melchior?: string;
    balthasar?: string;
    casper?: string;
  };
  
  // 配置状态
  isConfigValid: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 操作方法
  updateConfig: (config: Partial<UserConfig>) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  clearConfig: () => void;
  validateConfig: () => boolean;
  
  // 配置管理
  exportConfig: () => string;
  importConfig: (data: string) => boolean;
  resetToDefaults: () => void;
}

// 历史记录上下文类型
export interface HistoryContextType {
  // 状态
  records: HistoryRecord[];
  selectedRecord: HistoryRecord | null;
  isLoading: boolean;
  error: string | null;
  
  // 统计信息
  totalRecords: number;
  totalProcessingTime: number;
  
  // 操作方法
  addRecord: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  selectRecord: (record: HistoryRecord | null) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
  
  // 数据管理
  exportHistory: () => string;
  importHistory: (data: string) => boolean;
  
  // 查询方法
  searchRecords: (query: string) => HistoryRecord[];
  getRecordsByDateRange: (start: Date, end: Date) => HistoryRecord[];
  getRecordsByStatus: (status: FinalStatus) => HistoryRecord[];
}

// 音频上下文类型
export interface AudioContextType {
  // 状态
  isEnabled: boolean;
  volume: number;
  isSupported: boolean;
  isInitialized: boolean;
  
  // 操作方法
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  playDecisionSound: (status: FinalStatus) => void;
  playInteractionSound: () => void;
  
  // 音频管理
  initialize: () => Promise<boolean>;
  cleanup: () => void;
}

// 通知上下文类型
export interface NotificationContextType {
  // 状态
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    timestamp: number;
  }>;
  
  // 操作方法
  addNotification: (notification: {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
  }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// 主题上下文类型
export interface ThemeContextType {
  // 状态
  theme: 'dark' | 'light';
  
  // 操作方法
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

// 国际化上下文类型
export interface I18nContextType {
  // 状态
  locale: string;
  messages: Record<string, string>;
  
  // 操作方法
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  
  // 支持的语言
  supportedLocales: Array<{
    code: string;
    name: string;
    nativeName: string;
  }>;
}

// 应用上下文类型（组合所有上下文）
export interface AppContextType {
  magi: MagiContextType;
  config: ConfigContextType;
  history: HistoryContextType;
  audio: AudioContextType;
  notification: NotificationContextType;
  theme: ThemeContextType;
  i18n: I18nContextType;
}

// Context Provider Props
export interface ContextProviderProps {
  children: React.ReactNode;
}

// Context Hook返回类型
export type UseContextHook<T> = () => T;

// Context状态更新Action类型
export type ContextAction<T = any> = {
  type: string;
  payload?: T;
};

// Context Reducer类型
export type ContextReducer<S, A> = (state: S, action: A) => S;