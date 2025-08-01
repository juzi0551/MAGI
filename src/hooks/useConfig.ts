import { useState, useEffect, useCallback } from 'react';
import { UserConfig } from '../types/config';
import { AIProvider } from '../types/ai';
import { ConfigStorageService, ConfigStorage } from '../services/storage/configStorage';

/**
 * 配置管理Hook的返回值
 */
export interface UseConfigReturn {
  // 配置状态
  config: ConfigStorage | null;
  userConfig: UserConfig | null;
  audioSettings: ConfigStorage['audioSettings'] | null;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  isValid: boolean;
  
  // 操作方法
  updateUserConfig: (config: Partial<UserConfig>) => Promise<boolean>;
  updateAudioSettings: (settings: Partial<ConfigStorage['audioSettings']>) => Promise<boolean>;
  clearConfig: () => Promise<boolean>;
  exportConfig: () => string | null;
  importConfig: (data: string) => Promise<boolean>;
  
  // 便捷方法
  setProvider: (provider: AIProvider) => Promise<boolean>;
  setModel: (model: string) => Promise<boolean>;
  setApiKey: (apiKey: string) => Promise<boolean>;
  setApiBase: (apiBase?: string) => Promise<boolean>;
}

/**
 * 配置管理Hook
 * 提供完整的配置管理功能，包括用户配置和音频设置
 */
export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<ConfigStorage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 错误处理
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    console.error('配置管理错误:', errorMessage);
  }, []);

  // 加载配置
  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = ConfigStorageService.getConfig();
      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        handleError(result.error || '加载配置失败');
      }
    } catch (err) {
      handleError(`加载配置异常: ${err instanceof Error ? err.message : '未知错误'}`);
    }

    setIsLoading(false);
  }, [handleError]);

  // 初始化时加载配置
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 更新用户配置
  const updateUserConfig = useCallback(async (userConfig: Partial<UserConfig>): Promise<boolean> => {
    try {
      const result = ConfigStorageService.updateUserConfig(userConfig);
      if (result.success) {
        // 重新加载配置
        await loadConfig();
        setError(null);
        return true;
      } else {
        handleError(result.error || '更新用户配置失败');
        return false;
      }
    } catch (err) {
      handleError(`更新用户配置异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadConfig, handleError]);

  // 更新音频设置
  const updateAudioSettings = useCallback(async (audioSettings: Partial<ConfigStorage['audioSettings']>): Promise<boolean> => {
    try {
      const result = ConfigStorageService.updateAudioSettings(audioSettings);
      if (result.success) {
        // 重新加载配置
        await loadConfig();
        setError(null);
        return true;
      } else {
        handleError(result.error || '更新音频设置失败');
        return false;
      }
    } catch (err) {
      handleError(`更新音频设置异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadConfig, handleError]);

  // 清除配置
  const clearConfig = useCallback(async (): Promise<boolean> => {
    try {
      const result = ConfigStorageService.clearConfig();
      if (result.success) {
        // 重新加载配置（将获得默认配置）
        await loadConfig();
        setError(null);
        return true;
      } else {
        handleError(result.error || '清除配置失败');
        return false;
      }
    } catch (err) {
      handleError(`清除配置异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadConfig, handleError]);

  // 导出配置
  const exportConfig = useCallback((): string | null => {
    try {
      const result = ConfigStorageService.exportConfig();
      if (result.success && result.data) {
        return result.data;
      } else {
        handleError(result.error || '导出配置失败');
        return null;
      }
    } catch (err) {
      handleError(`导出配置异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return null;
    }
  }, [handleError]);

  // 导入配置
  const importConfig = useCallback(async (data: string): Promise<boolean> => {
    try {
      const result = ConfigStorageService.importConfig(data);
      if (result.success) {
        // 重新加载配置
        await loadConfig();
        setError(null);
        return true;
      } else {
        handleError(result.error || '导入配置失败');
        return false;
      }
    } catch (err) {
      handleError(`导入配置异常: ${err instanceof Error ? err.message : '未知错误'}`);
      return false;
    }
  }, [loadConfig, handleError]);

  // 便捷方法：设置提供商
  const setProvider = useCallback(async (provider: AIProvider): Promise<boolean> => {
    return updateUserConfig({ provider });
  }, [updateUserConfig]);

  // 便捷方法：设置模型
  const setModel = useCallback(async (model: string): Promise<boolean> => {
    return updateUserConfig({ model });
  }, [updateUserConfig]);

  // 便捷方法：设置API密钥
  const setApiKey = useCallback(async (apiKey: string): Promise<boolean> => {
    return updateUserConfig({ apiKey });
  }, [updateUserConfig]);

  // 便捷方法：设置API基础URL
  const setApiBase = useCallback(async (apiBase?: string): Promise<boolean> => {
    return updateUserConfig({ apiBase });
  }, [updateUserConfig]);

  // 计算配置是否有效
  const isValid = config ? ConfigStorageService.isConfigValid(config) : false;

  return {
    // 配置状态
    config,
    userConfig: config?.userConfig || null,
    audioSettings: config?.audioSettings || null,
    
    // 加载状态
    isLoading,
    error,
    isValid,
    
    // 操作方法
    updateUserConfig,
    updateAudioSettings,
    clearConfig,
    exportConfig,
    importConfig,
    
    // 便捷方法
    setProvider,
    setModel,
    setApiKey,
    setApiBase
  };
}

/**
 * 简化版配置Hook，仅关注用户配置部分
 */
export function useUserConfig() {
  const {
    userConfig,
    isLoading,
    error,
    isValid,
    updateUserConfig,
    setProvider,
    setModel,
    setApiKey,
    setApiBase
  } = useConfig();

  return {
    userConfig,
    isLoading,
    error,
    isValid,
    updateUserConfig,
    setProvider,
    setModel,
    setApiKey,
    setApiBase
  };
}

/**
 * 音频设置Hook
 */
export function useAudioConfig() {
  const {
    audioSettings,
    isLoading,
    error,
    updateAudioSettings
  } = useConfig();

  const setEnabled = useCallback(async (enabled: boolean): Promise<boolean> => {
    return updateAudioSettings({ enabled });
  }, [updateAudioSettings]);

  const setVolume = useCallback(async (volume: number): Promise<boolean> => {
    // 确保音量在有效范围内
    const clampedVolume = Math.max(0, Math.min(1, volume));
    return updateAudioSettings({ volume: clampedVolume });
  }, [updateAudioSettings]);

  return {
    audioSettings,
    isLoading,
    error,
    updateAudioSettings,
    setEnabled,
    setVolume
  };
}