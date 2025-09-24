import classnames from 'classnames'
import { isEmpty, isNumber } from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { FiEdit3 } from 'react-icons/fi'
import NodeType from '~/enums/nodeType'
import StartNodeType from '~/enums/startNodeType'
import { IRoutePath } from '~/models'
import codeListStore from '~/stores/codeListStore'
import { MapStore } from '~/stores/mapStore'
import { RoutePathComparisonStore } from '~/stores/routePathComparisonStore'
import NodeUtils from '~/utils/NodeUtils'
import TransitTypeNodeIcon from '../TransitTypeNodeIcon'
import ComparableRow from './ComparableRow'
import { getRpLinkRows, IComparableRoutePathLink } from './NodeDifferenceVisualizerHelper'
import * as s from './nodeDifferencesVisualizer.scss'

interface INodeDifferencesVisualizerProps {
  routePath1: IRoutePath
  routePath2: IRoutePath
  areEqualPropertiesVisible: boolean
  areCrossroadsVisible: boolean
  openRoutePathLinkEdit?: (id: string) => void
  routePathComparisonStore?: RoutePathComparisonStore
  mapStore?: MapStore
}

interface IRoutePathLinkRow {
  rpLink1: IComparableRoutePathLink | null
  rpLink2: IComparableRoutePathLink | null
  areNodesEqual: boolean
}

interface INodePropertyRow {
  label: string
  value1: string
  value2: string
}

const NodeDifferencesVisualizer = inject(
  'routePathComparisonStore',
  'mapStore'
)(
  observer((props: INodeDifferencesVisualizerProps) => {
    const {
      routePath1,
      routePath2,
      areEqualPropertiesVisible,
      areCrossroadsVisible,
      openRoutePathLinkEdit,
    } = props
    const rpLinkRows: IRoutePathLinkRow[] = getRpLinkRows({ routePath1, routePath2 })
    return (
      <div className={s.nodeDifferencesVisualizer}>
        {rpLinkRows.map((rpLinkRow: IRoutePathLinkRow, index: number) => {
          const rpLink1 = rpLinkRow.rpLink1
          const rpLink2 = rpLinkRow.rpLink2
          const areNodesEqual = Boolean(
            rpLink1 && rpLink2 && rpLink1.startNode.id === rpLink2.startNode.id
          )
          if (
            !areCrossroadsVisible &&
            areNodesEqual &&
            rpLink1!.startNode.type === NodeType.CROSSROAD
          ) {
            return
          }
          return (
            <div className={s.nodeRow} key={`nodeRow-${index}`}>
              {_renderNodeHeader({
                rpLink1,
                rpLink2,
                areNodesEqual,
                openRoutePathLinkEdit,
                mapStore: props.mapStore,
              })}
              {_renderNodeContainers({
                rpLink1,
                rpLink2,
                areNodesEqual,
                areEqualPropertiesVisible,
              })}
            </div>
          )
        })}
      </div>
    )
  })
)

