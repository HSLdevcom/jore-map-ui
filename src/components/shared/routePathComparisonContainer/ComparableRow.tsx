import classnames from 'classnames'
import { isEqual } from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { areDatesEqual, toDateString } from '~/utils/dateUtils'
import * as s from './comparableRow.scss'

interface IRoutePathComparisonContainerProps {
  label: string
  value1: any
  value2: any
}

const getAreValuesEqual = (value1: any, value2: any) => {
  return value1 instanceof Date ? areDatesEqual(value1, value2) : isEqual(value1, value2)
}

const ComparableRow = inject()(
  observer((props: IRoutePathComparisonContainerProps) => {
    const { label, value1, value2 } = props
    const _getDisplayedValue = (value: any) => {
      if (value instanceof Date) {
        return toDateString(value)
      }
      if (typeof value === 'string' || value instanceof String) {
        return value.length === 0 ? '-' : value
      }
      return value
    }
    const areValuesEqual = getAreValuesEqual(value1, value2)
    return (
      <div className={s.comparableRow}>
        <div className={s.label}>{label}</div>
        <div className={classnames(s.values, areValuesEqual ? s.equalValues : undefined)}>
          <div className={classnames(s.valueContainer, s.leftValueContainer)}>
            <div
              className={classnames(s.leftValue, !areValuesEqual ? s.valueChanged : undefined)}
            >
              {_getDisplayedValue(value1)}
            </div>
          </div>
          <div className={classnames(s.valueContainer, s.rightValueContainer)}>
            <div
              className={classnames(
                s.rightValue,
                !areValuesEqual ? s.valueChanged : undefined
              )}
            >
              {_getDisplayedValue(value2)}
            </div>
          </div>
        </div>
      </div>
    )
  })
)

export default ComparableRow

export { getAreValuesEqual }
