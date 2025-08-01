// MAGI系统统一工具库
// 包含状态处理、历史记录管理等共享功能
const StatusUtils = {
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

    // 获取状态颜色（用于Response组件）
    getStatusColor: (status) => {
        const colorMap = {
            'yes': '#52e691',
            'no': '#a41413',
            'conditional': '#ff8d00',
            'info': '#3caee0',
            'error': 'gray',
            'standby': '#ff8d00',
            'progress': '#ff8d00'
        };
        return colorMap[status] || '#ff8d00';
    },

    // 获取贤者状态背景（用于WiseMan组件）
    getWiseManBackground: (status) => {
        const backgroundMap = {
            'yes': '#52e691',
            'no': '#a41413',
            'info': '#3caee0',
            'conditional': 'repeating-linear-gradient(56deg, rgb(82, 230, 145) 0px, rgb(82, 230, 145) 30px, #82cd68 30px, #82cd68 60px)',
            'error': 'black'
        };
        return backgroundMap[status] || '#3caee0';
    },

    // 获取状态CSS类名
    getStatusClass: (status) => {
        return `status-tag status-${status}`;
    },

    // 验证状态是否有效
    isValidStatus: (status) => {
        const validStatuses = ['yes', 'no', 'conditional', 'info', 'error', 'standby', 'progress'];
        return validStatuses.includes(status);
    }
};

// 历史记录相关的工具函数
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

    // 获取贤者名称
    getWiseManName: (name) => {
        const nameMap = {
            'melchior': 'MELCHIOR-1 (科學家)',
            'balthasar': 'BALTHASAR-2 (母親)',
            'casper': 'CASPER-3 (女人)'
        };
        return nameMap[name] || name.toUpperCase();
    },

    // 继承状态相关方法
    ...StatusUtils
};

// 导出到全局作用域
window.StatusUtils = StatusUtils;
window.HistoryUtils = HistoryUtils;

// 工具库加载完成日志
console.log('✅ MAGI状态工具库已加载', {
    StatusUtils: Object.keys(StatusUtils),
    HistoryUtils: Object.keys(HistoryUtils)
});