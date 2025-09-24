import * as L from 'leaflet'
import NodeType from '~/enums/nodeType'
import TransitType from '~/enums/transitType'
import INode from './INode'

interface ILinkPrimaryKey {
  transitType?: TransitType
  startNode: INode
  endNode: INode
}

interface ILinkMapHighlight {
  transitType: TransitType
  geometry: L.LatLng[]
  startNodeId: string
  endNodeId: string
  dateRanges: string
  startNodeTransitTypes: TransitType[]
  startNodeType: NodeType
  endNodeTransitTypes: TransitType[]
  endNodeType: NodeType
}

interface ILink extends ILinkPrimaryKey {
  geometry: L.LatLng[]
  length: number
  speed: number
  measuredLength?: number
  dateRanges: string
  modifiedBy?: string
  modifiedOn?: Date
}

export default ILink

export { ILinkPrimaryKey, ILinkMapHighlight }
