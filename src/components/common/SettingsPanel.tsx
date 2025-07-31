import { useState } from 'react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 供应商配置
const providers = [
  { value: 'openrouter', label: 'OpenRouter', defaultModel: 'google/gemini-2.5-flash' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o' },
  { value: 'anthropic', label: 'Anthropic', defaultModel: 'claude-3-5-sonnet-20241022' },
  { value: 'google', label: 'Google', defaultModel: 'gemini-2.5-flash' },
  { value: 'cohere', label: 'Cohere', defaultModel: 'command-r-plus-08-2024' },
  { value: 'zhipu', label: 'ZhipuAI (智谱)', defaultModel: 'glm-4-plus' },
  { value: 'moonshot', label: 'Moonshot (月之暗面)', defaultModel: 'moonshot-v1-32k' },
  { value: 'alibaba', label: 'Alibaba (通义千问)', defaultModel: 'qwen-max' },
  { value: 'baidu', label: 'Baidu (文心千帆)', defaultModel: 'ernie-4.0-turbo-8k' },
  { value: 'deepseek', label: 'DeepSeek (深度求索)', defaultModel: 'deepseek-chat' },
  { value: 'custom', label: '自定义 (Custom)', defaultModel: 'gpt-3.5-turbo' }
];

/**
 * 设置面板组件 - 参考原项目结构
 */
const SettingsPanel = ({ isOpen, onClose }: SettingsPanelProps) => {
  // 基础配置状态
  const [provider, setProvider] = useState('openrouter');
  const [model, setModel] = useState('google/gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [apiBase, setApiBase] = useState('');
  
  // 界面设置状态 - 暂时注释掉
  // const [language, setLanguage] = useState('zh-CN');
  // const [theme, setTheme] = useState('dark');
  
  // MAGI 配置状态
  const [enableMelchior, setEnableMelchior] = useState(true);
  const [enableBalthasar, setEnableBalthasar] = useState(true);
  const [enableCasper, setEnableCasper] = useState(true);

  // 供应商变更处理
  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const selectedProvider = providers.find(p => p.value === newProvider);
    if (selectedProvider) {
      setModel(selectedProvider.defaultModel);
    }
  };

  // 使用默认模型
  const useDefaultModel = () => {
    const selectedProvider = providers.find(p => p.value === provider);
    if (selectedProvider) {
      setModel(selectedProvider.defaultModel);
    }
  };

  if (!isOpen) return null;

  const selectedProvider = providers.find(p => p.value === provider);

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>系统设置</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {/* AI 服务配置 */}
          <div className="settings-section">
            <h3>AI 服务配置</h3>
            
            <div className="form-group">
              <label>服务商 (Provider)</label>
              <select value={provider} onChange={(e) => handleProviderChange(e.target.value)}>
                {providers.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>模型 (Model)</label>
              <div className="model-input-group">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="输入模型名称"
                />
                <button 
                  type="button" 
                  className="default-btn"
                  onClick={useDefaultModel}
                  title={`使用默认模型: ${selectedProvider?.defaultModel}`}
                >
                  默认
                </button>
              </div>
              {selectedProvider && (
                <div className="model-hint">
                  默认模型: {selectedProvider.defaultModel}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>API 密钥 (API Key)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的 API Key"
              />
            </div>

            <div className="form-group">
              <label>API Base URL (可选)</label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="自定义 API 端点 (可选)"
              />
            </div>
          </div>

          {/* 界面设置 - 暂时注释掉 */}
          {/*
          <div className="settings-section">
            <h3>界面设置</h3>
            
            <div className="form-group">
              <label>语言 (Language)</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本语</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>主题 (Theme)</label>
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="dark">深色模式</option>
                <option value="light">浅色模式</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
          </div>
          */}

          {/* MAGI 配置 */}
          <div className="settings-section">
            <h3>MAGI 配置</h3>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={enableMelchior}
                  onChange={(e) => setEnableMelchior(e.target.checked)}
                />
                启用 MELCHIOR (逻辑分析)
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={enableBalthasar}
                  onChange={(e) => setEnableBalthasar(e.target.checked)}
                />
                启用 BALTHASAR (伦理判断)
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={enableCasper}
                  onChange={(e) => setEnableCasper(e.target.checked)}
                />
                启用 CASPER (直觉感知)
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn-primary">
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;