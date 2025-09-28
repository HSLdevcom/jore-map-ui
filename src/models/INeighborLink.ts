import IRoutePath from './IRoutePath'
import IRoutePathLink from './IRoutePathLink'

interface INeighborLink {
  nodeUsageRoutePaths: IRoutePath[]
  routePathLink: IRoutePathLink
}

export default INeighborLink
