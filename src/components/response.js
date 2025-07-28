import React from 'react';
const $ = React.createElement;

export default function Response({ status = 'info', question_id = 0, answer_id = 0 }) {
    // 使用统一的状态工具库，如果不可用则使用本地备份
    const getStatusText = window.StatusUtils?.getStatusText || ((status) => {
        const statusMap = {
            'standby': '待 機',
            'progress': '審議中',
            'info': '情 報',
            'yes': '可 決',
            'no': '否 決',
            'conditional': '状 態',
            'error': '誤 差'
        };
        return statusMap[status] || '情 報';
    });

    const getStatusColor = window.StatusUtils?.getStatusColor || ((status) => {
        const colorMap = {
            'standby': '#ff8d00',
            'progress': '#ff8d00',
            'info': '#3caee0',
            'yes': '#52e691',
            'no': '#a41413',
            'conditional': '#ff8d00',
            'error': 'gray'
        };
        return colorMap[status] || '#3caee0';
    });

    const text = getStatusText(status);
    const color = getStatusColor(status);

    let className = 'response';
    if (question_id !== answer_id)
        className += ' flicker';

    return $('div', { className, style: { color: color, borderColor: color } },
        $('div', { className: 'inner' }, text)
    );
}
