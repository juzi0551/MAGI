import React from 'react';
const $ = React.createElement;

export default function WiseMan({ 
    setProps, 
    name, 
    order_number, 
    status = 'info',
    n_clicks = 0 
}) {
    // 使用统一的状态工具库，如果不可用则使用本地备份
    const getWiseManBackground = window.StatusUtils?.getWiseManBackground || ((status) => {
        const backgroundMap = {
            'yes': '#52e691',
            'no': '#a41413',
            'info': '#3caee0',
            'conditional': 'repeating-linear-gradient(56deg, rgb(82, 230, 145) 0px, rgb(82, 230, 145) 30px, #82cd68 30px, #82cd68 60px)',
            'error': 'black'
        };
        return backgroundMap[status] || '#3caee0';
    });

    const fullName = `${name.toUpperCase()} • ${order_number}`;
    const color = getWiseManBackground(status);

    const onClick = () => {
        setProps({ n_clicks: n_clicks + 1 });
    };

    let outerClassName = `wise-man ${name}`;
    let innerClassName = 'inner';

    return $('div', { className: outerClassName, onClick: onClick, key: name },
        $('div', { className: innerClassName, style: { background: color } }, fullName)
    )
}
