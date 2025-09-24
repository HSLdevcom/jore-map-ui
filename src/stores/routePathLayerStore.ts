import { INeighborLink } from '~/models'

import { action, computed, observable } from 'mobx'

// Is the neighbor to add either startNode or endNode
enum NeighborToAddType {
  AfterNode,
  BeforeNode,
}

class RoutePathLayerStore {
  @observable private _neighborLinks: INeighborLink[]
  @observable private _neighborToAddType: NeighborToAddType
  @observable private _extendedListItemId: string | null // node.internalId, link.id
  @observable private _hoveredItemId: string | null // node.internalId, link.id
  @observable private _highlightedNeighborLinkId: string
  @observable private _toolHighlightedNodeIds: string[] // node.internalId
  @observable private _gapClosingNeighborLink: INeighborLink | null // Visualizes that by selecting this neighborLink, a gap in routePath will be closed

  constructor() {
    this._neighborLinks = []
    this._extendedListItemId = null
    this._hoveredItemId = null
    this._highlightedNeighborLinkId = ''
    this._toolHighlightedNodeIds = []
    this._gapClosingNeighborLink = null
  }

  @computed
  get neighborLinks(): INeighborLink[] {
    return this._neighborLinks
  }

  @computed
  get neighborToAddType(): NeighborToAddType {
    return this._neighborToAddType
  }

  @computed
  get extendedListItemId() {
    return this._extendedListItemId
  }

  @computed
  get hoveredItemId() {
    return this._hoveredItemId
  }

  @computed
  get highlightedNeighborLinkId() {
    return this._highlightedNeighborLinkId
  }

  @computed
  get toolHighlightedNodeIds() {
    return this._toolHighlightedNodeIds
  }

  @computed
  get gapClosingNeighborLink() {
    return this._gapClosingNeighborLink
  }

  @action
  public setNeighborLinks = (neighborLinks: INeighborLink[]) => {
    this._neighborLinks = neighborLinks
  }

  @action
  public setNeighborToAddType = (neighborToAddType: NeighborToAddType) => {
    this._neighborToAddType = neighborToAddType
  }

  @action
  public setExtendedListItemId = (id: string | null) => {
    this._extendedListItemId = id
  }

  @action
  public setHoveredItemId = (id: string | null) => {
    this._hoveredItemId = id
  }

  @action
  public setHighlightedNeighborLinkId = (id: string) => {
    this._highlightedNeighborLinkId = id
  }

  @action
  public setToolHighlightedNodeIds = (ids: string[]) => {
    this._toolHighlightedNodeIds = ids
  }

  @action
  public setGapClosingNeighborLink = (neighborLink: INeighborLink | null) => {
    this._gapClosingNeighborLink = neighborLink
  }

  @action
  public clear = () => {
    this._neighborLinks = []
    this._extendedListItemId = null
    this._hoveredItemId = null
    this._gapClosingNeighborLink = null
  }
}

export default new RoutePathLayerStore()

export { RoutePathLayerStore, NeighborToAddType }
