import TransitType from '~/enums/transitType'
import navigator from '~/routing/navigator'
import QueryParams from '~/routing/queryParams'
import routeBuilder from '~/routing/routeBuilder'
import SubSites from '~/routing/subSites'

class NavigationUtils {
  public static openLineView = ({ lineId }: { lineId: string }) => {
    const lineViewLink = routeBuilder.to(SubSites.line).toTarget(':id', lineId).toLink()
    navigator.goTo({
      link: lineViewLink,
    })
  }

  public static openRouteView = ({
    routeId,
    queryValues,
    shouldSkipUnsavedChangesPrompt,
  }: {
    routeId: string
    queryValues?: any
    shouldSkipUnsavedChangesPrompt?: boolean
  }) => {
    const routes = queryValues?.routes
    const isRouteIdAlreadyInQueryValues = routes && routes.includes(routeId)

    let routeViewLink
    if (isRouteIdAlreadyInQueryValues) {
      routeViewLink = routeBuilder.to(SubSites.routes, queryValues).toLink()
    } else {
      routeViewLink = routeBuilder
        .to(SubSites.routes, queryValues)
        .append(QueryParams.routes, routeId)
        .toLink()
    }
    navigator.goTo({
      link: routeViewLink,
      shouldSkipUnsavedChangesPrompt: Boolean(shouldSkipUnsavedChangesPrompt),
    })
  }

  public static openNodeView = ({ nodeId }: { nodeId: string }) => {
    const nodeViewLink = routeBuilder.to(SubSites.node).toTarget(':id', nodeId).toLink()
    navigator.goTo({
      link: nodeViewLink,
    })
  }

  public static openLinkView = ({
    startNodeId,
    endNodeId,
    transitType,
  }: {
    startNodeId: string
    endNodeId: string
    transitType: TransitType
  }) => {
    const linkViewLink = routeBuilder
      .to(SubSites.link)
      .toTarget(':id', [startNodeId, endNodeId, transitType].join(','))
      .toLink()
    navigator.goTo({
      link: linkViewLink,
    })
  }
}
export default NavigationUtils
