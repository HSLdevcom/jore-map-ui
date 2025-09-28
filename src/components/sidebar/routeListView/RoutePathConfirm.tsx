import { inject, observer } from 'mobx-react'
import React from 'react'
import SavePrompt, { ISavePromptSection } from '~/components/overlays/SavePrompt'
import RouteActiveSchedules from '~/components/shared/RouteActiveSchedules'
import { IRoutePath } from '~/models'
import ISchedule from '~/models/ISchedule'
import * as s from './routePathConfirm.scss'

interface IRoutePathConfirmProps {
  routeId: string
  routePaths: IRoutePath[]
  activeSchedules: ISchedule[]
  savePromptSections: ISavePromptSection[]
}

const RoutePathConfirm = inject()(
  observer((props: IRoutePathConfirmProps) => {
    return (
      <div className={s.routePathConfirm}>
        <SavePrompt savePromptSections={props.savePromptSections} />
        <div className={s.routeActiveSchedulesWrapper}>
          <RouteActiveSchedules
            routePaths={props.routePaths}
            activeSchedules={props.activeSchedules}
            confirmMessage={`Haluatko varmasti tallentaa tehdyt reitin ${props.routeId} reitinsuuntien muutokset?`}
          />
        </div>
      </div>
    )
  })
)

export default RoutePathConfirm
