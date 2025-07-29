import React from 'react';
const $ = React.createElement;

export default function Response({ status = 'info' }) {
    // 使用统一的状态工具库，如果不可用则使用本地备份
    const getStatusText = window.StatusUtils.getStatusText;
    const getStatusColor = window.StatusUtils.getStatusColor;

    const text = getStatusText(status);
    const color = getStatusColor(status);

    let className = 'response';
    if (status === 'progress') {
        className += ' flicker';
    }

    return $('div', { className, style: { color: color, borderColor: color } },
        $('div', { className: 'inner' }, text)
    );
}
