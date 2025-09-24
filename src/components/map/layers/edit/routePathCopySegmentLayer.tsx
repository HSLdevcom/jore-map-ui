import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { Polyline } from 'react-leaflet'
import { IRoutePathSegmentLink } from '~/models/IRoutePathLink'
import { RoutePathCopySegmentStore } from '~/stores/routePathCopySegmentStore'
import Marker from '../markers/Marker'

interface IRoutePathCopySegmentLayerProps {
  routePathCopySegmentStore?: RoutePathCopySegmentStore
}

const START_MARKER_COLOR = '#00d4ff'
const END_MARKER_COLOR = '#ff96f4'
const HIGHLIGHTED_LINK_TO_COPY_COLOR = '#00df0b'
const HIGHLIGHTED_LINK_NOT_TO_COPY_COLOR = '#f7e200'

@inject('routePathCopySegmentStore')
@observer
class RoutePathCopySegmentLayer extends Component<IRoutePathCopySegmentLayerProps> {
  private renderHighlightedRoutePath = () => {
    const routePathCopySegmentStore = this.props.routePathCopySegmentStore
    const startSegmentPoint = routePathCopySegmentStore!.startSegmentPoint
    const endSegmentPoint = routePathCopySegmentStore!.endSegmentPoint

    const highlightedRoutePath = routePathCopySegmentStore!.highlightedRoutePath
    if (!highlightedRoutePath || !startSegmentPoint || !endSegmentPoint) return null

    const segmentsToCopy = routePathCopySegmentStore!.getSegmentLinksToCopy(
      highlightedRoutePath,
      startSegmentPoint.nodeId,
      endSegmentPoint.nodeId
    )
    const segmentsNotToCopy = routePathCopySegmentStore!.getSegmentLinksNotToCopy(
      highlightedRoutePath,
      startSegmentPoint.nodeId,
      endSegmentPoint.nodeId
    )
    return (
      <>
        {segmentsToCopy.map(this.renderCopySegmentLink(HIGHLIGHTED_LINK_TO_COPY_COLOR))}
        {segmentsNotToCopy.map(this.renderCopySegmentLink(HIGHLIGHTED_LINK_NOT_TO_COPY_COLOR))}
      </>
    )
  }

  private renderCopySegmentLink = (color: string) => (link: IRoutePathSegmentLink) => {
    return (
      <Polyline
        positions={link.geometry}
        key={link.orderNumber}
        color={color}
        weight={8}
        opacity={0.5}
      />
    )
  }

  render() {
    const startSegmentPoint = this.props.routePathCopySegmentStore!.startSegmentPoint
    const endSegmentPoint = this.props.routePathCopySegmentStore!.endSegmentPoint

    return (
      <>
        {startSegmentPoint && (
          <Marker
            latLng={startSegmentPoint.coordinates}
            color={START_MARKER_COLOR}
            isClickDisabled={true}
          />
        )}
        {endSegmentPoint && (
          <Marker
            latLng={endSegmentPoint.coordinates}
            color={END_MARKER_COLOR}
            isClickDisabled={true}
          />
        )}
        {this.renderHighlightedRoutePath()}
      </>
    )
  }
}

export default RoutePathCopySegmentLayer
