import { IRoutePath, IRoute, IRoutePathLink } from '~/models';
import HashHelper from '~/util/hashHelper';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink.ts';
import RoutePathLinkFactory from './routePathLinkFactory';

class RoutePathFactory {
    public static createRoutePath = (
        externalRoutePath: IExternalRoutePath,
    ): IRoutePath => {
        const internalRoutePathId = HashHelper.getHashFromString(
            [
                externalRoutePath.reitunnus,
                externalRoutePath.suuvoimast,
                externalRoutePath.suusuunta,
            ].join('-'),
        ).toString();

        let routePathLinks: IRoutePathLink[] | undefined = undefined;
        if (externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta) {
            routePathLinks = externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta
                .nodes.map((externalRoutePathLink: IExternalRoutePathLink) => {
                    return RoutePathLinkFactory.createRoutePathLink(externalRoutePathLink);
                }).sort((a, b) => a.orderNumber - b.orderNumber);
        }

        const exceptionPath =
            externalRoutePath.poikkeusreitti ? externalRoutePath.poikkeusreitti : '0';
        return {
            exceptionPath,
            routeId: externalRoutePath.reitunnus,
            routePathLinks: routePathLinks !== undefined ? routePathLinks : undefined,
            lineId: externalRoutePath.reittiByReitunnus.linjaByLintunnus.lintunnus,
            transitType: externalRoutePath.reittiByReitunnus.linjaByLintunnus.linverkko,
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
        };
    }

    public static createNewRoutePath(lineId: string, route: IRoute): IRoutePath {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);

        return {
            lineId,
            transitType: route.line!.transitType!,
            routeId: route.id,
            internalId: '',
            routePathName: route.routeName,
            routePathNameSw: route.routeNameSwedish,
            direction: '1',
            visible: true,
            startTime: new Date(defaultDate.getTime()),
            endTime: new Date(defaultDate.getTime()),
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
            exceptionPath: '0',
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
