import { AIProvider, AIResponse, MagiQuestion } from '../../types/ai';
import { ConfigStorageService } from '../storage/configStorage';

/**
 * AI服务类 - 统一多AI提供商接口
 * 基于原项目的 window.AiService 重新实现为 TypeScript 版本
 */
export class AIService {
  /**
   * 判断问题是否为是非题
   */
  static async isYesNoQuestion(question: MagiQuestion, yesNoPrompt: string): Promise<boolean> {
    const configResult = ConfigStorageService.getUserConfig();
    if (!configResult.success || !configResult.data || !configResult.data.apiKey) {
      throw new Error('API key not configured');
    }

    const config = configResult.data;
    const { provider, model, apiKey, apiBase } = config;
    const apiUrl = this.getApiUrl(provider, apiBase);
    
    console.log(`使用API端点: ${apiUrl} (提供商: ${provider})`);

    const messages = [
      { role: 'system', content: yesNoPrompt },
      { role: 'user', content: question.query }
    ];

    const requestBody = {
      model: model,
      messages: messages,
      max_tokens: 1
    };
    
    console.log('Request (isYesNoQuestion):', requestBody);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error (isYesNoQuestion):', errorData);
        return false; // Default to not a yes/no question on error
      }

      const data = await response.json();
      console.log('Original response (isYesNoQuestion):', data);
      const result = data.choices[0].message.content.trim().toLowerCase();
      return result === 'yes';

    } catch (error) {
      console.error('Fetch Error (isYesNoQuestion):', error);
      return false;
    }
  }

  /**
   * 获取MAGI三贤者的回答
   */
  static async fetchMagiAnswers(
    question: MagiQuestion, 
    personalities: string[], 
    isYesNo: boolean
  ): Promise<AIResponse[]> {
    const configResult = ConfigStorageService.getUserConfig();
    if (!configResult.success || !configResult.data || !configResult.data.apiKey) {
      throw new Error('API key not configured');
    }

    const config = configResult.data;
    const { provider, model, apiKey, apiBase } = config;
    const apiUrl = this.getApiUrl(provider, apiBase);
    
    console.log(`使用API端点: ${apiUrl} (提供商: ${provider})`);

    /**
     * 获取单个贤者的回答
     */
    const fetchAnswer = async (personality: string): Promise<AIResponse> => {
      const userContent = isYesNo
        ? `问题类型：是非题。\n\n${question.query}`
        : `问题类型：开放题。\n\n${question.query}`;

      const messages = [
        { role: 'system', content: personality },
        { role: 'user', content: userContent }
      ];

      const requestBody = {
        model: model,
        messages: messages
      };
      
      console.log('Request (fetchMagiAnswers):', requestBody);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          return { 
            id: question.id, 
            response: `API Error: ${errorData.error?.message || 'Unknown error'}`, 
            status: 'error' 
          };
        }

        const data = await response.json();
        console.log('Original response (fetchMagiAnswers):', data);
        const wiseManResponse = data.choices[0].message.content;

        if (isYesNo) {
          // 处理是非题的JSON响应
          let jsonString = wiseManResponse.trim();
          if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
          } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.substring(3, jsonString.length - 3).trim();
          }

          let parsedResponse;
          try {
            // 预处理并尝试解析JSON
            const processedJsonString = this.preprocessJsonString(jsonString);
            console.log('处理后的JSON字符串:', processedJsonString);
            parsedResponse = JSON.parse(processedJsonString);
          } catch (e) {
            // 如果仍然失败，尝试更激进的修复
            try {
              console.warn('标准JSON解析失败，尝试提取关键信息:', e);
              
              // 使用正则表达式提取关键信息
              const answerMatch = jsonString.match(/"answer"\s*:\s*"([^"]+)"/);
              const statusMatch = jsonString.match(/"status"\s*:\s*"([^"]+)"/);
              
              if (answerMatch && statusMatch) {
                parsedResponse = {
                  answer: answerMatch[1].replace(/\\"/g, '"'),
                  classification: {
                    status: statusMatch[1]
                  }
                };
                console.log('通过正则提取成功:', parsedResponse);
              } else {
                throw new Error("无法提取关键信息");
              }
            } catch (innerError) {
              console.warn('JSON解析完全失败，将原始文本作为错误信息处理:', innerError);
              return { 
                id: question.id, 
                response: wiseManResponse, 
                status: 'error', 
                error: 'Invalid JSON format' 
              };
            }
          }

          // 验证解析后的结构
          if (parsedResponse && parsedResponse.answer && parsedResponse.classification && parsedResponse.classification.status) {
            return {
              id: question.id,
              response: parsedResponse.answer,
              status: parsedResponse.classification.status,
              conditions: parsedResponse.classification.conditions || [],
              error: null
            };
          } else {
            console.warn('JSON结构不完整，将原始文本作为信息处理:', wiseManResponse);
            return { 
              id: question.id, 
              response: wiseManResponse, 
              status: 'info', 
              error: 'Incomplete JSON structure' 
            };
          }
        } else {
          // 开放性问题直接返回
          return {
            id: question.id,
            response: wiseManResponse,
            status: 'info',
            error: null
          };
        }

      } catch (error) {
        console.error('Fetch Error:', error);
        return { 
          id: question.id, 
          response: `Fetch Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          status: 'error' 
        };
      }
    };

    // 并行获取所有贤者的回答
    const promises = personalities.map(p => fetchAnswer(p));
    return Promise.all(promises);
  }

  /**
   * 获取API URL
   */
  private static getApiUrl(provider: AIProvider, apiBase?: string): string {
    // 如果用户提供了自定义API基础URL，优先使用
    if (apiBase) {
      return apiBase;
    }

    // 否则根据提供商选择默认URL
    switch (provider) {
      case 'deepseek':
        return 'https://api.deepseek.com/v1/chat/completions';
      case 'openai':
        return 'https://api.openai.com/v1/chat/completions';
      case 'anthropic':
        return 'https://api.anthropic.com/v1/messages';
      case 'google':
        return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
      case 'zhipu':
        return 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
      case 'moonshot':
        return 'https://api.moonshot.cn/v1/chat/completions';
      case 'alibaba':
        return 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
      case 'baidu':
        return 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
      case 'cohere':
        return 'https://api.cohere.ai/v1/chat';
      case 'openrouter':
      default:
        return 'https://openrouter.ai/api/v1/chat/completions';
    }
  }

  /**
   * 预处理JSON字符串，修复常见格式错误
   */
  private static preprocessJsonString(jsonStr: string): string {
    // 修复多余的引号问题（如 ""classification" 变为 "classification"）
    jsonStr = jsonStr.replace(/"+/g, '"');
    
    // 修复缺少引号的键
    jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    
    // 修复常见的转义问题
    jsonStr = jsonStr.replace(/\\+([^"\\])/g, '\\$1');
    
    return jsonStr;
  }
}

export default AIService;