import IRoutePathLink from './IRoutePathLink';

export default interface IRoutePath {
    internalId: string;
    routeId: string;
    routePathName: string;
    direction: string;
    positions: [[number, number]];
    geoJson: any;
    visible: boolean;
    startTime: Date;
    endTime: Date;
    lastModified: Date;
    routePathLinks: IRoutePathLink[];
}
