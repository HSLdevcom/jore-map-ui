import classnames from 'classnames'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { getNeighborLinkColor } from '~/components/map/layers/edit/RoutePathNeighborLinkLayer'
import { INeighborLink } from '~/models'
import { RoutePathLayerStore } from '~/stores/routePathLayerStore'
import { RoutePathStore } from '~/stores/routePathStore'
import { ToolbarStore } from '~/stores/toolbarStore'
import * as s from './routePathListItem.scss'

interface IRoutePathListNeighborLinkProps {
  neighborLink: INeighborLink
  isNeighborLinkHighlighted: boolean
  routePathLayerStore?: RoutePathLayerStore
  routePathStore?: RoutePathStore
  toolbarStore?: ToolbarStore
}

const RoutePathListNeighborLink = inject(
  'routePathLayerStore',
  'routePathStore',
  'toolbarStore'
)(
  observer((props: IRoutePathListNeighborLinkProps) => {
    const toggleNeighborLinkHighlight = (isHovered: boolean) => {
      props.routePathLayerStore!.setHighlightedNeighborLinkId(
        isHovered ? props.neighborLink.routePathLink.id : ''
      )
    }

    const onRoutePathListItemClick = () => {
      props.toolbarStore!.selectTool(null)
      props.routePathStore!.addLink({
        routePathLink: props.neighborLink.routePathLink,
      })
    }

    return (
      <div
        className={classnames(s.routePathListItem, s.neighborRoutePathListItem)}
        title={'Sulje reitinsuunnan väli'}
        onMouseEnter={() => toggleNeighborLinkHighlight(true)}
        onMouseLeave={() => toggleNeighborLinkHighlight(false)}
        onClick={onRoutePathListItemClick}
      >
        <div className={s.listIconWrapper}>
          <div className={s.borderContainer}>
            <div
              className={classnames(s.neighborBorderLeftHeight, s.neighborBorderLeft)}
              style={{
                borderColor: getNeighborLinkColor(
                  props.neighborLink,
                  props.isNeighborLinkHighlighted
                ),
              }}
            ></div>
            <div></div>
          </div>
        </div>
        <div className={s.contentWrapper}></div>
      </div>
    )
  })
)

export default RoutePathListNeighborLink
