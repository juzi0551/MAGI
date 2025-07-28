import React from 'react';
const $ = React.createElement;

function getStatusText(status) {
    if (status === 'standby')
        return '待 機';

    if (status === 'progress')
        return '審議中';

    if (status === 'info')
        return '情 報';

    if (status === 'yes')
        return '可 決';

    if (status === 'no')
        return '否 決';

    if (status === 'conditional')
        return '状 態';

    if (status === 'error')
        return '誤 差'

    throw new Error('Invalid status: ' + status);
}

function getStatusColor(status) {
    if (status === 'standby')
        return '#ff8d00';

    if (status === 'progress')
        return '#ff8d00';

    if (status === 'info')
        return '#3caee0';

    if (status === 'yes')
        return '#52e691';

    if (status === 'no')
        return '#a41413';

    if (status === 'conditional')
        return '#ff8d00';

    if (status === 'error')
        return 'gray';

    throw new Error('Invalid status: ' + status);
}

export default function Response({ status = 'info', question_id = 0, answer_id = 0 }) {
    const text = getStatusText(status);
    const color = getStatusColor(status);

    let className = 'response';
    if (question_id !== answer_id)
        className += ' flicker';

    return $('div', { className, style: { color: color, borderColor: color } },
        $('div', { className: 'inner' }, text)
    );
}
