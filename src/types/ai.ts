/**
 * AI服务相关的类型定义
 */

// AI服务提供商类型
export type AIProvider = 
  | 'openrouter'
  | 'openai' 
  | 'anthropic'
  | 'google'
  | 'zhipu'
  | 'moonshot'
  | 'alibaba'
  | 'baidu'
  | 'deepseek';

// 问题类型
export type QuestionType = 'yes_no' | 'info';

// 贤者状态类型
export type WiseManStatus = 'standby' | 'processing' | 'yes' | 'no' | 'conditional' | 'info' | 'error';

// 系统状态类型
export type SystemStatus = 'standby' | 'processing' | 'completed';

// 最终决策状态类型
export type FinalStatus = 'yes' | 'no' | 'conditional' | 'info' | 'error';

// 贤者名称类型
export type WiseManName = 'melchior' | 'balthasar' | 'casper';

// 贤者回答接口
export interface WiseManAnswer {
  name: WiseManName;
  status: WiseManStatus;
  response: string;
  conditions?: string[];
  timestamp?: number;
  processingTime?: number; // 处理时长（毫秒）
}

// AI请求参数接口
export interface AIRequestParams {
  question: string;
  personality: string;
  isYesNoQuestion: boolean;
  provider: AIProvider;
  model: string;
  apiKey: string;
  apiBase?: string;
}

// AI响应接口
export interface AIResponse {
  answer: string;
  classification: {
    status: WiseManStatus;
    conditions?: string[];
  };
}

// 问题分析结果接口
export interface QuestionAnalysis {
  id: string;
  question: string;
  questionType: QuestionType;
  timestamp: number;
  answers: WiseManAnswer[];
  finalStatus: FinalStatus;
}

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  STORAGE_UNAVAILABLE = 'STORAGE_UNAVAILABLE',
  AUDIO_UNAVAILABLE = 'AUDIO_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 应用错误接口
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp?: number;
}

// AI服务配置接口
export interface AIServiceConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  apiBase?: string;
  timeout?: number;
  maxRetries?: number;
}

// 人格提示词映射接口
export interface PersonalityPrompts {
  melchior: string;
  balthasar: string;
  casper: string;
}

// 模型配置接口
export interface ModelConfig {
  models: Record<string, string>;
  defaultModel: string;
  apiKeyEnv: string;
  apiBaseEnv: string;
  defaultApiBase: string;
}