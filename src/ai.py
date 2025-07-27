import litellm
import re
import os
import json
from dotenv import load_dotenv
from prompts import get_personality_prompt

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


def setup_litellm(provider: str = None, model: str = None, api_key: str = None):
    """设置LiteLLM配置"""
    config = get_model_config(provider)
    
    # 设置API密钥
    if api_key:
        os.environ[config['api_key_env']] = api_key
    
    # 设置API基础URL
    api_base = os.getenv(config['api_base_env'], config['default_api_base'])
    
    if provider == 'deepseek':
        litellm.api_base = api_base
        os.environ['DEEPSEEK_API_BASE'] = api_base
    elif provider == 'openrouter':
        os.environ['OPENROUTER_API_BASE'] = api_base
    elif provider == 'claude':
        os.environ['ANTHROPIC_API_BASE'] = api_base
    elif provider == 'custom':
        litellm.api_base = api_base
        os.environ['LITELLM_API_BASE'] = api_base
    else:  # openai
        if api_base != 'https://api.openai.com/v1':
            litellm.api_base = api_base
            os.environ['OPENAI_API_BASE'] = api_base
    
    # 处理模型名称
    final_model = model or config['default_model']
    
    # 处理不同提供商的模型名称格式
    if provider == 'openrouter':
        # OpenRouter需要openrouter/前缀才能被litellm识别
        if not final_model.startswith('openrouter/'):
            final_model = f'openrouter/{final_model}'
    elif provider == 'deepseek':
        # DeepSeek需要特定前缀
        if final_model and '/' not in final_model:
            final_model = f'deepseek/{final_model}'
    elif provider == 'claude':
        # Claude模型通常不需要前缀
        pass
    elif provider == 'custom':
        # 自定义提供商，保持原样
        pass
    # OpenAI模型通常不需要前缀
    
    return final_model

def is_yes_or_no_question(question: str, key: str, provider: str = None, model: str = None):
    """判断是否为是/否问题 - 只使用大模型判断"""
    final_model = setup_litellm(provider, model, key)
    
    # 尝试使用logit_bias（仅对OpenAI模型有效）
    extra_params = {}
    if provider == 'openai' or final_model.startswith('gpt'):
        extra_params['logit_bias'] = {
            9642: 100,  # Yes
            2822: 100   # No
        }
    
    response = litellm.completion(
        model=final_model,
        messages=[
            {'role': 'system', 'content': 'You answer with a simple "yes" or "no".'},
            {'role': 'system', 'content': 'Your role is to assess whether the question presented by the user is a yes/no question from a linguistic perspective.'},
            {'role': 'system', 'content': 'You are not expected to answer the question itself, nor assess how difficult might it be to answer.'},
            {'role': 'system', 'content': '[Example 1] User: Is 3 < 2?; You: Yes'},
            {'role': 'system', 'content': '[Example 2] User: What time is it?; You: No'},
            {'role': 'system', 'content': '[Example 3] User: Should I buy new shoes?; You: Yes'},
            {'role': 'system', 'content': '[Example 4] User: Is love more important than science?; You: Yes'},
            {'role': 'system', 'content': '[Example 5] User: What is the meaning of life?; You: No'},
            {'role': 'system', 'content': '[Example 6] User: 1=1是否等于2?; You: Yes'},
            {'role': 'system', 'content': '[Example 7] User: 1=1=3; You: Yes'},
            {'role': 'system', 'content': '[Example 8] User: 2+2=5; You: Yes'},
            {'role': 'user', 'content': question},
        ],
        max_tokens=1,
        temperature=0,
        **extra_params
    )

    content = response.choices[0].message.content.strip()

    if content == 'Yes':
        return True
    elif content == 'No':
        return False
    else:
        # 如果不是标准的Yes/No回答，默认为开放性问题
        print(f'Invalid question annotation response: {content}, 默认为开放性问题')
        return False

def get_system_prompt(personality: str):
    """获取系统提示词 - 使用配置文件中的人格提示词"""
    return get_personality_prompt(personality)

def get_structured_answer(question: str, personality: str, is_yes_or_no: bool, key: str, provider: str = None, model: str = None):
    """根据问题类型获取结构化或自然语言回答"""
    final_model = setup_litellm(provider, model, key)
    
    try:
        # 构建系统消息，明确告知问题类型
        base_prompt = get_system_prompt(personality)
        if is_yes_or_no:
            system_message = f"{base_prompt}\n\n重要提示：这是一个是非题，请按照JSON格式输出。"
        else:
            system_message = f"{base_prompt}\n\n重要提示：这是一个开放性问题，请直接输出自然语言回答。"
        
        # 添加调试信息
        print(f"使用提供商: {provider}, 模型: {final_model}")
        print(f"问题类型: {'是非题' if is_yes_or_no else '开放性问题'}")
        
        response = litellm.completion(
            model=final_model,
            messages=[
                {'role': 'system', 'content': system_message},
                {'role': 'user', 'content': question},
            ],
            temperature=0.7
        )

        return response.choices[0].message.content

    except Exception as e:
        error_msg = str(e)
        
        # 提供更友好的错误信息
        if "LLM Provider NOT provided" in error_msg:
            return f"模型配置错误：无法识别模型 '{final_model}'。\n\n请检查模型名称格式：\n- OpenAI: gpt-4, gpt-3.5-turbo\n- DeepSeek: deepseek-chat, deepseek-coder\n- OpenRouter: anthropic/claude-3.5-sonnet\n- 自定义: 请确保模型名称正确且API兼容"
        elif "api_key" in error_msg.lower():
            return f"API密钥错误：请检查 {provider} 的API密钥是否正确"
        elif "rate limit" in error_msg.lower():
            return f"请求频率限制：请稍后再试"
        else:
            return f"获取回答时出错: {error_msg}"


def parse_structured_response(response_content: str, is_yes_or_no: bool):
    """解析结构化响应"""
    if not is_yes_or_no:
        # 开放性问题直接返回文本
        return response_content, {'status': 'info', 'conditions': None}
    
    # 清理响应内容，移除markdown代码块标记
    cleaned_content = response_content.strip()
    
    # 移除markdown代码块标记
    if cleaned_content.startswith('```json'):
        cleaned_content = cleaned_content[7:]  # 移除 ```json
    elif cleaned_content.startswith('```'):
        cleaned_content = cleaned_content[3:]   # 移除 ```
    
    if cleaned_content.endswith('```'):
        cleaned_content = cleaned_content[:-3]  # 移除结尾的 ```
    
    cleaned_content = cleaned_content.strip()
    
    try:
        # 尝试解析JSON
        result = json.loads(cleaned_content)
        answer = result.get("answer", response_content)
        classification = result.get("classification", {'status': 'info', 'conditions': None})
        
        print(f"✅ JSON解析成功")
        print(f"   回答: {answer[:50]}{'...' if len(str(answer)) > 50 else ''}")
        print(f"   分类状态: {classification.get('status', 'unknown')}")
        
        return answer, classification
    except (json.JSONDecodeError, KeyError) as e:
        print(f"❌ JSON解析失败: {e}")
        print(f"   原始内容: {response_content[:100]}{'...' if len(response_content) > 100 else ''}")
        print(f"   清理后内容: {cleaned_content[:100]}{'...' if len(cleaned_content) > 100 else ''}")
        # 如果JSON解析失败，返回原始内容和默认分类
        return response_content, {'status': 'info', 'conditions': None}

