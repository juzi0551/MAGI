/**
 * 配置相关的类型定义
 */

import { AIProvider } from './ai';

// 用户配置接口
export interface UserConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  apiBase?: string;
  customBackground?: string;
  customPrompts?: {
    melchior?: string;
    balthasar?: string;
    casper?: string;
  };
}

// 音频设置接口
export interface AudioSettings {
  enabled: boolean;
  volume: number; // 0-100
}

// 应用配置接口
export interface AppConfig {
  userConfig: UserConfig;
  audioSettings: AudioSettings;
  theme?: 'dark' | 'light';
  language?: 'zh-CN' | 'en-US' | 'ja-JP';
}

// 配置存储格式接口
export interface ConfigStorage {
  version: string;
  userConfig: UserConfig;
  audioSettings: AudioSettings;
  lastUpdated: number;
}

// 配置上下文类型
export interface ConfigContextType {
  // 状态
  provider: AIProvider;
  model: string;
  apiKey: string;
  apiBase?: string;
  audioSettings: AudioSettings;
  customBackground?: string;
  customPrompts?: {
    melchior?: string;
    balthasar?: string;
    casper?: string;
  };
  
  // 操作方法
  updateConfig: (config: Partial<UserConfig>) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  clearConfig: () => void;
  isConfigValid: () => boolean;
}

// 设置模态框Props接口
export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: UserConfig) => void;
  onClear?: () => void;
}

// AI提供商选项接口
export interface AIProviderOption {
  value: AIProvider;
  label: string;
  models: Record<string, string>;
  defaultModel: string;
  requiresApiKey: boolean;
  apiBaseRequired?: boolean;
  description?: string;
}

// 模型选项接口
export interface ModelOption {
  value: string;
  label: string;
  description?: string;
}

// 配置验证结果接口
export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// 配置迁移接口
export interface ConfigMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (oldConfig: any) => ConfigStorage;
}

// 默认配置常量
export const DEFAULT_CONFIG: AppConfig = {
  userConfig: {
    provider: 'openrouter',
    model: 'google/gemini-2.5-flash',
    apiKey: '',
  },
  audioSettings: {
    enabled: true,
    volume: 30,
  },
  theme: 'dark',
  language: 'zh-CN',
};

// 音频频率映射
export const AUDIO_FREQUENCIES = {
  yes: 2000,
  no: 3400,
  conditional: 2700,
  info: 2200,
  error: 1500,
} as const;

// 支持的AI提供商列表
export const AI_PROVIDERS: AIProviderOption[] = [
  {
    value: 'openrouter',
    label: 'OpenRouter',
    models: {
      'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
      'anthropic/claude-3-haiku': 'Claude 3 Haiku',
      'openai/gpt-4': 'GPT-4',
      'meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
      'google/gemini-pro': 'Gemini Pro',
      'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
    },
    defaultModel: 'google/gemini-2.5-flash',
    requiresApiKey: true,
    description: '聚合多种AI模型的服务平台',
  },
  {
    value: 'openai',
    label: 'OpenAI',
    models: {
      'gpt-4': 'GPT-4',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-4o': 'GPT-4o',
      'gpt-4o-mini': 'GPT-4o Mini',
    },
    defaultModel: 'gpt-4',
    requiresApiKey: true,
    apiBaseRequired: false,
    description: 'OpenAI官方API服务',
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    models: {
      'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
      'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
      'claude-3-haiku-20240307': 'Claude 3 Haiku',
    },
    defaultModel: 'claude-3-5-sonnet-20241022',
    requiresApiKey: true,
    description: 'Anthropic Claude系列模型',
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    models: {
      'deepseek-chat': 'DeepSeek Chat',
      'deepseek-coder': 'DeepSeek Coder',
    },
    defaultModel: 'deepseek-chat',
    requiresApiKey: true,
    description: 'DeepSeek AI模型服务',
  },
];