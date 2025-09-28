import Moment from 'moment'
import React, { Component } from 'react'
import TransitTypeLink from '~/components/shared/TransitTypeLink'
import { IRoutePath } from '~/models'
import routeBuilder from '~/routing/routeBuilder'
import SubSites from '~/routing/subSites'
import { PopupStore } from '~/stores/popupStore'
import { toDateString } from '~/utils/dateUtils'
import * as s from './nodeUsagePopup.scss'

interface INodeUsagePopupData {
  routePaths: IRoutePath[]
}

interface INodeUsagePopupProps {
  popupId: number
  data: INodeUsagePopupData
  popupStore?: PopupStore
}

class NodeUsagePopup extends Component<INodeUsagePopupProps> {
  render() {
    const data: INodeUsagePopupData = this.props.data
    const routePaths = data.routePaths
    return (
      <div className={s.nodeUsageList}>
        <div className={s.topic}>Solmua käyttävät reitinsuunnat</div>
        {routePaths
          .slice()
          .sort((a, b) => (a.routeId < b.routeId ? -1 : 1))
          .map((routePath, index) => {
            const routePathLink = routeBuilder
              .to(SubSites.routePath)
              .toTarget(
                ':id',
                [
                  routePath.routeId,
                  Moment(routePath.startDate).format('YYYY-MM-DDTHH:mm:ss'),
                  routePath.direction,
                ].join(',')
              )
              .toLink()
            const openRoutePathInNewWindow = () => {
              const path = routePathLink // TODO? + Navigator.getSearch();
              window.open(path, '_blank')
            }
            return (
              <div className={s.usageListItem} key={index}>
                <div className={s.transitTypeLinkWrapper}>
                  <TransitTypeLink
                    transitType={routePath.transitType!}
                    shouldShowTransitTypeIcon={true}
                    text={routePath.routeId}
                    size="small"
                    onClick={openRoutePathInNewWindow}
                    hoverText={`Avaa reitinsuunta ${routePath.routeId} uuteen ikkunaan`}
                  />
                </div>
                <div className={s.direction}>{routePath.direction}</div>
                <div>
                  <div className={s.place}>{routePath.originFi}</div>
                  <div>-</div>
                  <div className={s.place}>{routePath.destinationFi}</div>
                </div>
                <div>
                  <div>{toDateString(routePath.startDate)}</div>
                  <div>-</div>
                  <div>{toDateString(routePath.endDate)}</div>
                </div>
              </div>
            )
          })}
      </div>
    )
  }
}

export default NodeUsagePopup

export { INodeUsagePopupData }
