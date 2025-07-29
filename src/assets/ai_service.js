window.AiService = {
    isYesNoQuestion: async function(question, yesNoPrompt) {
        const config = window.ConfigStorage.getUserConfig();
        if (!config || !config.apiKey) {
            throw new Error('API key not configured');
        }

        const { provider, model, apiKey, apiBase } = config;
        let apiUrl = apiBase || 'https://openrouter.ai/api/v1/chat/completions'; // Default to openrouter

        const messages = [
            { role: 'system', content: yesNoPrompt },
            { role: 'user', content: question.query }
        ];

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: 1
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error (isYesNoQuestion):', errorData);
                return false; // Default to not a yes/no question on error
            }

            const data = await response.json();
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
        let apiUrl = apiBase || 'https://openrouter.ai/api/v1/chat/completions'; // Default to openrouter

        const fetchAnswer = async (personality) => {
            const systemPrompt = isYesNo 
                ? `${personality}\n\n重要提示：这是一个是非题，请按照JSON格式输出。`
                : `${personality}\n\n重要提示：这是一个开放性问题，请直接输出自然语言回答。`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question.query }
            ];

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: messages
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    return { id: question.id, response: `API Error: ${errorData.error.message}`, status: 'error' };
                }

                const data = await response.json();
                const wiseManResponse = data.choices[0].message.content;

                if (isYesNo) {
                    let jsonString = wiseManResponse.trim();
                    if (jsonString.startsWith('```json')) {
                        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
                    } else if (jsonString.startsWith('```')) {
                        jsonString = jsonString.substring(3, jsonString.length - 3).trim();
                    }

                    let parsedResponse;
                    try {
                        // 尝试解析JSON
                        parsedResponse = JSON.parse(jsonString);
                    } catch (e) {
                        console.warn('JSON解析失败，将原始文本作为错误信息处理:', wiseManResponse);
                        return { id: question.id, response: wiseManResponse, status: 'error', error: 'Invalid JSON format' };
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