import { ApolloQueryResult } from 'apollo-client'
import _ from 'lodash'
import Moment from 'moment'
import { compareRoutePathLinks } from '~/components/sidebar/routePathView/routePathUtils'
import EndpointPath from '~/enums/endpointPath'
import StartNodeType from '~/enums/startNodeType'
import TransitType from '~/enums/transitType'
import ViaNameFactory from '~/factories/viaNameFactory'
import ApolloClient from '~/helpers/ApolloClient'
import { IRoutePath, IViaName } from '~/models'
import { IRoutePathPrimaryKey, ISingleRoutePathSaveModel } from '~/models/IRoutePath'
import IRoutePathLink, { IRoutePathLinkSaveModel } from '~/models/IRoutePathLink'
import IViaShieldName from '~/models/IViaShieldName'
import IExternalRoutePath from '~/models/externals/IExternalRoutePath'
import HttpUtils from '~/utils/HttpUtils'
import RoutePathFactory from '../factories/routePathFactory'
import GraphqlQueries from './graphqlQueries'
import ViaNameService from './viaNameService'

interface IRoutePathLengthResponse {
  length: number
  isCalculatedFromMeasuredStopGapsOnly: boolean
  unmeasuredStopGapsList: string[][]
  missingStopGapsList: string[][]
}

interface IGetRoutePathLengthRequest {
  lineId: string
  routeId: string
  transitType: TransitType
  routePathLinks: IRoutePathLink[]
}

interface IRouteUsingRoutePathSegment {
  lineId: string
  routeId: string
}

interface IRoutePathWithDisabledInfo extends IRoutePath {
  isConnectedStartNodeDisabled: boolean // is routePathLink's startNode (that was used to fetch this routePath) disabled?
}

interface IRoutePathWithDisabledInfoQueryResponse {
  routePath: IExternalRoutePath
  startNodeType: StartNodeType
}

