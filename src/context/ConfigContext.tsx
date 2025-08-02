import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { ConfigContextType, ContextProviderProps } from '../types/context';
import { UserConfig, AudioSettings, DEFAULT_CONFIG, PersonalitySettings } from '../types/config';
import { AIProvider } from '../types/ai';
import { ConfigStorageService } from '../services/storage/configStorage';
import { mergePersonalitySettings, migratePersonalityConfig, needsMigration, validatePersonalitySettings } from '../utils/personalityUtils';

interface ConfigState {
  provider: AIProvider;
  model: string;
  apiKey: string;
  apiBase?: string;
  audioSettings: AudioSettings;
  customBackground?: string;
  
  // 新的人格配置
  personalities?: PersonalitySettings;
  
  // 兼容性：保留旧字段
  customPrompts?: {
    melchior?: string;
    balthasar?: string;
    casper?: string;
  };
  isConfigValid: boolean;
  isLoading: boolean;
  error: string | null;
}

type ConfigAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIG'; payload: UserConfig }
  | { type: 'SET_AUDIO_SETTINGS'; payload: AudioSettings }
  | { type: 'UPDATE_CONFIG'; payload: Partial<UserConfig> }
  | { type: 'UPDATE_AUDIO_SETTINGS'; payload: Partial<AudioSettings> }
  | { type: 'CLEAR_CONFIG' }
  | { type: 'VALIDATE_CONFIG' };

