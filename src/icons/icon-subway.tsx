/* tslint:disable */

import React from 'react'

interface ITrainIconProps {
  height: string
  isWithoutBox: boolean
}

const subwayIcon: React.SFC<ITrainIconProps> = (props) => {
  const icon = (
    <svg
      className="line-icon"
      version="1.1"
      id="Layer_1"
      x="0px"
      y="0px"
      viewBox="0 0 16 16"
      enableBackground="new 0 0 16 16"
      height={props.height}
    >
      <g>
        <path
          fill="#FF6319"
          d="M-0.01 1.982C-0.01 0.901 0.891 0 1.972 0h12.015c1.121 0 2.023 0.901 2.023 1.982v12.015
          c0 1.121-0.901 2.023-2.023 2.023H1.972c-1.081 0-1.982-0.901-1.982-2.023V1.982z"
        />
      </g>
      <g>
        <path
          fill="#FFFFFF"
          d="M5.7 3.192l2.36 6.938h0.028l2.233-6.938h3.123v10.089h-2.077v-7.15h-0.028l-2.473 7.15h-1.71L4.682 6.202
          H4.654v7.079H2.577V3.192H5.7z"
        />
      </g>
    </svg>
  )

  const iconWithoutBox = (
    <svg
      className="line-icon"
      version="1.1"
      id="Layer_1"
      x="0px"
      y="0px"
      viewBox="0 0 1024 1024"
      enableBackground="new 0 0 16 16"
      height={props.height}
    >
      <g>
        <path
          fill="#FFFFFF"
          d="M732.237 401.243v-21.037c0-1.252 2.505-2.473 5.009-2.473v504.921h156.056V141.347h-230.28L518.296 647.521l-2.504 34.655h-3.788l-3.788-34.655-144.692-506.174H131.96v741.307h158.56V377.733c1.253 0 3.789 1.22 3.789 2.473v21.037l140.936 481.411h154.773l142.22-481.411z"
        />
      </g>
    </svg>
  )

  return props.isWithoutBox ? iconWithoutBox : icon
}

export default subwayIcon
