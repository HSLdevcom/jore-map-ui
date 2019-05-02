import * as L from 'leaflet';
import { ICopySegmentRoutePath, ICopySegmentLink } from '~/stores/routePathCopySegmentStore';

interface IExternalLinkWithRoutePathInfo {
    reitunnus: string;
    suusuunta: string;
    suuvoimast: Date;
    relid: number;
    reljarjnro: number;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    suuvoimviimpvm: Date;
    suulahpaik: string;
    suupaapaik: string;
    geom: string;
}

class RoutePathCopySegmentFactory {
    public static mapExternalLinksWithRoutePathInfo = (
        externalLinksWithRoutePathInfo: IExternalLinkWithRoutePathInfo[],
    ): ICopySegmentRoutePath[] => {
        const routePaths: ICopySegmentRoutePath[] = [];

        externalLinksWithRoutePathInfo.forEach((externalLink: IExternalLinkWithRoutePathInfo) => {
            const geoJson = JSON.parse(externalLink.geom);
            const link: ICopySegmentLink = {
                geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
                startNodeId: externalLink.lnkalkusolmu,
                endNodeId: externalLink.lnkloppusolmu,
                orderNumber: externalLink.reljarjnro,
                routePathLinkId: externalLink.relid,
            };

            const oldRoutePath = routePaths.find(routePath =>
                routePath.routeId === externalLink.reitunnus
                && routePath.direction === externalLink.suusuunta
                && routePath.startTime === externalLink.suuvoimast,
            );
            if (!oldRoutePath) {
                const newRoutePath: ICopySegmentRoutePath = {
                    routeId: externalLink.reitunnus,
                    direction: externalLink.suusuunta,
                    startTime: externalLink.suuvoimast,
                    endTime: externalLink.suuvoimviimpvm,
                    originFi: externalLink.suulahpaik,
                    destinationFi: externalLink.suupaapaik,
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

export default RoutePathCopySegmentFactory;
