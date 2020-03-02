import * as L from 'leaflet';
import { IRoutePathSegmentLink } from '~/models/ILink';
import { IRoutePathSegment } from '~/models/IRoutePath';
import { IExternalRoutePathSegmentLink } from '~/models/externals/IExternalLink';

class RoutePathCopySegmentFactory {
    public static mapExternalLinksWithRoutePathInfo = (
        externalLinksWithRoutePathInfo: IExternalRoutePathSegmentLink[]
    ): IRoutePathSegment[] => {
        const routePaths: IRoutePathSegment[] = [];

        externalLinksWithRoutePathInfo.forEach((externalLink: IExternalRoutePathSegmentLink) => {
            const geoJson = JSON.parse(externalLink.geom);
            const link: IRoutePathSegmentLink = {
                geometry: L.GeoJSON.coordsToLatLngs(geoJson.coordinates),
                startNodeId: externalLink.lnkalkusolmu,
                endNodeId: externalLink.lnkloppusolmu,
                orderNumber: externalLink.reljarjnro,
                routePathLinkId: externalLink.relid
            };

            const oldRoutePath = routePaths.find(
                routePath =>
                    routePath.routeId === externalLink.reitunnus &&
                    routePath.direction === externalLink.suusuunta &&
                    routePath.startTime === externalLink.suuvoimast
            );
            if (!oldRoutePath) {
                const newRoutePath: IRoutePathSegment = {
                    routeId: externalLink.reitunnus,
                    direction: externalLink.suusuunta,
                    startTime: externalLink.suuvoimast,
                    endTime: externalLink.suuvoimviimpvm,
                    originFi: externalLink.suulahpaik,
                    destinationFi: externalLink.suupaapaik,
                    links: [link]
                };
                routePaths.push(newRoutePath);
            } else {
                oldRoutePath.links.push(link);
            }
        });

        return routePaths;
    };
}

export default RoutePathCopySegmentFactory;
