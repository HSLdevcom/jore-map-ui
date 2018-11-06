import IRoutePathLink from './IRoutePathLink';

export default interface IRoutePath {
    internalId: string;
    routeId: string;
    lineId?: string;
    routePathName: string;
    routePathNameSw: string;
    direction: string;
    positions: [[number, number]];
    geoJson: any;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
    routePathLinks: IRoutePathLink[] | null;
    originFi: string;
    originSw: string;
    destinationFi: string;
    destinationSw: string;
    routePathShortName: string;
    routePathShortNameSw: string;
    modifiedBy: string;
    color?: string;
}
