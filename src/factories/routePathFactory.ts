import TransitType from '~/enums/transitType';
import { IRoutePath, IRoutePathLink } from '~/models';
import { IRoutePathPrimaryKey } from '~/models/IRoutePath';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink.ts';
import HashUtils from '~/utils/HashUtils';
import RoutePathLinkFactory from './routePathLinkFactory';

class RoutePathFactory {
    public static mapExternalRoutePathToRoutePathPrimaryKey = (
        externalRoutePath: IExternalRoutePath
    ): IRoutePathPrimaryKey => {
        return {
            routeId: externalRoutePath.reitunnus,
            direction: externalRoutePath.suusuunta,
            startTime: new Date(externalRoutePath.suuvoimast),
        };
    };

    public static mapExternalRoutePath = (
        externalRoutePath: IExternalRoutePath,
        lineId?: string,
        transitType?: TransitType
    ): IRoutePath => {
        const internalRoutePathId = HashUtils.getHashFromString(
            [
                externalRoutePath.reitunnus,
                externalRoutePath.suuvoimast,
                externalRoutePath.suusuunta,
            ].join('-')
        ).toString();

        let routePathLinks: IRoutePathLink[] = [];
        if (externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta) {
            routePathLinks = externalRoutePath.reitinlinkkisByReitunnusAndSuuvoimastAndSuusuunta.nodes
                .map((externalRoutePathLink: IExternalRoutePathLink) => {
                    return RoutePathLinkFactory.mapExternalRoutePathLink(externalRoutePathLink);
                })
                .sort((a, b) => a.orderNumber - b.orderNumber);
        }

        const exceptionPath = externalRoutePath.poikkeusreitti
            ? externalRoutePath.poikkeusreitti
            : '0';

        return {
            exceptionPath,
            lineId,
            transitType,
            routeId: externalRoutePath.reitunnus,
            direction: externalRoutePath.suusuunta,
            startTime: new Date(externalRoutePath.suuvoimast),
            routePathLinks: routePathLinks ? routePathLinks : [],
            internalId: internalRoutePathId,
            nameFi: externalRoutePath.suunimi,
            nameSw: externalRoutePath.suunimir,
            endTime: new Date(externalRoutePath.suuvoimviimpvm),
            modifiedOn: externalRoutePath.suuviimpvm
                ? new Date(externalRoutePath.suuviimpvm)
                : undefined,
            modifiedBy: externalRoutePath.suukuka,
            visible: false,
            originFi: externalRoutePath.suulahpaik,
            originSw: externalRoutePath.suulahpaikr,
            destinationFi: externalRoutePath.suupaapaik,
            destinationSw: externalRoutePath.suupaapaikr,
            shortNameFi: externalRoutePath.suunimilyh,
            shortNameSw: externalRoutePath.suunimilyhr,
            length: externalRoutePath.suupituus,
            isStartNodeUsingBookSchedule: externalRoutePath.kirjaan === '1',
            startNodeBookScheduleColumnNumber: externalRoutePath.kirjasarake,
        };
    };

    public static createNewRoutePath(
        lineId: string,
        routeId: string,
        transitType: TransitType
    ): IRoutePath {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);

        return {
            lineId,
            routeId,
            transitType,
            internalId: '',
            nameFi: '',
            nameSw: '',
            direction: '',
            visible: true,
            startTime: new Date(defaultDate.getTime()),
            endTime: new Date(defaultDate.getTime()),
            modifiedOn: new Date(),
            routePathLinks: [],
            originFi: '',
            originSw: '',
            destinationFi: '',
            destinationSw: '',
            shortNameFi: '',
            shortNameSw: '',
            modifiedBy: '',
            length: 0,
            exceptionPath: '0',
            isStartNodeUsingBookSchedule: false,
            startNodeBookScheduleColumnNumber: undefined,
        };
    }

    // TODO: remove (this is deprecated)
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
