import { observer } from 'mobx-react'
import React from 'react'
import * as s from './toggleSwitch.scss'

interface IToggleSwitchProps {
  value: boolean
  color: string
  onClick(event: any): void
}

const ToggleSwitch = observer((props: IToggleSwitchProps) => {
  const doNothing = () => {
    // Empty function
    // Needed because input field wants an onChange function if its checked field is changed
  }

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    props.onClick(event)
    event.stopPropagation()
    event.preventDefault()
  }

  const style = {
    backgroundColor: props.color,
  }

  return (
    <label onClick={onClick} className={s.toggleSwitchView}>
      <input type="checkbox" checked={props.value} onChange={doNothing} />
      <div style={style} className={s.slider} />
    </label>
  )
})

export default ToggleSwitch
