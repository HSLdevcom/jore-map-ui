import IRoutePathLink from './IRoutePathLink';

export default interface IRoutePath {
    internalId: string;
    routeId: string;
    lineId?: string;
    routePathLinks: IRoutePathLink[] | null;
    routePathName: string;
    routePathNameSw: string;
    direction: string;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
    originFi: string;
    originSw: string;
    destinationFi: string;
    destinationSw: string;
    routePathShortName: string;
    routePathShortNameSw: string;
    modifiedBy: string;
    color?: string;
}
