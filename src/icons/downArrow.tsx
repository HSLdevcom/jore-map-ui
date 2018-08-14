/* tslint:disable */

import * as React from 'react'

interface IFerryIconProps {
  height: string
}

const downArrowIcon: React.SFC<IFerryIconProps> = (props) => {
    return (
        <svg
            className='downArrowIcon'
            version='1.1' x='0px' y='0px'
            viewBox='0 0 24 24' enableBackground='new 0 0 24 24' height={props.height}>
            <path
                d="M7.41,8.59L12,13.17l4.59-4.58L18,10l-6,6l-6-6L7.41,8.59z"
                fill="#007ac9">
            </path>
            <path fill="none" d="M0,0h24v24H0V0z"/>
        </svg>
    )
}

export default downArrowIcon;