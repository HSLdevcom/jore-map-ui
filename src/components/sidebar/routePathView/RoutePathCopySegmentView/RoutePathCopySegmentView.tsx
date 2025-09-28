import { inject, observer } from 'mobx-react'
import React from 'react'
import Loader from '~/components/shared/loader/Loader'
import { IRoutePathSegment } from '~/models/IRoutePath'
import IRoutePathLink from '~/models/IRoutePathLink'
import RoutePathLinkService from '~/services/routePathLinkService'
import { AlertStore, AlertType } from '~/stores/alertStore'
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore'
import { RoutePathStore } from '~/stores/routePathStore'
import { ToolbarStore } from '~/stores/toolbarStore'
import SidebarHeader from '../../SidebarHeader'
import RoutePathCopySegmentRow from './RoutePathCopySegmentRow'
import * as s from './routePathCopySegmentView.scss'

interface IRoutePathCopySegmentViewProps {
  alertStore?: AlertStore
  routePathStore?: RoutePathStore
  routePathCopySegmentStore?: RoutePathCopySegmentStore
  toolbarStore?: ToolbarStore
}

@inject('alertStore', 'routePathStore', 'routePathCopySegmentStore', 'toolbarStore')
@observer
class RoutePathCopySegmentView extends React.Component<IRoutePathCopySegmentViewProps> {
  private copySegments = async (rpSegment: IRoutePathSegment) => {
    const copySegmentStore = this.props.routePathCopySegmentStore
    this.props.alertStore!.setLoaderMessage('Kopioidaan reitinsuunnan segmenttiä...')

    const startSegmentPoint = copySegmentStore!.startSegmentPoint
    const endSegmentPoint = copySegmentStore!.endSegmentPoint
    if (!startSegmentPoint || !endSegmentPoint) {
      throw 'Either start or end segment point was not set'
    }
    if (!startSegmentPoint.nodeInternalId && !endSegmentPoint.nodeInternalId) {
      throw 'Missing at least one nodeInternalId'
    }

    const segmentsToCopy = copySegmentStore!.getSegmentLinksToCopy(
      rpSegment,
      startSegmentPoint.nodeId,
      endSegmentPoint.nodeId
    )
    segmentsToCopy.sort((a, b) => (a.orderNumber < b.orderNumber ? -1 : 1))

    const isNaturalDirection =
      startSegmentPoint.nodeInternalId &&
      this.props.routePathStore!.hasNodeOddAmountOfNeighbors(startSegmentPoint.nodeInternalId)

    const isOppositeDirection =
      endSegmentPoint.nodeInternalId &&
      this.props.routePathStore!.hasNodeOddAmountOfNeighbors(endSegmentPoint.nodeInternalId)

    if (isNaturalDirection) {
      // orderNumbers start from 1
      let orderNumber =
        this.props.routePathStore!.routePath!.routePathLinks.find(
          (link) => link.endNode.internalId === startSegmentPoint.nodeInternalId
        )!.orderNumber + 1
      for (let i = 0; i < segmentsToCopy.length; i += 1) {
        await this.copySegment(segmentsToCopy[i].routePathLinkId, orderNumber)
        orderNumber += 1
      }
    } else if (isOppositeDirection) {
      const orderNumber = this.props.routePathStore!.routePath!.routePathLinks.find(
        (link) => link.startNode.internalId === endSegmentPoint.nodeInternalId
      )!.orderNumber
      for (let i = segmentsToCopy.length - 1; i >= 0; i -= 1) {
        await this.copySegment(segmentsToCopy[i].routePathLinkId, orderNumber)
      }
    } else {
      // Should not occur
      throw 'Node with odd neighbors not found from current routePath by startNodeId or endNodeId.'
    }

    this.props.routePathCopySegmentStore!.clear()
    this.props.toolbarStore!.selectTool(null)

    this.props.alertStore!.close()
    this.props.alertStore!.setFadeMessage({
      message: 'Segmentti kopioitu!',
      type: AlertType.Success,
    })
  }

  private copySegment = async (routePathLinkId: number, fixedOrderNumber: number) => {
    const routePathLink: IRoutePathLink = await RoutePathLinkService.fetchRoutePathLink(
      routePathLinkId
    )
    routePathLink.orderNumber = fixedOrderNumber
    this.props.routePathStore!.cloneLink({
      routePathLink,
    })
  }

  private renderErrorMessage = () => {
    return (
      <div className={s.routePathList}>
        <div className={s.messageContainer}>Virhe alku- ja loppusolmun asetuksessa.</div>
      </div>
    )
  }

  private renderResults = () => {
    const routesToCopyFrom = this.props.routePathCopySegmentStore!.routesToCopyFrom

    const startNodeId = this.props.routePathCopySegmentStore!.startSegmentPoint!.nodeId
    const endNodeId = this.props.routePathCopySegmentStore!.endSegmentPoint!.nodeId
    return (
      <div className={s.routePathList}>
        {routesToCopyFrom.length === 0 ? (
          <div className={s.messageContainer}>
            {`Kopioitavia reitinsuunnan segmenttejä ei löytynyt valitulta alku- ja
                        loppusolmun väliltä (${startNodeId} - ${endNodeId}). Kokeile muuttaa kopioitavaa väliä, esimerkiksi asettaa
                        pienempi kopioitava väli.`}
          </div>
        ) : (
          <>
            {routesToCopyFrom.map((routeUsingLink, index) => {
              return (
                <RoutePathCopySegmentRow
                  key={`routeUsingLink-${index}`}
                  lineId={routeUsingLink.lineId}
                  routeId={routeUsingLink.routeId}
                  copySegments={this.copySegments}
                />
              )
            })}
          </>
        )}
      </div>
    )
  }

  private closeEditing = () => {
    this.props.routePathCopySegmentStore!.clear()
  }

  render() {
    const isLoading = this.props.routePathCopySegmentStore!.isLoading
    const areNodePositionsValid = this.props.routePathCopySegmentStore!.areNodePositionsValid
    let state
    if (!areNodePositionsValid) {
      state = 'hasError'
    } else if (isLoading) {
      state = 'isLoading'
    } else {
      state = 'showResults'
    }

    return (
      <div className={s.routePathCopySegmentView}>
        <SidebarHeader
          className={s.header}
          onCloseButtonClick={this.closeEditing}
          isCloseButtonVisible={true}
          isBackButtonVisible={false}
        >
          Reitinsuunta segmentin kopiointi
        </SidebarHeader>
        {
          {
            hasError: this.renderErrorMessage(),
            isLoading: <Loader size="small" />,
            showResults: this.renderResults(),
          }[state]
        }
      </div>
    )
  }
}

export default RoutePathCopySegmentView
