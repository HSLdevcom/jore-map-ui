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

        const routePathLinks = externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta
            .nodes.map((externalRoutePathLink: IExternalRoutePathLink) => {
                return RoutePathLinkFactory.createRoutePathLink(externalRoutePathLink);
            });

        return {
            routeId,
            routePathLinks,
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
            length: externalRoutePath.suupituus,
            alternativePath: externalRoutePath.poikkeusreitti === '1',
        };
    }

    public static createNewRoutePath(lineId: string, routeId: string): IRoutePath {
        return {
            lineId,
            routeId,
            internalId: '',
            routePathName: 'Uusi reitinsuunta',
            routePathNameSw: 'Ny ruttriktning',
            direction: '1',
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
            length: 0,
            alternativePath: false,
        };
    }

    public static createNewRoutePathFromOld(routePath: IRoutePath): IRoutePath {
        const startTime = routePath.startTime;
        startTime.setDate(startTime.getDate() + 1);
        return {
            ...routePath,
            // TODO: this is only temporary, but required since starttime is part of ID
            startTime,
        };
    }
}

export default RoutePathFactory;
