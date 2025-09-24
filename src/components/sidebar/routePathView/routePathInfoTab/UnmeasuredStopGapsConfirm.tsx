import { inject, observer } from 'mobx-react'
import React from 'react'
import { FaExclamationCircle } from 'react-icons/fa'
import * as s from './unmeasuredStopGapsConfirm.scss'

interface IUnmeasuredStopGapsConfirmProps {
  unmeasuredStopGapsList: string[][]
  missingStopGapsList: string[][]
  routePathLength: number
  calculatedRoutePathLength: number
}

const UnmeasuredStopGapsConfirm = inject()(
  observer((props: IUnmeasuredStopGapsConfirmProps) => {
    return (
      <div className={s.unmeasuredStopGapPrompt} data-cy="unmeasuredStopGapPrompt">
        <div>Haluatko varmasti tallentaa reitinsuunnan?</div>
        {props.routePathLength !== props.calculatedRoutePathLength && (
          <div className={s.header}>
            <FaExclamationCircle className={s.exclamationMark} />
            <div>
              Reitinsuunnan tämän hetkinen pituus ei ole sama kuin pysäkkivälien ja linkkien
              pituuksista muodostettu summa.
            </div>
          </div>
        )}
        {props.missingStopGapsList.length > 0 && (
          <>
            <div className={s.header}>
              Reitinsuunnan laskettu pituus sisältää puuttuvia pysäkkivälejä:
            </div>
            {props.missingStopGapsList.map((missingStopGap: string[], index: number) => {
              return (
                <div key={`stopGap-${index}`}>
                  {missingStopGap[0]} - {missingStopGap[1]}
                </div>
              )
            })}
          </>
        )}
        {props.unmeasuredStopGapsList.length > 0 && (
          <>
            <div className={s.header}>
              Reitinsuunnan laskettu pituus sisältää mittaamattomia pysäkkivälejä:
            </div>
            {props.unmeasuredStopGapsList.map((unmeasuredStopGap: string[], index: number) => {
              return (
                <div key={`stopGap-${index}`}>
                  {unmeasuredStopGap[0]} - {unmeasuredStopGap[1]}
                </div>
              )
            })}
          </>
        )}
      </div>
    )
  })
)

export default UnmeasuredStopGapsConfirm
