import { useState, useEffect } from 'react';
import { useConfig, useAudio } from '../../context';
import { AIProvider } from '../../types/ai';
import { DEFAULT_BACKGROUND_INFO, DEFAULT_PERSONALITY_PROMPTS } from '../../config/prompts';

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
 * 设置模态框组件 - 三个Tab页签布局
 */
const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const config = useConfig();
  const { isAudioEnabled, audioVolume, toggleAudio, setAudioVolume } = useAudio();
  
  // Tab状态管理
  const [activeTab, setActiveTab] = useState<'api' | 'audio' | 'personality'>('api');
  
  // 本地状态管理 - API设置
  const [localProvider, setLocalProvider] = useState<AIProvider>(config.provider);
  const [localModel, setLocalModel] = useState(config.model);
  const [localApiKey, setLocalApiKey] = useState(config.apiKey);
  const [localApiBase, setLocalApiBase] = useState(config.apiBase || '');

  // 本地状态管理 - 人格与世界观设置
  const [localCustomBackground, setLocalCustomBackground] = useState(config.customBackground || '');
  const [localCustomPrompts, setLocalCustomPrompts] = useState({
    melchior: config.customPrompts?.melchior || '',
    balthasar: config.customPrompts?.balthasar || '',
    casper: config.customPrompts?.casper || ''
  });
  const [activePersonality, setActivePersonality] = useState<'melchior' | 'balthasar' | 'casper'>('melchior');

  // 同步配置到本地状态
  useEffect(() => {
    if (isOpen) {
      setLocalProvider(config.provider);
      setLocalModel(config.model);
      setLocalApiKey(config.apiKey);
      setLocalApiBase(config.apiBase || '');
      setLocalCustomBackground(config.customBackground || '');
      setLocalCustomPrompts({
        melchior: config.customPrompts?.melchior || '',
        balthasar: config.customPrompts?.balthasar || '',
        casper: config.customPrompts?.casper || ''
      });
    }
  }, [isOpen, config]);

  // 提供商变更处理（自动更新默认模型）
  const handleProviderChange = (newProvider: AIProvider) => {
    setLocalProvider(newProvider);
    setLocalModel(DEFAULT_MODELS[newProvider] || 'gpt-4o');
  };

  // 恢复默认背景
  const handleRestoreDefaultBackground = () => {
    setLocalCustomBackground(DEFAULT_BACKGROUND_INFO);
  };

  // 恢复默认人格
  const handleRestoreDefaultPersonality = (personality: 'melchior' | 'balthasar' | 'casper') => {
    setLocalCustomPrompts(prev => ({
      ...prev,
      [personality]: DEFAULT_PERSONALITY_PROMPTS[personality]
    }));
  };

  // 保存配置
  const handleSave = () => {
    config.updateConfig({
      provider: localProvider,
      model: localModel,
      apiKey: localApiKey,
      apiBase: localApiBase || undefined,
      customBackground: localCustomBackground || undefined,
      customPrompts: {
        melchior: localCustomPrompts.melchior || undefined,
        balthasar: localCustomPrompts.balthasar || undefined,
        casper: localCustomPrompts.casper || undefined
      }
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
    setLocalCustomBackground('');
    setLocalCustomPrompts({
      melchior: '',
      balthasar: '',
      casper: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content settings-modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>系统设置</h2>
        
        {/* 错误提示 */}
        {config.error && (
          <div className="config-error">
            <strong>配置错误：</strong>{config.error}
          </div>
        )}

        {/* Tab导航 */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            API接口设置
          </button>
          <button 
            className={`tab-button ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            音频设置
          </button>
          <button 
            className={`tab-button ${activeTab === 'personality' ? 'active' : ''}`}
            onClick={() => setActiveTab('personality')}
          >
            人格与世界观设定
          </button>
        </div>

        {/* Tab内容区域 */}
        <div className="tab-content">
          {/* API接口设置 Tab */}
          {activeTab === 'api' && (
            <div className="tab-panel">
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
            </div>
          )}

          {/* 音频设置 Tab */}
          {activeTab === 'audio' && (
            <div className="tab-panel">
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
                <span className="volume-display">{audioVolume}%</span>
              </div>
            </div>
          )}

          {/* 人格与世界观设定 Tab */}
          {activeTab === 'personality' && (
            <div className="tab-panel">
              <div className="personality-section">
                <h3>世界观背景 (Worldview/Background)</h3>
                <div className="form-group">
                  <div className="textarea-header">
                    <label>自定义背景故事</label>
                    <button 
                      type="button" 
                      className="restore-default-btn"
                      onClick={handleRestoreDefaultBackground}
                    >
                      恢复默认
                    </button>
                  </div>
                  <textarea
                    value={localCustomBackground}
                    onChange={(e) => setLocalCustomBackground(e.target.value)}
                    placeholder="请输入自定义的世界观背景描述，留空将使用默认的EVA背景故事"
                    rows={6}
                    className="background-textarea"
                  />
                </div>
              </div>

              <div className="personality-section">
                <h3>核心人格 (Core Personalities)</h3>
                
                {/* 人格选择子Tab */}
                <div className="personality-tabs">
                  <button
                    className={`personality-tab ${activePersonality === 'melchior' ? 'active' : ''}`}
                    onClick={() => setActivePersonality('melchior')}
                  >
                    Melchior (科学家)
                  </button>
                  <button
                    className={`personality-tab ${activePersonality === 'balthasar' ? 'active' : ''}`}
                    onClick={() => setActivePersonality('balthasar')}
                  >
                    Balthasar (母亲)
                  </button>
                  <button
                    className={`personality-tab ${activePersonality === 'casper' ? 'active' : ''}`}
                    onClick={() => setActivePersonality('casper')}
                  >
                    Casper (女人)
                  </button>
                </div>

                {/* 当前选中人格的设置 */}
                <div className="personality-content">
                  <div className="form-group">
                    <div className="textarea-header">
                      <label>
                        {activePersonality === 'melchior' && 'Melchior-1 (科学家) 人格描述'}
                        {activePersonality === 'balthasar' && 'Balthasar-2 (母亲) 人格描述'}
                        {activePersonality === 'casper' && 'Casper-3 (女人) 人格描述'}
                      </label>
                      <button 
                        type="button" 
                        className="restore-default-btn"
                        onClick={() => handleRestoreDefaultPersonality(activePersonality)}
                      >
                        恢复默认
                      </button>
                    </div>
                    <textarea
                      value={localCustomPrompts[activePersonality]}
                      onChange={(e) => setLocalCustomPrompts(prev => ({
                        ...prev,
                        [activePersonality]: e.target.value
                      }))}
                      placeholder={`请输入自定义的${activePersonality}人格描述，留空将使用默认描述`}
                      rows={12}
                      className="personality-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="modal-actions">
          <div className="left-actions">
            <button 
              onClick={handleClear} 
              className="clear-button"
              type="button"
            >
              清除所有设置
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