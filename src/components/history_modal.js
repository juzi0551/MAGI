const HistoryModal = ({ id, is_open, question, answer, setProps }) => {
    const handleClose = () => {
        if (setProps) {
            setProps({ is_open: false });
        }
    };

    // 使用共享工具函数，如果不可用则使用本地备份
    const formatTimestamp = window.HistoryUtils?.formatTimestamp || ((timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
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
        return statusMap[status] || '待 機';
    });

    const getWiseManName = window.HistoryUtils?.getWiseManName || ((name) => {
        const nameMap = {
            'melchior': 'MELCHIOR-1 (科学家)',
            'balthasar': 'BALTHASAR-2 (母亲)',
            'casper': 'CASPER-3 (女人)'
        };
        return nameMap[name] || name.toUpperCase();
    });

    if (!is_open) {
        return null;
    }

    return React.createElement('div', {
        id: id,
        className: 'modal history-modal',
        style: { display: is_open ? 'block' : 'none' }
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
                onClick: handleClose
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
                }, question?.query || ''),
                React.createElement('div', {
                    key: 'question-time',
                    className: 'question-time'
                }, `時間: ${question?.timestamp ? formatTimestamp(question.timestamp) : ''}`)
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
                    className: `decision-status status-${answer?.finalStatus || 'info'}`
                }, getStatusText(answer?.finalStatus || 'info'))
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
                }, (answer?.answers || []).map((ans, index) => 
                    React.createElement('div', {
                        key: `answer-${index}`,
                        className: 'wise-answer-item'
                    }, [
                        React.createElement('div', {
                            key: 'wise-name',
                            className: 'wise-name'
                        }, getWiseManName(ans.name)),
                        React.createElement('div', {
                            key: 'wise-status',
                            className: `wise-status status-${ans.status}`
                        }, getStatusText(ans.status)),
                        React.createElement('div', {
                            key: 'wise-response',
                            className: 'wise-response'
                        }, ans.response || '无回答')
                    ])
                ))
            ])
        ])
    ]);
};

// 导出组件
window.dash_clientside = window.dash_clientside || {};
window.dash_clientside.history_modal = HistoryModal;

// 添加默认导出以兼容ES6模块导入
const HistoryModalDefault = HistoryModal;
export default HistoryModalDefault;
