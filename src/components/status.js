import React from 'react';
const $ = React.createElement;

export default function Status({ extention = '????' }) {
    const [randomCode, setRandomCode] = React.useState(0);

    React.useEffect(() => {
        setRandomCode(Math.floor(Math.random() * 900) + 100);
    }, [extention]);

    const extentionLabel = `EXTENTION:${extention}`;
    const codeLabel = `CODE:${randomCode}`;

    return $('div', { className: 'system-status' },
        $('div', {}, codeLabel),
        $('div', {}, 'FILE:MAGI_SYS'),
        $('div', {}, extentionLabel),
        $('div', {}, 'EX_MODE:OFF'),
        $('div', {}, 'PRIORITY:AAA')
    );
}
