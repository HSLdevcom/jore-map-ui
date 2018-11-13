import { IRoutePath } from '~/models';
import HashHelper from '~/util/hashHelper';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink.ts';
import RoutePathLinkFactory from './routePathLinkFactory';

class RoutePathFactory {
    public static createRoutePath = (
        routeId: string,
        externalRoutePath: IExternalRoutePath,
    ): IRoutePath => {
        const internalRoutePathId = HashHelper.getHashFromString(
            [
                routeId,
                externalRoutePath.suuvoimast,
                externalRoutePath.suusuunta,
            ].join('-'),
        ).toString();

        const routePathLinks = externalRoutePath.externalRoutePathLinks
            .map((externalRoutePathLink: IExternalRoutePathLink) => {
                return RoutePathLinkFactory.createRoutePathLink(externalRoutePathLink);
            });

        const coordinates = externalRoutePath.geojson ?
            JSON.parse(externalRoutePath.geojson).coordinates : null;
        const positions = coordinates
            ? coordinates.map((coor: [number, number]) => [coor[1], coor[0]]) : null;

        const routePath : IRoutePath = {
            routeId,
            positions,
            routePathLinks,
            geoJson: externalRoutePath.geojson ? JSON.parse(externalRoutePath.geojson) : null,
            lineId: externalRoutePath.lintunnus,
            internalId: internalRoutePathId,
            routePathName: externalRoutePath.suunimi,
            routePathNameSw: externalRoutePath.suunimir,
            direction: externalRoutePath.suusuunta,
            startTime: new Date(externalRoutePath.suuvoimast),
            endTime: new Date(externalRoutePath.suuvoimviimpvm),
            lastModified: new Date(externalRoutePath.suuviimpvm),
            modifiedBy: externalRoutePath.suukuka,
            visible: false,
            originFi: externalRoutePath.suulahpaik,
            originSw: externalRoutePath.suulahpaikr,
            destinationFi: externalRoutePath.suupaapaik,
            destinationSw: externalRoutePath.suupaapaikr,
            routePathShortName: externalRoutePath.suunimilyh,
            routePathShortNameSw: externalRoutePath.suunimilyhr,
        };

        return routePath;
    }

    public static createNewRoutePath(lineId: string, routeId: string): IRoutePath {
        const routePath: IRoutePath = {
            lineId,
            routeId,
            internalId: '',
            routePathName: 'Uusi reitinsuunta',
            routePathNameSw: 'Ny ruttriktning',
            direction: '1',
            positions: [[0, 0]], // TODO: remove
            geoJson: null, // TODO: remove
            visible: true,
            startTime: new Date,
            endTime: new Date,
            lastModified: new Date,
            routePathLinks: [],
            originFi: '',
            originSw: '',
            destinationFi: '',
            destinationSw: '',
            routePathShortName: '',
            routePathShortNameSw: '',
            modifiedBy: '',
        };
        return routePath;
    }
}

export default RoutePathFactory;
