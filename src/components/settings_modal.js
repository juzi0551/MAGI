import React from 'react';
const $ = React.createElement;

export default function SettingsModal({ id, isOpen, setProps }) {
    const [provider, setProvider] = React.useState('openrouter');
    const [model, setModel] = React.useState('google/gemini-2.5-flash');
    const [apiKey, setApiKey] = React.useState('');
    const [apiBase, setApiBase] = React.useState('');

    React.useEffect(() => {
        if (isOpen && window.ConfigStorage) {
            const config = window.ConfigStorage.getUserConfig();
            if (config) {
                setProvider(config.provider || 'openrouter');
                setModel(config.model || 'google/gemini-2.5-flash');
                setApiKey(config.apiKey || '');
                setApiBase(config.apiBase || '');
            }
        }
    }, [isOpen]);

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
        setProvider('openrouter');
        setModel('google/gemini-2.5-flash');
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
                $('select', { value: provider, onChange: e => setProvider(e.target.value) },
                    $('option', { value: 'openrouter' }, 'OpenRouter'),
                    $('option', { value: 'openai' }, 'OpenAI'),
                    $('option', { value: 'anthropic' }, 'Anthropic'),
                    $('option', { value: 'google' }, 'Google'),
                    $('option', { value: 'cohere' }, 'Cohere'),
                    $('option', { value: 'zhipu' }, 'ZhipuAI (智谱)'),
                    $('option', { value: 'moonshot' }, 'Moonshot (月之暗面)'),
                    $('option', { value: 'alibaba' }, 'Alibaba (通义千问)'),
                    $('option', { value: 'baidu' }, 'Baidu (文心千帆)')
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