const initialState: ConfigState = {
  provider: DEFAULT_CONFIG.userConfig.provider,
  model: DEFAULT_CONFIG.userConfig.model,
  apiKey: DEFAULT_CONFIG.userConfig.apiKey,
  apiBase: DEFAULT_CONFIG.userConfig.apiBase,
  audioSettings: DEFAULT_CONFIG.audioSettings,
  customBackground: DEFAULT_CONFIG.userConfig.customBackground,
  personalities: mergePersonalitySettings(),
  customPrompts: DEFAULT_CONFIG.userConfig.customPrompts,
  isConfigValid: false,
  isLoading: false,
  error: null,
};

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CONFIG':
      // 检查是否需要迁移配置
      let personalities = action.payload.personalities;
      if (needsMigration(action.payload)) {
        personalities = migratePersonalityConfig(action.payload);
        // 自动保存迁移后的配置
        ConfigStorageService.updateUserConfig({ personalities });
      } else if (personalities) {
        personalities = mergePersonalitySettings(personalities);
      }
      
      return {
        ...state,
        provider: action.payload.provider,
        model: action.payload.model,
        apiKey: action.payload.apiKey,
        apiBase: action.payload.apiBase,
        customBackground: action.payload.customBackground,
        personalities: personalities || state.personalities,
        customPrompts: action.payload.customPrompts,
        isConfigValid: !!(action.payload.provider && action.payload.model && action.payload.apiKey?.trim()),
      };
    
    case 'SET_AUDIO_SETTINGS':
      return {
        ...state,
        audioSettings: action.payload,
      };
    
    case 'UPDATE_CONFIG': {
      const updatedConfig = {
        provider: action.payload.provider || state.provider,
        model: action.payload.model || state.model,
        apiKey: action.payload.apiKey !== undefined ? action.payload.apiKey : state.apiKey,
        apiBase: action.payload.apiBase !== undefined ? action.payload.apiBase : state.apiBase,
        customBackground: action.payload.customBackground !== undefined ? action.payload.customBackground : state.customBackground,
        personalities: action.payload.personalities !== undefined ? mergePersonalitySettings(action.payload.personalities) : state.personalities,
        customPrompts: action.payload.customPrompts !== undefined ? action.payload.customPrompts : state.customPrompts,
      };
      
      return {
        ...state,
        ...updatedConfig,
        isConfigValid: !!(updatedConfig.provider && updatedConfig.model && updatedConfig.apiKey?.trim()),
      };
    }
    
    case 'UPDATE_AUDIO_SETTINGS':
      return {
        ...state,
        audioSettings: {
          ...state.audioSettings,
          ...action.payload,
        },
      };
    
    case 'CLEAR_CONFIG':
      return {
        ...state,
        provider: DEFAULT_CONFIG.userConfig.provider,
        model: DEFAULT_CONFIG.userConfig.model,
        apiKey: DEFAULT_CONFIG.userConfig.apiKey,
        apiBase: DEFAULT_CONFIG.userConfig.apiBase,
        customBackground: DEFAULT_CONFIG.userConfig.customBackground,
        personalities: mergePersonalitySettings(),
        customPrompts: DEFAULT_CONFIG.userConfig.customPrompts,
        isConfigValid: false,
      };
    
    case 'VALIDATE_CONFIG':
      const basicConfigValid = !!(state.provider && state.model && state.apiKey?.trim());
      const personalitiesValid = state.personalities ? validatePersonalitySettings(state.personalities) : true;
      
      return {
        ...state,
        isConfigValid: basicConfigValid && personalitiesValid,
      };
    
    default:
      return state;
  }
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: ContextProviderProps) {
  const [state, dispatch] = useReducer(configReducer, initialState);

  // 初始化配置
  useEffect(() => {
    const loadConfig = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const configResult = ConfigStorageService.getConfig();
        
        if (configResult.success && configResult.data) {
          dispatch({ type: 'SET_CONFIG', payload: configResult.data.userConfig });
          dispatch({ type: 'SET_AUDIO_SETTINGS', payload: configResult.data.audioSettings });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : '加载配置失败',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadConfig();
  }, []);

  // 更新用户配置
  const updateConfig = useCallback((config: Partial<UserConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
    
    // 保存到存储
    const result = ConfigStorageService.updateUserConfig(config);
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || '保存配置失败' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, []);

  // 更新音频设置
  const updateAudioSettings = useCallback((settings: Partial<AudioSettings>) => {
    dispatch({ type: 'UPDATE_AUDIO_SETTINGS', payload: settings });
    
    // 保存到存储
    const result = ConfigStorageService.updateAudioSettings(settings);
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || '保存音频设置失败' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, []);

  // 清除配置
  const clearConfig = useCallback(() => {
    dispatch({ type: 'CLEAR_CONFIG' });
    
    // 清除存储
    const result = ConfigStorageService.clearConfig();
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || '清除配置失败' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, []);

  // 验证配置
  const validateConfig = useCallback(() => {
    dispatch({ type: 'VALIDATE_CONFIG' });
    return state.isConfigValid;
  }, [state.isConfigValid]);

  // 导出配置
  const exportConfig = useCallback(() => {
    const result = ConfigStorageService.exportConfig();
    if (result.success && result.data) {
      return result.data;
    }
    return '';
  }, []);

  // 导入配置
  const importConfig = useCallback((data: string) => {
    const result = ConfigStorageService.importConfig(data);
    
    if (result.success) {
      // 重新加载配置
      const configResult = ConfigStorageService.getConfig();
      if (configResult.success && configResult.data) {
        dispatch({ type: 'SET_CONFIG', payload: configResult.data.userConfig });
        dispatch({ type: 'SET_AUDIO_SETTINGS', payload: configResult.data.audioSettings });
      }
      dispatch({ type: 'SET_ERROR', payload: null });
      return true;
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error || '导入配置失败' });
      return false;
    }
  }, []);

  // 重置为默认配置
  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'CLEAR_CONFIG' });
    dispatch({ type: 'SET_AUDIO_SETTINGS', payload: DEFAULT_CONFIG.audioSettings });
    
    // 保存默认配置到存储
    const result = ConfigStorageService.saveConfig({
      userConfig: DEFAULT_CONFIG.userConfig,
      audioSettings: DEFAULT_CONFIG.audioSettings,
    });
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error || '重置配置失败' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: null });
    }
  }, []);

  const contextValue: ConfigContextType = {
    // 状态
    provider: state.provider,
    model: state.model,
    apiKey: state.apiKey,
    apiBase: state.apiBase,
    audioSettings: state.audioSettings,
    customBackground: state.customBackground,
    personalities: state.personalities,
    customPrompts: state.customPrompts,
    isConfigValid: state.isConfigValid,
    isLoading: state.isLoading,
    error: state.error,
    
    // 操作方法
    updateConfig,
    updateAudioSettings,
    clearConfig,
    validateConfig,
    exportConfig,
    importConfig,
    resetToDefaults,
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextType {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}