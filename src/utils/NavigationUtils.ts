import TransitType from '~/enums/transitType';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';

class NavigationUtils {
    public static openLineView = ({ lineId }: { lineId: string }) => {
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo({
            link: lineViewLink
        });
    };

    public static openRouteView = ({
        routeId,
        queryValues
    }: {
        routeId: string;
        queryValues?: any;
    }) => {
        const routeViewLink = routeBuilder
            .to(SubSites.routes, queryValues)
            .append(QueryParams.routes, routeId)
            .toLink();
        navigator.goTo({
            link: routeViewLink
        });
    };

    public static openNodeView = ({ nodeId }: { nodeId: string }) => {
        const nodeViewLink = routeBuilder
            .to(SubSites.node)
            .toTarget(':id', nodeId)
            .toLink();
        navigator.goTo({
            link: nodeViewLink
        });
    };

    public static openLinkView = ({
        startNodeId,
        endNodeId,
        transitType
    }: {
        startNodeId: string;
        endNodeId: string;
        transitType: TransitType;
    }) => {
        const linkViewLink = routeBuilder
            .to(SubSites.link)
            .toTarget(':id', [startNodeId, endNodeId, transitType].join(','))
            .toLink();
        navigator.goTo({
            link: linkViewLink
        });
    };
}
export default NavigationUtils;
