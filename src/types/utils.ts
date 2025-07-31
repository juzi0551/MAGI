/**
 * 工具函数和服务相关的类型定义
 */

import { FinalStatus, WiseManStatus, WiseManAnswer } from './ai';

// 格式化工具类型
export interface Formatter {
  formatDate: (date: Date | number, format?: string) => string;
  formatDuration: (milliseconds: number) => string;
  formatFileSize: (bytes: number) => string;
  formatNumber: (num: number, decimals?: number) => string;
  formatPercentage: (value: number, total: number) => string;
}

// 状态工具类型
export interface StatusUtils {
  getStatusColor: (status: WiseManStatus | FinalStatus) => string;
  getStatusIcon: (status: WiseManStatus | FinalStatus) => string;
  getStatusText: (status: WiseManStatus | FinalStatus) => string;
  isErrorStatus: (status: WiseManStatus | FinalStatus) => boolean;
  isSuccessStatus: (status: WiseManStatus | FinalStatus) => boolean;
}

// 决策计算工具类型
export interface DecisionCalculator {
  calculateFinalDecision: (answers: WiseManAnswer[]) => FinalStatus;
  getDecisionWeight: (status: WiseManStatus) => number;
  getDecisionPriority: (status: WiseManStatus) => number;
  analyzeConsensus: (answers: WiseManAnswer[]) => {
    hasConsensus: boolean;
    majorityStatus: WiseManStatus;
    conflictLevel: number;
  };
}

// 验证工具类型
export interface Validator {
  validateApiKey: (apiKey: string, provider: string) => boolean;
  validateUrl: (url: string) => boolean;
  validateEmail: (email: string) => boolean;
  validateQuestion: (question: string) => {
    isValid: boolean;
    errors: string[];
  };
  validateConfig: (config: any) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

// 存储工具类型
export interface StorageUtils {
  isStorageAvailable: (type: 'localStorage' | 'sessionStorage') => boolean;
  getStorageSize: (type: 'localStorage' | 'sessionStorage') => number;
  clearExpiredData: (key: string, maxAge: number) => void;
  compressData: (data: any) => string;
  decompressData: (compressed: string) => any;
}

// 音频工具类型
export interface AudioUtils {
  isAudioSupported: () => boolean;
  createOscillator: (frequency: number, duration: number) => Promise<void>;
  getAudioContext: () => AudioContext | null;
  resumeAudioContext: () => Promise<void>;
  closeAudioContext: () => void;
}

// 网络工具类型
export interface NetworkUtils {
  isOnline: () => boolean;
  checkConnectivity: () => Promise<boolean>;
  retryRequest: <T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delay: number
  ) => Promise<T>;
  withTimeout: <T>(
    promise: Promise<T>,
    timeoutMs: number
  ) => Promise<T>;
}

// 调试工具类型
export interface DebugUtils {
  log: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: Error) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
  group: (label: string) => void;
  groupEnd: () => void;
}

// 性能监控工具类型
export interface PerformanceMonitor {
  startTiming: (name: string) => void;
  endTiming: (name: string) => number;
  measureMemory: () => {
    used: number;
    total: number;
    percentage: number;
  };
  measureRenderTime: (componentName: string) => number;
}

// 缓存工具类型
export interface CacheUtils {
  set: <T>(key: string, value: T, ttl?: number) => void;
  get: <T>(key: string) => T | null;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  clear: () => void;
  size: () => number;
  cleanup: () => void;
}

// 事件工具类型
export interface EventUtils {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ) => (...args: Parameters<T>) => void;
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ) => (...args: Parameters<T>) => void;
  once: <T extends (...args: any[]) => any>(
    func: T
  ) => (...args: Parameters<T>) => ReturnType<T>;
}

// 数据转换工具类型
export interface DataTransformer {
  toCSV: (data: any[]) => string;
  toJSON: (data: any) => string;
  fromJSON: <T>(json: string) => T | null;
  sanitizeHtml: (html: string) => string;
  escapeRegex: (string: string) => string;
  deepClone: <T>(obj: T) => T;
  deepMerge: <T>(target: T, ...sources: Partial<T>[]) => T;
}

// 常量定义
export const CONSTANTS = {
  // 时间常量
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  
  // 存储常量
  STORAGE_KEYS: {
    CONFIG: 'magi-config',
    HISTORY: 'magi-history',
    AUDIO: 'magi-audio',
    THEME: 'magi-theme',
    LANGUAGE: 'magi-language',
  },
  
  // API常量
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // UI常量
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  THROTTLE_LIMIT: 100,
  
  // 音频常量
  AUDIO_DURATION: 1000,
  DEFAULT_VOLUME: 0.3,
  
  // 验证常量
  MIN_QUESTION_LENGTH: 1,
  MAX_QUESTION_LENGTH: 1000,
  MIN_API_KEY_LENGTH: 10,
} as const;

// 工具函数类型
export type UtilFunction<T extends any[], R> = (...args: T) => R;
export type AsyncUtilFunction<T extends any[], R> = (...args: T) => Promise<R>;

// 错误处理工具类型
export interface ErrorHandler {
  handleError: (error: Error, context?: string) => void;
  createError: (message: string, type?: string, details?: any) => Error;
  isNetworkError: (error: Error) => boolean;
  isTimeoutError: (error: Error) => boolean;
  getErrorMessage: (error: unknown) => string;
}