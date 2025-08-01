import React from 'react';

const HistoryModal = ({ id, is_open, question, answer, setProps }) => {
    const [expandedAnswers, setExpandedAnswers] = React.useState({});

    const handleClose = () => {
        if (setProps) {
            setProps({ is_open: false });
        }
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };

    const toggleAnswerExpand = (index) => {
        setExpandedAnswers(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // 文本截断函数
    const truncateText = (text, maxLength = 200) => {
        if (!text || typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // 使用统一工具库函数，增强错误处理
    const formatTimestamp = window.HistoryUtils?.formatTimestamp || ((timestamp) => {
        try {
            if (!timestamp) return '未知时间';
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '无效时间';
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('时间格式化错误:', error);
            return '格式化失败';
        }
    });

    const getStatusText = window.HistoryUtils?.getStatusText || ((status) => {
        const statusMap = {
            'yes': '可 決',
            'no': '否 決', 
            'conditional': '状 態',
            'info': '情 報',
            'error': '誤 差',
            'standby': '待 機',
            'progress': '審議中'
        };
        return statusMap[status] || '未知状态';
    });

    const getWiseManName = window.HistoryUtils?.getWiseManName || ((name) => {
        const nameMap = {
            'melchior': 'MELCHIOR-1 (科學家)',
            'balthasar': 'MELCHIOR-1 (母親)',
            'casper': 'CASPER-3 (女人)'
        };
        return nameMap[name] || (name ? name.toUpperCase() : '未知贤者');
    });

    // 键盘事件监听
    React.useEffect(() => {
        if (is_open) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [is_open]);

    // 边界情况处理
    if (!is_open) {
        return null;
    }

    // 数据验证
    const hasValidQuestion = question && typeof question === 'object';
    const hasValidAnswer = answer && typeof answer === 'object';
    const hasValidAnswers = hasValidAnswer && Array.isArray(answer.answers) && answer.answers.length > 0;

    return React.createElement('div', {
        id: id,
        className: 'modal-content history-modal-content',
        onClick: handleBackgroundClick
    }, [
        React.createElement('div', {
            key: 'modal-inner',
            className: 'modal-inner',
            onClick: (e) => e.stopPropagation()
        }, [
            React.createElement('div', {
                key: 'header',
                className: 'modal-header'
            }, [
                React.createElement('div', {
                    key: 'title',
                    className: 'modal-title'
                }, '📚 历史记录详情'),
                React.createElement('div', {
                    key: 'close',
                    className: 'close',
                    onClick: handleClose,
                    title: 'ESC键也可关闭'
                }, '×')
            ]),
            
            React.createElement('div', {
                key: 'body',
                className: 'modal-body history-modal-body'
            }, [
                // 问题信息
                React.createElement('div', {
                    key: 'question-section',
                    className: 'history-section'
                }, [
                    React.createElement('div', {
                        key: 'question-title',
                        className: 'section-title'
                    }, '問題:'),
                    React.createElement('div', {
                        key: 'question-content',
                        className: 'section-content'
                    }, hasValidQuestion ? (question.query || '无问题内容') : '数据加载失败'),
                    React.createElement('div', {
                        key: 'question-time',
                        className: 'question-time'
                    }, `時間: ${hasValidQuestion ? formatTimestamp(question.timestamp) : '未知'}`)
                ]),
                
                // 最终决策
                React.createElement('div', {
                    key: 'decision-section',
                    className: 'history-section'
                }, [
                    React.createElement('div', {
                        key: 'decision-title',
                        className: 'section-title'
                    }, '最終決策:'),
                    React.createElement('div', {
                        key: 'decision-status',
                        className: `decision-status status-${hasValidAnswer ? (answer.finalStatus || 'info') : 'error'}`
                    }, hasValidAnswer ? getStatusText(answer.finalStatus || 'info') : '数据缺失')
                ]),
                
                // 贤者回答
                React.createElement('div', {
                    key: 'answers-section',
                    className: 'history-section'
                }, [
                    React.createElement('div', {
                        key: 'answers-title',
                        className: 'section-title'
                    }, '賢者回答:'),
                    React.createElement('div', {
                        key: 'answers-list',
                        className: 'answers-list'
                    }, hasValidAnswers ? answer.answers.map((ans, index) => {
                        const answerText = ans.response || '无回答';
                        const isExpanded = expandedAnswers[index];
                        const shouldTruncate = answerText.length > 200;
                        const displayText = shouldTruncate && !isExpanded ? 
                            truncateText(answerText, 200) : answerText;
                        
                        return React.createElement('div', {
                            key: `answer-${index}`,
                            className: 'wise-answer-item'
                        }, [
                            React.createElement('div', {
                                key: 'wise-header',
                                className: 'wise-header'
                            }, [
                                React.createElement('div', {
                                    key: 'wise-name',
                                    className: 'wise-name'
                                }, getWiseManName(ans.name)),
                                React.createElement('div', {
                                    key: 'wise-status',
                                    className: `wise-status status-${ans.status || 'info'}`
                                }, getStatusText(ans.status || 'info'))
                            ]),
                            React.createElement('div', {
                                key: 'wise-response',
                                className: 'wise-response'
                            }, displayText),
                            // 条件回答显示
                            ans.status === 'conditional' && ans.conditions && Array.isArray(ans.conditions) && ans.conditions.length > 0 ? 
                                React.createElement('div', {
                                    key: 'wise-conditions',
                                    className: 'wise-conditions'
                                }, [
                                    React.createElement('div', {
                                        key: 'conditions-title',
                                        className: 'conditions-title'
                                    }, '附加条件:'),
                                    React.createElement('ul', {
                                        key: 'conditions-list',
                                        className: 'conditions-list'
                                    }, ans.conditions.map((condition, condIndex) => 
                                        React.createElement('li', {
                                            key: condIndex,
                                            className: 'condition-item'
                                        }, condition)
                                    ))
                                ]) : null,
                            // 展开/收起按钮
                            shouldTruncate ? React.createElement('button', {
                                key: 'expand-btn',
                                className: 'expand-btn',
                                onClick: () => toggleAnswerExpand(index)
                            }, isExpanded ? '收起 ▲' : '展开更多 ▼') : null
                        ]);
                    }) : [
                        React.createElement('div', {
                            key: 'no-answers',
                            className: 'no-answers'
                        }, '暂无贤者回答数据')
                    ])
                ])
            ]),
            
            // 底部关闭按钮
            React.createElement('div', {
                key: 'footer',
                className: 'modal-footer'
            }, [
                React.createElement('button', {
                    key: 'close-btn',
                    className: 'modal-close-btn',
                    onClick: handleClose
                }, '关闭')
            ])
        ])
    ]);
};

// 使用单一导出方式
export default HistoryModal;