const _renderNodeHeader = ({
  rpLink1,
  rpLink2,
  areNodesEqual,
  openRoutePathLinkEdit,
  mapStore,
}: {
  rpLink1: IComparableRoutePathLink | null
  rpLink2: IComparableRoutePathLink | null
  areNodesEqual: boolean
  openRoutePathLinkEdit?: (id: string) => void
  mapStore?: MapStore
}) => {
  const _getHeaderText = (rpLink: IComparableRoutePathLink) => {
    const node = rpLink.startNode
    const stopName = node.stop ? node.stop.nameFi : ''
    const isStop = node.type === NodeType.STOP
    const nodeTypeName = NodeUtils.getNodeTypeName(node.type)
    let header = isStop ? stopName : nodeTypeName
    header += ` ${node.id}`
    if (isStop) {
      let shortId = node.shortIdLetter ? node.shortIdLetter : ''
      shortId += node.shortIdString ? node.shortIdString : ''
      header += !isEmpty(shortId) ? ` ${shortId}` : ''
    }
    return header
  }
  const _renderTransitTypeIcon = (rpLink: IComparableRoutePathLink) => {
    const node = rpLink.startNode
    return (
      <div className={s.transitTypeIconWrapper}>
        <TransitTypeNodeIcon
          nodeType={node.type}
          transitTypes={node.transitTypes}
          isTimeAlignmentStop={false}
          isDisabled={false}
          isHighlighted={false}
          highlightColor={'yellow'}
        />
      </div>
    )
  }
  const _renderEditPenIcon = (rpLink: IComparableRoutePathLink) => {
    const node = rpLink.startNode
    return (
      <div className={s.editPenIconWrapper}>
        <FiEdit3 onClick={() => openRoutePathLinkEdit!(node.internalId)} />
      </div>
    )
  }
  const _centerMapToNode = (rpLink: IComparableRoutePathLink) => {
    const node = rpLink.startNode
    mapStore!.setCoordinates(node.coordinates)
  }
  if (areNodesEqual) {
    const headerText = _getHeaderText(rpLink1!)

    let stopHeaderClass
    if (rpLink1!.startNode.type === NodeType.STOP) {
      if (rpLink1!.startNodeType === StartNodeType.DISABLED) {
        stopHeaderClass = s.stopHeaderDisabled
      } else {
        stopHeaderClass = s.stopHeader
      }
    }
    return (
      <div className={classnames(s.headerContainer, s.headerTextCommon)}>
        <div
          className={classnames(s.centerHeaderTextContainer, stopHeaderClass)}
          onClick={() => _centerMapToNode(rpLink1!)}
        >
          {_renderTransitTypeIcon(rpLink1!)}
          {headerText}
        </div>
        {openRoutePathLinkEdit && rpLink1!.startNode.type === NodeType.STOP && (
          <>{_renderEditPenIcon(rpLink1!)}</>
        )}
      </div>
    )
  }
  return (
    <div className={s.headerContainer}>
      <div
        className={s.headerTextLeft}
        onClick={rpLink1 ? () => _centerMapToNode(rpLink1) : () => void 0}
      >
        {rpLink1 && (
          <>
            {_renderTransitTypeIcon(rpLink1)}
            {_getHeaderText(rpLink1)}
          </>
        )}
      </div>
      <div
        className={s.headerTextRight}
        onClick={rpLink2 ? () => _centerMapToNode(rpLink2) : () => void 0}
      >
        {rpLink2 && (
          <>
            {_renderTransitTypeIcon(rpLink2)}
            {_getHeaderText(rpLink2)}
          </>
        )}
      </div>
      {openRoutePathLinkEdit && rpLink2 && rpLink2.startNode.type === NodeType.STOP && (
        <div>{_renderEditPenIcon(rpLink2)}</div>
      )}
    </div>
  )
}

const _renderNodeContainers = ({
  rpLink1,
  rpLink2,
  areNodesEqual,
  areEqualPropertiesVisible,
}: {
  rpLink1: IComparableRoutePathLink | null
  rpLink2: IComparableRoutePathLink | null
  areNodesEqual: boolean
  areEqualPropertiesVisible: boolean
}) => {
  let nodePropertyRows: INodePropertyRow[] = []
  const _addToNodePropertyRows = ({
    label,
    property,
  }: {
    label: string
    property: string
  }) => {
    nodePropertyRows = _addRowToNodePropertyRows({
      nodePropertyRows,
      areNodesEqual,
      areEqualPropertiesVisible,
      rpLink1,
      rpLink2,
      label,
      property,
    })
  }
  _addToNodePropertyRows({ label: 'Erikoistyyppi', property: 'startNodeUsage' })
  _addToNodePropertyRows({
    label: 'Ajantasauspysäkki',
    property: 'startNodeTimeAlignmentStop',
  })
  _addToNodePropertyRows({
    label: 'Hastus paikka',
    property: 'isStartNodeHastusStop',
  })
  _addToNodePropertyRows({ label: 'Pysäkki käytössä', property: 'startNodeType' })
  _addToNodePropertyRows({
    label: '1. Määränpää suomeksi',
    property: 'destinationFi1',
  })
  _addToNodePropertyRows({
    label: '1. Määränpää ruotsiksi',
    property: 'destinationSw1',
  })
  _addToNodePropertyRows({
    label: '2. Määränpää suomeksi',
    property: 'destinationFi2',
  })
  _addToNodePropertyRows({
    label: '2. Määränpää ruotsiksi',
    property: 'destinationSw2',
  })
  _addToNodePropertyRows({
    label: '1. Kilpi suomeksi',
    property: 'destinationShieldFi',
  })
  _addToNodePropertyRows({
    label: '2. Kilpi ruotsiksi',
    property: 'destinationShieldSw',
  })
  _addToNodePropertyRows({
    label: 'Ohitusaika kirja-aikataulussa',
    property: 'isStartNodeUsingBookSchedule',
  })
  _addToNodePropertyRows({
    label: 'Pysäkin sarakenum. kirja-aikataulussa',
    property: 'startNodeBookScheduleColumnNumber',
  })
  return (
    <div className={s.nodeContainers}>
      {nodePropertyRows.map((nodePropertyRow: INodePropertyRow, index: number) => {
        const key = `row-${index}`

        return areNodesEqual
          ? _renderComparableRow({ nodePropertyRow, key })
          : _renderNodeSeparateRow({ nodePropertyRow, key })
      })}
    </div>
  )
}

