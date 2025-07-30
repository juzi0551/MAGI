import React from 'react';

const HistoryPanel = ({ id, records = [], setProps }) => {
    // 使用React.useState代替解构导入，默认为收缩状态
    const [collapsed, setCollapsed] = React.useState(true);
    
    // 切换折叠状态
    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };
    
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

    const getStatusClass = window.StatusUtils.getStatusClass;

    const handleItemClick = (record, event) => {
        event.stopPropagation();
        
        if (setProps) {
            // 添加时间戳确保每次点击都是唯一的，避免Dash不触发回调
            const recordWithTimestamp = {
                ...record,
                _clickTimestamp: Date.now()
            };
            setProps({ onRecordDetail: recordWithTimestamp });
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
        className: `history-panel ${collapsed ? 'collapsed' : ''}`
    }, [
        React.createElement('div', {
            key: 'header',
            className: 'history-header',
            onClick: toggleCollapse // 点击整个标题栏可以切换折叠状态
        }, [
            // 左侧区域：箭头和标题
            React.createElement('div', {
                key: 'left-section',
                className: 'header-left-section',
                onClick: toggleCollapse // 点击左侧区域（包括标题）可以切换折叠状态
            }, [
                // 折叠/展开按钮放在标题左侧
                React.createElement('button', {
                    key: 'toggle-btn',
                    className: 'toggle-history-btn',
                    onClick: (e) => {
                        e.stopPropagation(); // 防止事件冒泡
                        toggleCollapse();
                    }
                }, collapsed ? '▲' : '▼'),
                React.createElement('span', {
                    key: 'title',
                    className: 'history-title'
                }, '📚 履歴')
            ]),
            // 右侧区域：清空按钮
            React.createElement('button', {
                key: 'clear-btn',
                className: 'clear-history-btn',
                onClick: (e) => {
                    e.stopPropagation(); // 防止事件冒泡到标题栏
                    handleClearHistory();
                }
            }, '清空')
        ]),
        
        // 只在非折叠状态下显示列表内容
        !collapsed && React.createElement('div', {
            key: 'list',
            className: 'history-list'
        }, records.length === 0 ? 
            React.createElement('div', {
                className: 'no-history'
            }, '暫 無') :
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
                    }, `問題: ${record.question}`)
                ])
            )
        )
    ]);
};

export default HistoryPanel;