import { inject, observer } from 'mobx-react'
import * as React from 'react'
import * as s from './splitConfirm.scss'

interface ISplitConfirmProps {
  message: string
  itemList: { label: string; value: string }[]
}

const SplitConfirm = inject()(
  observer((props: ISplitConfirmProps) => {
    return (
      <div className={s.splitConfirmContentView}>
        <div className={s.confirmHeader}>{props.message}</div>
        {props.itemList.map((item, index) => (
          <div key={index} className={s.pair}>
            <div className={s.label}>{item.label}</div>
            <div>{item.value}</div>
          </div>
        ))}
        <div className={s.note}>(Muutoksia ei vielä tallenneta)</div>
      </div>
    )
  })
)

export default SplitConfirm