class RoutePathService {
  public static fetchRoutePath = async ({
    routeId,
    startDate,
    direction,
    shouldFetchViaNames,
  }: {
    routeId: string
    startDate: Date
    direction: string
    shouldFetchViaNames: boolean
  }): Promise<IRoutePath | null> => {
    const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getRoutePathQuery(),
      variables: {
        routeId,
        direction,
        startDate: Moment(startDate).format(),
      },
    })
    const externalRoutePath: IExternalRoutePath | null = queryResult.data.routePath
    if (!externalRoutePath) return null
    const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus
    const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko
    const routePath = RoutePathFactory.mapExternalRoutePath({
      externalRoutePath,
      lineId,
      transitType,
      externalRoutePathLinks:
        externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes,
    })
    if (shouldFetchViaNames) {
      const rpLinks: IRoutePathLink[] = await _fetchViaNamesForRoutePathLinks(routePath)
      routePath.routePathLinks = rpLinks
    }
    return routePath
  }

  public static fetchFirstAndLastStopNamesOfRoutePath = async (
    routePathPrimaryKey: IRoutePathPrimaryKey
  ): Promise<Object> => {
    const firstStopNameQueryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getFirstStopNameOfRoutePath(),
      variables: {
        routeId: routePathPrimaryKey.routeId,
        direction: routePathPrimaryKey.direction,
        startDate: Moment(routePathPrimaryKey.startDate).format(),
      },
    })
    const firstStopName = firstStopNameQueryResult
      ? firstStopNameQueryResult.data.get_first_stop_name_of_route_path.nodes[0]
      : '-'
    const lastStopNameQueryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getLastStopNameOfRoutePath(),
      variables: {
        routeId: routePathPrimaryKey.routeId,
        direction: routePathPrimaryKey.direction,
        startDate: Moment(routePathPrimaryKey.startDate).format(),
      },
    })
    const lastStopName = lastStopNameQueryResult
      ? lastStopNameQueryResult.data.get_last_stop_name_of_route_path.nodes[0]
      : '-'

    const stopNames = {
      firstStopName,
      lastStopName,
    }
    return stopNames
  }

  public static fetchRoutePathsUsingLinkFromDate = async (
    startNodeId: string,
    endNodeId: string,
    transitType: string,
    date: Date
  ): Promise<IRoutePath[]> => {
    const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getRoutePathsUsingLinkFromDate(),
      variables: {
        startNodeId,
        endNodeId,
        transitType,
        date,
      },
    })
    return queryResult.data.routePaths.nodes.map((externalRoutePath: IExternalRoutePath) => {
      const lineId = externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus
      const transitType = externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko
      return RoutePathFactory.mapExternalRoutePath({
        externalRoutePath,
        lineId,
        transitType,
        externalRoutePathLinks:
          externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes,
      })
    })
  }

  public static updateRoutePath = async (
    newRoutePath: IRoutePath,
    oldRoutePath: IRoutePath
  ) => {
    const routePathSaveModel = _createRoutePathSaveModel(
      _.cloneDeep(newRoutePath),
      _.cloneDeep(oldRoutePath)
    )
    await HttpUtils.updateObject(EndpointPath.ROUTE_PATH, routePathSaveModel)
  }

  public static createRoutePath = async (newRoutePath: IRoutePath) => {
    const routePathSaveModel = _createRoutePathSaveModel(_.cloneDeep(newRoutePath), null)
    const response = (await HttpUtils.createObject(
      EndpointPath.ROUTE_PATH,
      routePathSaveModel
    )) as IRoutePathPrimaryKey
    return response
  }

  public static removeRoutePath = async (routePath: IRoutePath) => {
    await HttpUtils.deleteObject(EndpointPath.ROUTE_PATH_REMOVE, routePath)
  }

  public static fetchRoutePathsUsingLink = async (
    startNodeId: string,
    endNodeId: string,
    transitType: string
  ): Promise<IRoutePathWithDisabledInfo[]> => {
    const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getRoutePathsUsingLinkQuery(),
      variables: { startNodeId, endNodeId, transitType },
    })

    const queryResultRows: IRoutePathWithDisabledInfoQueryResponse[] =
      queryResult.data.get_route_paths_using_link.nodes
    return queryResultRows.map((qrRow: IRoutePathWithDisabledInfoQueryResponse) => {
      const lineId = qrRow.routePath.reittiByReitunnus.linjaByLintunnus.lintunnus
      const transitType = qrRow.routePath.reittiByReitunnus.linjaByLintunnus.linverkko
      const routePath = RoutePathFactory.mapExternalRoutePath({
        lineId,
        transitType,
        externalRoutePath: qrRow.routePath,
        externalRoutePathLinks: [],
      })
      return {
        ...routePath,
        isConnectedStartNodeDisabled: qrRow.startNodeType === StartNodeType.DISABLED,
      }
    })
  }

  public static fetchRoutesUsingLinkSegment = async (
    startNodeId: string,
    endNodeId: string,
    transitType: string
  ): Promise<IRouteUsingRoutePathSegment[]> => {
    const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getRoutesUsingRoutePathSegment(),
      variables: { startNodeId, endNodeId, transitType },
    })
    interface IRouteUsingRoutePathSegmentQueryResult {
      lintunnus: string
      reitunnus: string
    }
    return queryResult.data.get_routes_using_route_path_segment.nodes.map(
      (queryResultRow: IRouteUsingRoutePathSegmentQueryResult) => {
        return {
          lineId: queryResultRow.lintunnus,
          routeId: queryResultRow.reitunnus,
        }
      }
    )
  }

  public static fetchRoutePathsUsingNode = async (
    nodeId: string
  ): Promise<IRoutePathWithDisabledInfo[]> => {
    const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
      query: GraphqlQueries.getRoutePathsUsingNodeQuery(),
      variables: { nodeId },
    })
    const queryResultRows: IRoutePathWithDisabledInfoQueryResponse[] =
      queryResult.data.get_route_paths_using_node.nodes
    return queryResultRows.map((qrRow: IRoutePathWithDisabledInfoQueryResponse) => {
      const lineId = qrRow.routePath.reittiByReitunnus.linjaByLintunnus.lintunnus
      const transitType = qrRow.routePath.reittiByReitunnus.linjaByLintunnus.linverkko
      const routePath = RoutePathFactory.mapExternalRoutePath({
        lineId,
        transitType,
        externalRoutePath: qrRow.routePath,
        externalRoutePathLinks: [],
      })
      return {
        ...routePath,
        isConnectedStartNodeDisabled: qrRow.startNodeType === StartNodeType.DISABLED,
      }
    })
  }

  public static fetchRoutePathLength = async (
    requestBody: IGetRoutePathLengthRequest
  ): Promise<IRoutePathLengthResponse> => {
    return await HttpUtils.postRequest(EndpointPath.ROUTE_PATH_LENGTH, requestBody)
  }
}

