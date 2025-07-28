import React from 'react';

const HistoryPanel = ({ id, records = [], setProps }) => {
    // 使用统一的工具库
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

    const getStatusClass = window.StatusUtils?.getStatusClass || ((status) => {
        return `status-tag status-${status}`;
    });

    const handleItemClick = (record, event) => {
        event.stopPropagation();
        
        if (setProps) {
            setProps({ onRecordDetail: record });
        }
    };

    const handleReaskClick = (record, event) => {
        event.stopPropagation();
        
        if (setProps) {
            setProps({ onQuestionSelect: record.question });
        }
    };

    const handleClearHistory = () => {
        if (window.confirm('确定要清空所有历史记录吗？')) {
            if (setProps) {
                setProps({ onClearHistory: true });
            }
        }
    };

    return React.createElement('div', {
        id: id,
        className: 'history-panel'
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'history-header'
        }, [
            React.createElement('span', {
                key: 'title',
                className: 'history-title'
            }, '📚 問題履歴'),
            React.createElement('button', {
                key: 'clear-btn',
                className: 'clear-history-btn',
                onClick: handleClearHistory,
                title: '清空历史记录'
            }, '清空')
        ]),
        
        React.createElement('div', {
            key: 'list',
            className: 'history-list'
        }, records.length === 0 ? 
            React.createElement('div', {
                className: 'no-history'
            }, '暂无历史记录') :
            records.slice().reverse().map((record) => 
                React.createElement('div', {
                    key: record.id,
                    className: 'history-item',
                    onClick: (e) => handleItemClick(record, e),
                    title: '点击查看详情'
                }, [
                    React.createElement('div', {
                        key: 'item-header',
                        className: 'history-item-header'
                    }, [
                        React.createElement('span', {
                            key: 'time',
                            className: 'history-time'
                        }, `🕐 ${formatTimestamp(record.timestamp)}`),
                        React.createElement('span', {
                            key: 'status',
                            className: getStatusClass(record.finalStatus)
                        }, getStatusText(record.finalStatus))
                    ]),
                    React.createElement('div', {
                        key: 'question',
                        className: 'history-question'
                    }, `問題: ${record.question}`),
                    React.createElement('div', {
                        key: 'actions',
                        className: 'history-actions'
                    }, [
                        React.createElement('button', {
                            key: 'reask-btn',
                            className: 'reask-btn',
                            onClick: (e) => handleReaskClick(record, e),
                            title: '重新提问'
                        }, '🔄')
                    ])
                ])
            )
        )
    ]);
};

export default HistoryPanel;