import React from 'react';
const $ = React.createElement;

export default function Status() {
    const [randomCode, setRandomCode] = React.useState(0);
    const [extention, setExtention] = React.useState('0000');

    React.useEffect(() => {
        setRandomCode(Math.floor(Math.random() * 900) + 100);
        setExtention(String(Math.floor(Math.random() * 9000) + 1000));
    }, []);

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