const _createRoutePathSaveModel = (
  newRoutePath: IRoutePath,
  oldRoutePath: IRoutePath | null
): ISingleRoutePathSaveModel => {
  const added: IRoutePathLink[] = []
  const modified: IRoutePathLink[] = []
  const removed: IRoutePathLink[] = []
  const originals: IRoutePathLink[] = []
  newRoutePath.routePathLinks.forEach((rpLink: IRoutePathLink) => {
    const foundOldRoutePathLink: IRoutePathLink | null | undefined = oldRoutePath
      ? _findRoutePathLink(oldRoutePath, rpLink)
      : null
    if (foundOldRoutePathLink) {
      const isModified = !compareRoutePathLinks(rpLink, foundOldRoutePathLink)
      // If a routePathLink is found from both newRoutePath and oldRoutePath and it has modifications, add to modified [] list
      if (isModified) {
        // Make sure we keep the old id (rpLink has temp id (including NEW_OBJECT_TAG) if link was removed and then added again)
        rpLink.id = foundOldRoutePathLink.id
        rpLink.viaNameId = foundOldRoutePathLink.id
        rpLink.viaShieldNameId = foundOldRoutePathLink.id
        modified.push(rpLink)
      } else {
        originals.push(rpLink)
      }
    } else {
      // If a routePathLink is found from newRoutePath but not in oldRoutePath, add it to added [] list
      added.push(rpLink)
    }
  })
  oldRoutePath?.routePathLinks.forEach((rpLink) => {
    const routePathLink = _findRoutePathLink(newRoutePath, rpLink)
    if (!routePathLink) {
      // If a routePathLink from oldRoutePath is not found from newRoutePath, add it to removed [] list
      removed.push(rpLink)
    }
  })

  const routePathLinkSaveModel: IRoutePathLinkSaveModel = {
    added,
    modified,
    removed,
    originals,
  }

  const routePathToSave = {
    ...newRoutePath,
  }
  delete routePathToSave['routePathLinks']

  return {
    routePathLinkSaveModel,
    routePath: routePathToSave,
  }
}

const _findRoutePathLink = (
  routePath: IRoutePath,
  routePathLink: IRoutePathLink
): IRoutePathLink | undefined => {
  return routePath.routePathLinks.find((rpLink) => {
    return (
      // Use node.internalId (node.id might be duplicated)
      rpLink.startNode.internalId === routePathLink.startNode.internalId &&
      rpLink.endNode.internalId === routePathLink.endNode.internalId
    )
  })
}

// Add fetched viaName properties to given routePath.routePathLinks
const _fetchViaNamesForRoutePathLinks = async (
  routePath: IRoutePath
): Promise<IRoutePathLink[]> => {
  try {
    let routePathLinks: IRoutePathLink[] = routePath.routePathLinks

    const viaNames: IViaName[] = await ViaNameService.fetchViaNamesByRpPrimaryKey({
      routeId: routePath.routeId,
      startDate: routePath.startDate,
      direction: routePath.direction,
    })

    const viaShieldNames: IViaShieldName[] = await ViaNameService.fetchViaShieldNamesByRpPrimaryKey(
      {
        routeId: routePath.routeId,
        startDate: routePath.startDate,
        direction: routePath.direction,
      }
    )

    routePathLinks = routePathLinks.map((routePathLink: IRoutePathLink) => {
      let viaName = viaNames.find((viaName) => viaName.viaNameId === routePathLink.id)
      const rpLinkId: number = parseInt(routePathLink.id, 10)
      viaName = viaName
        ? viaName
        : ViaNameFactory.parseExternalViaName({
            viaNameId: rpLinkId,
            externalViaName: null,
          })
      let viaShieldName = viaShieldNames.find(
        (viaShieldName) => viaShieldName.viaShieldNameId === routePathLink.id
      )
      viaShieldName = viaShieldName
        ? viaShieldName
        : ViaNameFactory.parseExternalViaShieldName({
            viaShieldNameId: rpLinkId,
            externalViaShieldName: null,
          })
      return {
        ...routePathLink,
        ...viaName,
        ...viaShieldName,
      }
    })
    return routePathLinks
  } catch (err) {
    throw 'Määränpää tietojen (via nimet ja via kilpi nimet) haku ei onnistunut.'
  }
}

export default RoutePathService

export {
  IRoutePathLengthResponse,
  IGetRoutePathLengthRequest,
  IRouteUsingRoutePathSegment,
  IRoutePathWithDisabledInfo,
}
