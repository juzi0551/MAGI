/**
 * AI服务相关的类型定义
 */

// AI服务提供商类型
export type AIProvider = 
  | 'openrouter'
  | 'openai' 
  | 'anthropic'
  | 'google'
  | 'cohere'
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

// 贤者类型
export type WiseManType = 'scientist' | 'mother' | 'woman';

// MAGI问题接口
export interface MagiQuestion {
  id: string;
  query: string;
  timestamp: Date;
}

// 贤者回答接口（扩展版）
export interface WiseManAnswer {
  id: string;
  name: string; // 'Melchior-1', 'Balthasar-2', 'Casper-3'
  type: WiseManType;
  response: string;
  status: 'yes' | 'no' | 'conditional' | 'info' | 'error';
  conditions?: string[];
  error?: string | null;
  timestamp: number; // 修复：使用number而不是Date，确保localStorage序列化兼容
}

// AI服务响应接口
export interface AIResponse {
  id: string;
  response: string;
  status: string;
  conditions?: string[];
  error?: string | null;
}

// MAGI决策结果接口
export interface MagiDecision {
  id: string;
  question: string;
  questionType: 'yes-no' | 'open';
  wiseManAnswers: WiseManAnswer[];
  finalDecision: {
    result: 'yes' | 'no' | 'conditional' | 'info' | 'error';
    confidence: number; // 0-1
    reasoning: string;
    consensusLevel: 'unanimous' | 'majority' | 'split' | 'none' | 'informational';
  };
  timestamp: Date;
  processingTime: number; // 毫秒
}

// 问题分析结果接口（保持向后兼容）
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