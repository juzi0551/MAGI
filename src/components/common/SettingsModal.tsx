import { useState, useEffect } from 'react';
import { useConfig, useAudio } from '../../context';
import { AIProvider } from '../../types/ai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 默认模型映射（参考原项目）
const DEFAULT_MODELS = {
  'openrouter': 'google/gemini-2.5-flash',
  'openai': 'gpt-4o',
  'anthropic': 'claude-3-5-sonnet-20241022',
  'google': 'gemini-2.5-flash',
  'cohere': 'command-r-plus-08-2024',
  'zhipu': 'glm-4-plus',
  'moonshot': 'moonshot-v1-32k',
  'alibaba': 'qwen-max',
  'baidu': 'ernie-4.0-turbo-8k',
  'deepseek': 'deepseek-chat'
} as const;

/**
 * 设置模态框组件 - 简化版本，专注于API配置
 */
const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const config = useConfig();
  const { isAudioEnabled, audioVolume, toggleAudio, setAudioVolume } = useAudio();
  
  // 本地状态管理
  const [localProvider, setLocalProvider] = useState<AIProvider>(config.provider);
  const [localModel, setLocalModel] = useState(config.model);
  const [localApiKey, setLocalApiKey] = useState(config.apiKey);
  const [localApiBase, setLocalApiBase] = useState(config.apiBase || '');

  // 同步配置到本地状态
  useEffect(() => {
    if (isOpen) {
      setLocalProvider(config.provider);
      setLocalModel(config.model);
      setLocalApiKey(config.apiKey);
      setLocalApiBase(config.apiBase || '');
    }
  }, [isOpen, config]);

  // 提供商变更处理（自动更新默认模型）
  const handleProviderChange = (newProvider: AIProvider) => {
    setLocalProvider(newProvider);
    setLocalModel(DEFAULT_MODELS[newProvider] || 'gpt-4o');
  };

  // 保存配置
  const handleSave = () => {
    config.updateConfig({
      provider: localProvider,
      model: localModel,
      apiKey: localApiKey,
      apiBase: localApiBase || undefined
    });
    onClose();
  };

  // 取消
  const handleCancel = () => {
    onClose();
  };

  // 清除配置
  const handleClear = () => {
    config.clearConfig();
    // 重置为默认值
    const defaultProvider: AIProvider = 'openrouter';
    setLocalProvider(defaultProvider);
    setLocalModel(DEFAULT_MODELS[defaultProvider]);
    setLocalApiKey('');
    setLocalApiBase('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>API 配置</h2>
        
        {/* 错误提示 */}
        {config.error && (
          <div className="config-error">
            <strong>配置错误：</strong>{config.error}
          </div>
        )}

        <div className="form-group">
          <label>服务商 (Provider)</label>
          <select 
            value={localProvider} 
            onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          >
            <option value="openrouter">OpenRouter</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google</option>
            <option value="cohere">Cohere</option>
            <option value="zhipu">ZhipuAI (智谱)</option>
            <option value="moonshot">Moonshot (月之暗面)</option>
            <option value="alibaba">Alibaba (通义千问)</option>
            <option value="baidu">Baidu (文心千帆)</option>
            <option value="deepseek">DeepSeek (深度求索)</option>
          </select>
        </div>

        <div className="form-group">
          <label>API Base URL (可选)</label>
          <input
            type="text"
            value={localApiBase}
            onChange={(e) => setLocalApiBase(e.target.value)}
            placeholder="例如: https://api.openai.com/v1"
          />
        </div>

        <div className="form-group">
          <label>模型 (Model)</label>
          <input
            type="text"
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>API 密钥 (API Key)</label>
          <input
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
          />
        </div>

        <hr />

        <h2>音频设置</h2>
        <div className="form-group">
          <label>启用音频</label>
          <label className="switch">
            <input type="checkbox" checked={isAudioEnabled} onChange={toggleAudio} />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="form-group">
          <label>音量</label>
          <input
            type="range"
            min="0"
            max="100"
            value={audioVolume}
            onChange={(e) => setAudioVolume(Number(e.target.value))}
            disabled={!isAudioEnabled}
          />
        </div>

        <div className="modal-actions">
          <div className="left-actions">
            <button 
              onClick={handleClear} 
              className="clear-button"
              type="button"
            >
              清除
            </button>
          </div>
          <div className="right-actions">
            <button 
              onClick={handleCancel}
              className="btn-secondary"
              type="button"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="btn-primary"
              disabled={config.isLoading}
              type="button"
            >
              {config.isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;