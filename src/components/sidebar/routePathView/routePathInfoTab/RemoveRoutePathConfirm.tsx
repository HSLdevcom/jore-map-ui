import { inject, observer } from 'mobx-react'
import React from 'react'
import RouteActiveSchedules from '~/components/shared/RouteActiveSchedules'
import { IRoutePath } from '~/models'
import ISchedule from '~/models/ISchedule'
import * as s from './removeRoutePathButton.scss'

interface IRemoveRoutePathConfirmProps {
  routePaths: IRoutePath[]
  activeSchedules: ISchedule[]
  header?: string
  confirmMessage?: string
}

const RemoveRoutePathConfirm = inject()(
  observer((props: IRemoveRoutePathConfirmProps) => {
    return (
      <div>
        <div className={s.routeActiveSchedulesWrapper}>
          <RouteActiveSchedules
            header={props.header}
            routePaths={props.routePaths}
            activeSchedules={props.activeSchedules}
            confirmMessage={props.confirmMessage}
          />
        </div>
      </div>
    )
  })
)

export default RemoveRoutePathConfirm
