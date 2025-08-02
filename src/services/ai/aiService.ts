import { AIProvider, AIResponse, MagiQuestion, PersonalityId } from '../../types/ai';
import { ConfigStorageService } from '../storage/configStorage';
import { getPersonalityFullName } from '../../utils/personalityUtils';

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
    
    console.log('🤖 开始问题类型判断');
    console.log('📋 请求配置:', {
      provider,
      model,
      apiUrl,
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'undefined',
      apiBase: apiBase || '默认'
    });
    console.log('❓ 判断问题:', question.query);

    const messages = [
      { role: 'system', content: yesNoPrompt },
      { role: 'user', content: question.query }
    ];

    const requestBody = {
      model: model,
      messages: messages,
      max_tokens: 1
    };
    
    console.log('📤 发送请求 (isYesNoQuestion):', JSON.stringify(requestBody, null, 2));

    try {
      const startTime = Date.now();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      const endTime = Date.now();
      console.log(`⏱️ 请求耗时: ${endTime - startTime}ms`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API错误 (isYesNoQuestion):', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return false; // Default to not a yes/no question on error
      }

      const data = await response.json();
      console.log('📥 原始响应 (isYesNoQuestion):', JSON.stringify(data, null, 2));
      
      const result = data.choices[0].message.content.trim().toLowerCase();
      const isYesNo = result === 'yes';
      
      console.log(`✅ 问题类型判断结果: ${isYesNo ? '是非题' : '开放题'} (原始回答: "${result}")`);
      return isYesNo;

    } catch (error) {
      console.error('💥 请求失败 (isYesNoQuestion):', error);
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
    
    console.log('🧠 开始MAGI三贤者并行查询');
    console.log('📋 查询配置:', {
      provider,
      model,
      apiUrl,
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'undefined',
      questionType: isYesNo ? '是非题' : '开放题',
      personalitiesCount: personalities.length
    });

    /**
     * 获取单个贤者的回答
     */
    const fetchAnswer = async (personality: string, index: number): Promise<AIResponse> => {
      // 获取人格配置
      const configResult = ConfigStorageService.getUserConfig();
      const userConfig = configResult.success ? configResult.data : undefined;
      const personalities = userConfig?.personalities;
      
      // 定义人格ID映射
      const personalityIds: PersonalityId[] = ['melchior', 'balthasar', 'casper'];
      const personalityId = personalityIds[index];
      
      // 动态获取人格名称
      const personalityName = personalityId 
        ? getPersonalityFullName(personalityId, personalities)
        : `贤者-${index + 1}`;
      
      console.log(`🎯 开始查询 ${personalityName}`);
      
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
      
      console.log(`📤 发送请求给 ${personalityName}:`, {
        model: requestBody.model,
        messagesCount: requestBody.messages.length,
        systemPromptLength: personality.length,
        userContent: userContent.substring(0, 100) + (userContent.length > 100 ? '...' : '')
      });

      try {
        const startTime = Date.now();
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        const endTime = Date.now();
        console.log(`⏱️ ${personalityName} 请求耗时: ${endTime - startTime}ms`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`❌ ${personalityName} API错误:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          return { 
            id: question.id, 
            response: `API Error: ${errorData.error?.message || 'Unknown error'}`, 
            status: 'error' 
          };
        }

        const data = await response.json();
        console.log(`📥 ${personalityName} 原始响应:`, JSON.stringify(data, null, 2));
        
        const wiseManResponse = data.choices[0].message.content;
        console.log(`💭 ${personalityName} 回答内容:`, wiseManResponse.substring(0, 200) + (wiseManResponse.length > 200 ? '...' : ''));

        if (isYesNo) {
          // 处理是非题的JSON响应
          let jsonString = wiseManResponse.trim();
          if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
          } else if (jsonString.startsWith('```')) {
            jsonString = jsonString.substring(3, jsonString.length - 3).trim();
          }

          console.log(`🔍 ${personalityName} 提取的JSON字符串:`, jsonString);

          let parsedResponse;
          try {
            // 预处理并尝试解析JSON
            const processedJsonString = this.preprocessJsonString(jsonString);
            console.log(`🔧 ${personalityName} 处理后的JSON:`, processedJsonString);
            parsedResponse = JSON.parse(processedJsonString);
            console.log(`✅ ${personalityName} JSON解析成功:`, parsedResponse);
          } catch (e) {
            // 如果仍然失败，尝试更激进的修复
            try {
              console.warn(`⚠️ ${personalityName} 标准JSON解析失败，尝试提取关键信息:`, e);
              
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
                console.log(`🔄 ${personalityName} 通过正则提取成功:`, parsedResponse);
              } else {
                throw new Error("无法提取关键信息");
              }
            } catch (innerError) {
              console.error(`💥 ${personalityName} JSON解析完全失败:`, innerError);
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
            const result = {
              id: question.id,
              response: parsedResponse.answer,
              status: parsedResponse.classification.status,
              conditions: parsedResponse.classification.conditions || [],
              error: null
            };
            console.log(`🎉 ${personalityName} 处理完成:`, {
              status: result.status,
              responseLength: result.response.length,
              conditionsCount: result.conditions.length
            });
            return result;
          } else {
            console.warn(`⚠️ ${personalityName} JSON结构不完整:`, parsedResponse);
            return { 
              id: question.id, 
              response: wiseManResponse, 
              status: 'info', 
              error: 'Incomplete JSON structure' 
            };
          }
        } else {
          // 开放性问题直接返回
          const result = {
            id: question.id,
            response: wiseManResponse,
            status: 'info',
            error: null
          };
          console.log(`🎉 ${personalityName} (开放题) 处理完成:`, {
            responseLength: result.response.length
          });
          return result;
        }

      } catch (error) {
        console.error(`💥 ${personalityName} 请求失败:`, error);
        return { 
          id: question.id, 
          response: `Fetch Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          status: 'error' 
        };
      }
    };

    // 并行获取所有贤者的回答
    console.log('🚀 开始并行查询三贤者...');
    const startTime = Date.now();
    
    const promises = personalities.map((p, index) => fetchAnswer(p, index));
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    console.log(`⏱️ 所有贤者查询完成，总耗时: ${endTime - startTime}ms`);
    
    // 统计结果
    const statusCounts = results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 贤者回答统计:', statusCounts);
    console.log('✅ MAGI三贤者查询全部完成');
    
    return results;
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