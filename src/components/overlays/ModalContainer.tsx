import { observer } from 'mobx-react'
import React from 'react'
import * as s from './modalContainer.scss'

interface IModalProps {
  onExteriorClick?: () => void
  children: React.ReactNode
}

const ModalContainer = observer((props: IModalProps) => {
  const onExteriorDivClick = (e: any) => {
    if (e.target.className === s.modalContainer && props.onExteriorClick) {
      props.onExteriorClick()
    }
  }

  return (
    <div className={s.modalContainer} onClick={onExteriorDivClick} data-cy="modalContainer">
      <div className={s.wrapper}>
        <div className={s.modalInnerWrapper}>{props.children}</div>
      </div>
    </div>
  )
})

export default ModalContainer
