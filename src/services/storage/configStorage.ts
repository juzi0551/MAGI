import { UserConfig } from '../../types/config';
import { AIProvider } from '../../types/ai';
import { StorageUtils, StorageResult } from './storageUtils';

/**
 * 配置存储格式
 */
export interface ConfigStorage {
  version: string;
  userConfig: UserConfig;
  audioSettings: {
    enabled: boolean;
    volume: number;
  };
  lastUpdated: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ConfigStorage = {
  version: '1.0.0',
  userConfig: {
    provider: 'openrouter' as AIProvider,
    model: 'anthropic/claude-3.5-sonnet',
    apiKey: '',
    apiBase: undefined
  },
  audioSettings: {
    enabled: true,
    volume: 0.5
  },
  lastUpdated: Date.now()
};

/**
 * 配置存储服务
 */
export class ConfigStorageService {
  private static readonly STORAGE_KEY = 'magi_config';
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * 获取用户配置
   */
  static getConfig(): StorageResult<ConfigStorage> {
    const result = StorageUtils.getItem<ConfigStorage>(this.STORAGE_KEY);
    
    if (!result.success || !result.data) {
      // 返回默认配置
      return { success: true, data: { ...DEFAULT_CONFIG } };
    }

    // 检查版本并进行迁移
    const migratedConfig = this.migrateConfig(result.data);
    return { success: true, data: migratedConfig };
  }

  /**
   * 保存用户配置
   */
  static saveConfig(config: Partial<ConfigStorage>): StorageResult<void> {
    const currentResult = this.getConfig();
    if (!currentResult.success || !currentResult.data) {
      return { success: false, error: '无法获取当前配置' };
    }

    const updatedConfig: ConfigStorage = {
      ...currentResult.data,
      ...config,
      version: this.CURRENT_VERSION,
      lastUpdated: Date.now()
    };

    return StorageUtils.setItem(this.STORAGE_KEY, updatedConfig);
  }

  /**
   * 更新用户配置
   */
  static updateUserConfig(userConfig: Partial<UserConfig>): StorageResult<void> {
    const currentResult = this.getConfig();
    if (!currentResult.success || !currentResult.data) {
      return { success: false, error: '无法获取当前配置' };
    }

    const updatedConfig: ConfigStorage = {
      ...currentResult.data,
      userConfig: {
        ...currentResult.data.userConfig,
        ...userConfig
      },
      lastUpdated: Date.now()
    };

    return StorageUtils.setItem(this.STORAGE_KEY, updatedConfig);
  }

  /**
   * 更新音频设置
   */
  static updateAudioSettings(audioSettings: Partial<ConfigStorage['audioSettings']>): StorageResult<void> {
    const currentResult = this.getConfig();
    if (!currentResult.success || !currentResult.data) {
      return { success: false, error: '无法获取当前配置' };
    }

    const updatedConfig: ConfigStorage = {
      ...currentResult.data,
      audioSettings: {
        ...currentResult.data.audioSettings,
        ...audioSettings
      },
      lastUpdated: Date.now()
    };

    return StorageUtils.setItem(this.STORAGE_KEY, updatedConfig);
  }

  /**
   * 清除配置
   */
  static clearConfig(): StorageResult<void> {
    return StorageUtils.removeItem(this.STORAGE_KEY);
  }

  /**
   * 检查配置是否完整
   */
  static isConfigValid(config?: ConfigStorage): boolean {
    if (!config) return false;
    
    const { userConfig } = config;
    return !!(
      userConfig &&
      userConfig.provider &&
      userConfig.model &&
      userConfig.apiKey &&
      userConfig.apiKey.trim().length > 0
    );
  }

  /**
   * 获取用户配置（仅用户部分）
   */
  static getUserConfig(): StorageResult<UserConfig> {
    const result = this.getConfig();
    if (!result.success || !result.data) {
      return { success: false, error: '无法获取配置' };
    }

    return { success: true, data: result.data.userConfig };
  }

  /**
   * 获取音频设置
   */
  static getAudioSettings(): StorageResult<ConfigStorage['audioSettings']> {
    const result = this.getConfig();
    if (!result.success || !result.data) {
      return { success: false, error: '无法获取配置' };
    }

    return { success: true, data: result.data.audioSettings };
  }

  /**
   * 配置迁移逻辑
   */
  private static migrateConfig(config: ConfigStorage): ConfigStorage {
    // 如果版本相同，直接返回
    if (config.version === this.CURRENT_VERSION) {
      return config;
    }

    // 这里可以添加版本迁移逻辑
    // 例如：从 0.9.0 迁移到 1.0.0
    const migratedConfig = { ...config };

    // 确保所有必需字段存在
    if (!migratedConfig.audioSettings) {
      migratedConfig.audioSettings = DEFAULT_CONFIG.audioSettings;
    }

    if (!migratedConfig.userConfig) {
      migratedConfig.userConfig = DEFAULT_CONFIG.userConfig;
    }

    // 更新版本号
    migratedConfig.version = this.CURRENT_VERSION;
    migratedConfig.lastUpdated = Date.now();

    // 保存迁移后的配置
    StorageUtils.setItem(this.STORAGE_KEY, migratedConfig);

    return migratedConfig;
  }

  /**
   * 导出配置（用于备份）
   */
  static exportConfig(): StorageResult<string> {
    const result = this.getConfig();
    if (!result.success || !result.data) {
      return { success: false, error: '无法获取配置' };
    }

    try {
      const exportData = JSON.stringify(result.data, null, 2);
      return { success: true, data: exportData };
    } catch (error) {
      return { 
        success: false, 
        error: `导出配置失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  /**
   * 导入配置（用于恢复）
   */
  static importConfig(configData: string): StorageResult<void> {
    try {
      const parsedConfig = JSON.parse(configData) as ConfigStorage;
      
      // 验证配置格式
      if (!parsedConfig.userConfig || !parsedConfig.audioSettings) {
        return { success: false, error: '配置格式无效' };
      }

      // 迁移配置并保存
      const migratedConfig = this.migrateConfig(parsedConfig);
      return StorageUtils.setItem(this.STORAGE_KEY, migratedConfig);
    } catch (error) {
      return { 
        success: false, 
        error: `导入配置失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }
}