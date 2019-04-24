import * as L from 'leaflet';
import TransitType from '~/enums/transitType';
import { ICopySeqmentRoutePath, ICopySeqmentLink } from '~/stores/routePathCopySeqmentStore';

interface IExternalLinkWithRoutePathInfo {
    reitunnus: string;
    suusuunta: string;
    suuvoimast: Date;
    relid: number;
    reljarjnro: number;
    lnkverkko: TransitType;
    lnkalkusolmu: string;
    lnkloppusolmu: string;
    suuvoimviimpvm: Date;
    suulahpaik: string;
    suupaapaik: string;
    geom: string;
}

class RoutePathCopySeqmentFactory {
    public static mapExternalLinksWithRoutePathInfo = (
        externalLinksWithRoutePathInfo: IExternalLinkWithRoutePathInfo[],
    ): ICopySeqmentRoutePath[] => {
        const routePaths: ICopySeqmentRoutePath[] = [];

        externalLinksWithRoutePathInfo.forEach((externalLink: IExternalLinkWithRoutePathInfo) => {
            const geoJson = JSON.parse(externalLink.geom);
            const link: ICopySeqmentLink = {
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
                const newRoutePath: ICopySeqmentRoutePath = {
                    routeId: externalLink.reitunnus,
                    direction: externalLink.suusuunta,
                    startTime: externalLink.suuvoimast,
                    transitType: externalLink.lnkverkko,
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

export default RoutePathCopySeqmentFactory;
