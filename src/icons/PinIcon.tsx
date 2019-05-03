//tslint:disable
import React from 'react';
import { CSSProperties } from 'react';

const pinIcon = ({ color }: { color: string }) => {
    const divStyle: CSSProperties = {
        position: 'absolute',
        left: '50%',
        padding: '15px',
        msTransform: 'translateX(-50%) translateY(-50%)',
        WebkitTransform: 'translate(-50%,-50%)',
        transform: 'translate(-50%,-50%)',
        pointerEvents: 'none'
    };
    return (
        <div style={divStyle}>
            <svg
                data-prefix='fas'
                viewBox='0 0 384 512'
                width='35'
                height='35'
                color={color}
            >
                <path
                    fill='currentColor'
                    d='M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97
                    99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80
                     35.817-80 80 35.817 80 80 80z'
                />
            </svg>
        </div>
    );
};

export default pinIcon;
