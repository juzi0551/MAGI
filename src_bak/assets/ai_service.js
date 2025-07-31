window.AiService = {
    isYesNoQuestion: async function(question, yesNoPrompt) {
        const config = window.ConfigStorage.getUserConfig();
        if (!config || !config.apiKey) {
            throw new Error('API key not configured');
        }

        const { provider, model, apiKey, apiBase } = config;
        let apiUrl;
        
        // 根据不同的提供商设置不同的API URL
        if (apiBase) {
            // 如果用户提供了自定义API基础URL，优先使用
            apiUrl = apiBase;
        } else {
            // 否则根据提供商选择默认URL
            switch (provider) {
                case 'deepseek':
                    apiUrl = 'https://api.deepseek.com/v1/chat/completions';
                    break;
                case 'openai':
                    apiUrl = 'https://api.openai.com/v1/chat/completions';
                    break;
                case 'anthropic':
                    apiUrl = 'https://api.anthropic.com/v1/messages';
                    break;
                case 'google':
                    apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
                    break;
                case 'zhipu':
                    apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
                    break;
                case 'moonshot':
                    apiUrl = 'https://api.moonshot.cn/v1/chat/completions';
                    break;
                case 'alibaba':
                    apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
                    break;
                case 'baidu':
                    apiUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
                    break;
                case 'openrouter':
                default:
                    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                    break;
            }
        }
        
        console.log(`使用API端点: ${apiUrl} (提供商: ${provider})`);
        
        // 如果是DeepSeek且没有自定义API基础URL，则使用DeepSeek的API端点
        if (provider === 'deepseek' && !apiBase) {
            apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        }

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
    },

    fetchMagiAnswers: async function(question, personalities, isYesNo) {
        const config = window.ConfigStorage.getUserConfig();
        if (!config || !config.apiKey) {
            alert('请先在“设置”中配置您的 API 密钥。');
            throw new Error('API key not configured');
        }

        const { provider, model, apiKey, apiBase } = config;
        let apiUrl;
        
        // 根据不同的提供商设置不同的API URL
        if (apiBase) {
            // 如果用户提供了自定义API基础URL，优先使用
            apiUrl = apiBase;
        } else {
            // 否则根据提供商选择默认URL
            switch (provider) {
                case 'deepseek':
                    apiUrl = 'https://api.deepseek.com/v1/chat/completions';
                    break;
                case 'openai':
                    apiUrl = 'https://api.openai.com/v1/chat/completions';
                    break;
                case 'anthropic':
                    apiUrl = 'https://api.anthropic.com/v1/messages';
                    break;
                case 'google':
                    apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
                    break;
                case 'zhipu':
                    apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
                    break;
                case 'moonshot':
                    apiUrl = 'https://api.moonshot.cn/v1/chat/completions';
                    break;
                case 'alibaba':
                    apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
                    break;
                case 'baidu':
                    apiUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions';
                    break;
                case 'openrouter':
                default:
                    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                    break;
            }
        }
        
        console.log(`使用API端点: ${apiUrl} (提供商: ${provider})`);

        const fetchAnswer = async (personality) => {
            const userContent = isYesNo
                ? `问题类型：是非题。

${question.query}`
                : `问题类型：开放题。

${question.query}`;

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
                    return { id: question.id, response: `API Error: ${errorData.error.message}`, status: 'error' };
                }

                const data = await response.json();
                console.log('Original response (fetchMagiAnswers):', data);
                const wiseManResponse = data.choices[0].message.content;

                if (isYesNo) {
                    let jsonString = wiseManResponse.trim();
                    if (jsonString.startsWith('```json')) {
                        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
                    } else if (jsonString.startsWith('```')) {
                        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
                    }

                    // 预处理JSON字符串，修复常见格式错误
                    function preprocessJsonString(jsonStr) {
                        // 修复多余的引号问题（如 ""classification" 变为 "classification"）
                        jsonStr = jsonStr.replace(/""+/g, '"');
                        
                        // 修复缺少引号的键
                        jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
                        
                        // 修复常见的转义问题
                        jsonStr = jsonStr.replace(/\\+([^"\\])/g, '\\$1');
                        
                        return jsonStr;
                    }

                    let parsedResponse;
                    try {
                        // 预处理并尝试解析JSON
                        const processedJsonString = preprocessJsonString(jsonString);
                        console.log('处理后的JSON字符串:', processedJsonString);
                        parsedResponse = JSON.parse(processedJsonString);
                    } catch (e) {
                        // 如果仍然失败，尝试更激进的修复
                        try {
                            console.warn('标准JSON解析失败，尝试提取关键信息:', e.message);
                            
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
                            console.warn('JSON解析完全失败，将原始文本作为错误信息处理:', innerError.message);
                            return { id: question.id, response: wiseManResponse, status: 'error', error: 'Invalid JSON format' };
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
                        return { id: question.id, response: wiseManResponse, status: 'info', error: 'Incomplete JSON structure' };
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
                return { id: question.id, response: `Fetch Error: ${error.message}`, status: 'error' };
            }
        };

        const promises = personalities.map(p => fetchAnswer(p));
        return Promise.all(promises);
    }
};