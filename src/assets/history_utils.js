// 历史记录相关的共享工具函数
const HistoryUtils = {
    // 格式化时间戳
    formatTimestamp: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    // 获取状态文本
    getStatusText: (status) => {
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
    },

    // 获取贤者名称
    getWiseManName: (name) => {
        const nameMap = {
            'melchior': 'MELCHIOR-1 (科学家)',
            'balthasar': 'BALTHASAR-2 (母亲)',
            'casper': 'CASPER-3 (女人)'
        };
        return nameMap[name] || name.toUpperCase();
    }
};

// 导出到全局作用域
window.HistoryUtils = HistoryUtils;