/* tslint:disable */

import React from 'react';

interface ILoginIconProps {
    height: string;
    fill: string;
}

const loginIcon: React.SFC<ILoginIconProps> = props => {
    return (
        <svg
            version='1.1'
            id='Layer_1'
            x='0px'
            y='0px'
            viewBox="0 0 448 512"
            enableBackground='new 0 0 16 16'
            height={props.height}
        >
        <g fill={props.fill}>
            <path
            d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"
            id="Fill-1"
            />
        </g>
        </svg>
    );
}

export default loginIcon;