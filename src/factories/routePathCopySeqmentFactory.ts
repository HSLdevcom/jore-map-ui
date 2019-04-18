import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import { CopySeqmentRoutePath, CopySeqmentLink } from '~/stores/routePathCopySeqmentStore';

interface IExternalLinkWithRoutePathInfo {
    reitunnus: string;
    suusuunta: string;
    suuvoimast: Date;
    reljarjnro: number;
    lnkverkko: TransitType;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    geom: string;
}

class RoutePathCopySeqmentFactory {
    public static mapExternalLinksWithRoutePathInfo = (
        externalLinksWithRoutePathInfo: IExternalLinkWithRoutePathInfo[],
    ): CopySeqmentRoutePath[] => {
        const routePaths: CopySeqmentRoutePath[] = [];

        externalLinksWithRoutePathInfo.forEach((externalLink: IExternalLinkWithRoutePathInfo) => {
            const geoJson = JSON.parse(externalLink.geom);
            const link: CopySeqmentLink = {
                geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
                startNodeId: externalLink.lnkalkusolmu,
                endNodeId: externalLink.lnkloppusolmu,
                orderNumber: externalLink.reljarjnro,
            };

            const oldRoutePath = routePaths.find(routePath =>
                routePath.routeId === externalLink.reitunnus
                && routePath.direction === externalLink.suusuunta
                && routePath.startTime === externalLink.suuvoimast,
            );
            if (!oldRoutePath) {
                const newRoutePath: CopySeqmentRoutePath = {
                    routeId: externalLink.reitunnus,
                    direction: externalLink.suusuunta,
                    startTime: externalLink.suuvoimast,
                    transitType: externalLink.lnkverkko,
                    links: [link],
                };
                routePaths.push(newRoutePath);
            } else {
                oldRoutePath.links.push(link);
            }
        });

        return routePaths;
    }
}

export default RoutePathCopySeqmentFactory;
