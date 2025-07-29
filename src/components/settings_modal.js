import React from 'react';
const $ = React.createElement;

export default function SettingsModal({ id, isOpen, setProps }) {
    const [provider, setProvider] = React.useState('openrouter');
    const [model, setModel] = React.useState('google/gemini-2.5-flash');
    const [apiKey, setApiKey] = React.useState('');
    const [apiBase, setApiBase] = React.useState('');

    // 定义每个供应商的默认模型
    const defaultModels = {
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
    };

    // 处理供应商变更时自动更新默认模型
    const handleProviderChange = (newProvider) => {
        setProvider(newProvider);
        setModel(defaultModels[newProvider] || 'gpt-4o');
    };

    React.useEffect(() => {
        if (isOpen) {
            const config = window.ConfigStorage.getUserConfig();
            if (config) {
                setProvider(config.provider || 'openrouter');
                setModel(config.model || defaultModels[config.provider] || 'google/gemini-2.5-flash');
                setApiKey(config.apiKey || '');
                setApiBase(config.apiBase || '');
            } else {
                // 如果没有配置，则确保面板显示的是默认值
                setProvider('openrouter');
                setModel(defaultModels['openrouter']);
                setApiKey('');
                setApiBase('');
            }
        }
    }, [isOpen]);

    // 页面加载时检查配置
    React.useEffect(() => {
        const config = window.ConfigStorage.getUserConfig();
        if (!config || !config.apiKey) {
            if (setProps) {
                setProps({ isOpen: true });
            }
        }
    }, []);

    const handleSave = () => {
        const config = { provider, model, apiKey, apiBase };
        if (setProps) {
            setProps({ onSave: config, isOpen: false });
        }
    };

    const handleClose = () => {
        if (setProps) {
            setProps({ isOpen: false });
        }
    };

    const handleClear = () => {
        if (window.ConfigStorage) {
            window.ConfigStorage.clearUserConfig();
        }
        const defaultProvider = 'openrouter';
        setProvider(defaultProvider);
        setModel(defaultModels[defaultProvider]);
        setApiKey('');
        setApiBase('');
    };

    if (!isOpen) {
        return null;
    }

    return $('div', { className: 'modal-overlay' },
        $('div', { className: 'modal-content' },
            $('h2', {}, 'API 配置'),
            $('div', { className: 'form-group' },
                $('label', {}, '服务商 (Provider)'),
                $('select', { value: provider, onChange: e => handleProviderChange(e.target.value) },
                    $('option', { value: 'openrouter' }, 'OpenRouter'),
                    $('option', { value: 'openai' }, 'OpenAI'),
                    $('option', { value: 'anthropic' }, 'Anthropic'),
                    $('option', { value: 'google' }, 'Google'),
                    $('option', { value: 'cohere' }, 'Cohere'),
                    $('option', { value: 'zhipu' }, 'ZhipuAI (智谱)'),
                    $('option', { value: 'moonshot' }, 'Moonshot (月之暗面)'),
                    $('option', { value: 'alibaba' }, 'Alibaba (通义千问)'),
                    $('option', { value: 'baidu' }, 'Baidu (文心千帆)'),
                    $('option', { value: 'deepseek' }, 'DeepSeek (深度求索)')
                )
            ),
            $('div', { className: 'form-group' },
                $('label', {}, 'API Base URL (可选)'),
                $('input', { type: 'text', value: apiBase, onChange: e => setApiBase(e.target.value), placeholder: '例如: https://api.openai.com/v1' })
            ),
            $('div', { className: 'form-group' },
                $('label', {}, '模型 (Model)'),
                $('input', { type: 'text', value: model, onChange: e => setModel(e.target.value) })
            ),
            $('div', { className: 'form-group' },
                $('label', {}, 'API 密钥 (API Key)'),
                $('input', { type: 'password', value: apiKey, onChange: e => setApiKey(e.target.value) })
            ),
            $('div', { className: 'modal-actions' },
                $('button', { onClick: handleClear, className: 'clear-button' }, '清除'),
                $('button', { onClick: handleSave }, '保存'),
                $('button', { onClick: handleClose }, '取消')
            )
        )
    );
}
