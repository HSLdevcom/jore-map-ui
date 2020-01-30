import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';

class NavigationUtils {
    public static openLineView = (lineId: string) => {
        const lineViewLink = routeBuilder
            .to(SubSites.line)
            .toTarget(':id', lineId)
            .toLink();
        navigator.goTo({ link: lineViewLink });
    };

    public static openRouteView = (routeId: string) => {
        const routeViewLink = routeBuilder
            .to(SubSites.routes)
            .append(QueryParams.routes, routeId)
            .toLink();
        navigator.goTo({ link: routeViewLink });
    };
}
export default NavigationUtils;