const rpLinkValueMapperObj = {
  startNodeUsage: (value: string) => codeListStore.getCodeListLabel('Pysäkin käyttö', value),
  startNodeTimeAlignmentStop: (value: string) =>
    codeListStore.getCodeListLabel('Ajantasaus pysakki', value),
  startNodeType: (value: string) => (value === StartNodeType.DISABLED ? 'Ei' : 'Kyllä'),
  isStartNodeHastusStop: (value: string) => (value ? 'Kyllä' : 'Ei'),
  isStartNodeUsingBookSchedule: (value: boolean) => (value ? 'Kyllä' : 'Ei'),
  startNodeBookScheduleColumnNumber: (value?: number) => (value ? String(value) : '-'),
}

const _getNodeValue = ({
  rpLink,
  property,
}: {
  rpLink: IComparableRoutePathLink | null
  property: string
}): string => {
  if (!rpLink) return ''
  const rawValue = rpLink[property]
  const valueMapper = rpLinkValueMapperObj[property]
  return valueMapper ? valueMapper(rawValue) : rawValue
}

const _addRowToNodePropertyRows = ({
  nodePropertyRows,
  areNodesEqual,
  areEqualPropertiesVisible,
  label,
  property,
  rpLink1,
  rpLink2,
}: {
  nodePropertyRows: INodePropertyRow[]
  areNodesEqual: boolean
  areEqualPropertiesVisible: boolean
  label: string
  property: string
  rpLink1: IComparableRoutePathLink | null
  rpLink2: IComparableRoutePathLink | null
}): INodePropertyRow[] => {
  const value1 =
    rpLink1 && rpLink1.startNode.type === NodeType.STOP
      ? _getNodeValue({ property, rpLink: rpLink1 })
      : ''
  const value2 =
    rpLink2 && rpLink2.startNode.type === NodeType.STOP
      ? _getNodeValue({ property, rpLink: rpLink2 })
      : ''
  const isValueValid = (value: any) => {
    return value && (isNumber(value) || value.length > 0)
  }
  if (!isValueValid(value1) && !isValueValid(value2)) {
    return nodePropertyRows
  }

  // Equal properties are hidden only from equal nodes
  if (areNodesEqual && !areEqualPropertiesVisible && value1 === value2) {
    return nodePropertyRows
  }

  nodePropertyRows.push({
    label,
    value1,
    value2,
  })
  return nodePropertyRows
}

const _renderComparableRow = ({
  nodePropertyRow,
  key,
}: {
  nodePropertyRow: INodePropertyRow
  key: string
}) => {
  const { label, value1, value2 } = nodePropertyRow
  return <ComparableRow key={key} label={label} value1={value1} value2={value2} />
}

const _renderNodeSeparateRow = ({
  nodePropertyRow,
  key,
}: {
  nodePropertyRow: INodePropertyRow
  key: string
}) => {
  const { label, value1, value2 } = nodePropertyRow
  return (
    <div className={s.separateNodeRow} key={key}>
      <div className={s.alignContentLeft}>
        {!isEmpty(value1) && (
          <>
            <div className={s.label}>{label}</div>
            <div className={s.value}>{value1}</div>
          </>
        )}
      </div>
      <div className={s.alignContentRight}>
        {!isEmpty(value2) && (
          <>
            <div className={s.label}>{label}</div>
            <div className={s.value}>{value2}</div>
          </>
        )}
      </div>
    </div>
  )
}

export default NodeDifferencesVisualizer

export { IRoutePathLinkRow }
