import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置模型映射
MODEL_CONFIG = {
    'openai': {
        'models': {
            'gpt-4': 'GPT-4',
            'gpt-4-turbo': 'GPT-4 Turbo',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'gpt-4o': 'GPT-4o',
            'gpt-4o-mini': 'GPT-4o Mini'
        },
        'default_model': os.getenv('OPENAI_DEFAULT_MODEL', 'gpt-4'),
        'api_key_env': 'OPENAI_API_KEY',
        'api_base_env': 'OPENAI_API_BASE',
        'default_api_base': 'https://api.openai.com/v1'
    },
    'deepseek': {
        'models': {
            'deepseek/deepseek-chat': 'DeepSeek Chat',
            'deepseek/deepseek-coder': 'DeepSeek Coder'
        },
        'default_model': f"deepseek/{os.getenv('DEEPSEEK_DEFAULT_MODEL', 'deepseek-chat')}",
        'api_key_env': 'DEEPSEEK_API_KEY',
        'api_base_env': 'DEEPSEEK_API_BASE',
        'default_api_base': 'https://api.deepseek.com'
    },
    'openrouter': {
        'models': {
            'openrouter/anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
            'openrouter/anthropic/claude-3-haiku': 'Claude 3 Haiku',
            'openrouter/openai/gpt-4': 'GPT-4 (OpenRouter)',
            'openrouter/meta-llama/llama-3.1-70b-instruct': 'Llama 3.1 70B',
            'openrouter/google/gemini-pro': 'Gemini Pro',
            'openrouter/google/gemini-2.5-flash': 'Gemini 2.5 Flash',
            'openrouter/qwen/qwen3-235b-a22b-thinking-2507': 'Qwen3 235B Thinking'
        },
        'default_model': f"openrouter/{os.getenv('OPENROUTER_DEFAULT_MODEL', 'google/gemini-2.5-flash')}",
        'api_key_env': 'OPENROUTER_API_KEY',
        'api_base_env': 'OPENROUTER_API_BASE',
        'default_api_base': 'https://openrouter.ai/api/v1'
    },
    'claude': {
        'models': {
            'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
            'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
            'claude-3-haiku-20240307': 'Claude 3 Haiku'
        },
        'default_model': os.getenv('CLAUDE_DEFAULT_MODEL', 'claude-3-5-sonnet-20241022'),
        'api_key_env': 'ANTHROPIC_API_KEY',
        'api_base_env': 'ANTHROPIC_API_BASE',
        'default_api_base': 'https://api.anthropic.com'
    },
    'custom': {
        'models': {
            'gpt-3.5-turbo': '自定义模型',
            'llama2': 'Llama 2',
            'mixtral-8x7b': 'Mixtral 8x7B'
        },
        'default_model': os.getenv('CUSTOM_DEFAULT_MODEL', os.getenv('CUSTOM_MODEL', 'gpt-3.5-turbo')),
        'api_key_env': 'CUSTOM_API_KEY',
        'api_base_env': 'CUSTOM_API_BASE',
        'default_api_base': 'https://api.openai.com/v1'
    }
}

def get_model_config(provider: str = None):
    """获取模型配置"""
    if not provider:
        # 默认使用第一个可用的提供商
        for p, config in MODEL_CONFIG.items():
            if os.getenv(config['api_key_env']):
                provider = p
                break
        else:
            provider = 'openai'  # 默认回退到OpenAI
    
    return MODEL_CONFIG.get(provider, MODEL_CONFIG['openai'])