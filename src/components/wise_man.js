import React from 'react';
const $ = React.createElement;

export default function WiseMan({ 
    setProps, 
    name, 
    order_number, 
    status = 'info',
    n_clicks = 0 
}) {
    const getWiseManBackground = window.StatusUtils.getWiseManBackground;

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
