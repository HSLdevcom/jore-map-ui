import { latLngBounds } from 'leaflet'
import { inject, observer } from 'mobx-react'
import React from 'react'
import NodeType from '~/enums/nodeType'
import { ISearchNode } from '~/models/INode'
import { MapStore } from '~/stores/mapStore'
import NavigationUtils from '~/utils/NavigationUtils'
import NodeUtils from '~/utils/NodeUtils'
import TransitTypeNodeIcon from '../TransitTypeNodeIcon'
import * as s from './nodeItem.scss'

interface INodeItemProps {
  node: ISearchNode
  mapStore?: MapStore
}

const NodeItem = inject('mapStore')(
  observer((props: INodeItemProps) => {
    const { node } = props

    const centerMapToNode = () => {
      const latLngs: L.LatLng[] = [props.node.coordinates]
      const bounds = latLngBounds(latLngs)
      props.mapStore!.setMapBounds(bounds)
    }

    return (
      <div className={s.nodeItem} data-cy={`nodeItem${node.type}`}>
        <div className={s.nodeIconWrapper} onClick={() => centerMapToNode()}>
          <TransitTypeNodeIcon nodeType={node.type} transitTypes={node.transitTypes} />
        </div>
        <div
          className={s.nodeItemTextContainer}
          onClick={() => NavigationUtils.openNodeView({ nodeId: props.node.id })}
        >
          <div className={s.nodeId}>{node.id}</div>
          <div>{NodeUtils.getNodeTypeName(node.type)}</div>
          {node.type === NodeType.STOP && <div>{NodeUtils.getShortId(node)}</div>}
          <div className={s.stopName}>{node.stopName ? node.stopName : ''}</div>
        </div>
      </div>
    )
  })
)

export default NodeItem
