import React from "react";
const $ = React.createElement;

export default function Magi({ children, status }) {
    const magiClassName = `magi ${status === 'progress' ? 'magi-in-progress' : ''}`;

    return $('div', { className: magiClassName },
        $('div', { className: 'connection casper-balthasar' }),
        $('div', { className: 'connection casper-melchior' }),
        $('div', { className: 'connection balthasar-melchior' }),
        ...children,
        $('div', { className: 'title' }, 'MAGI')
    );
}