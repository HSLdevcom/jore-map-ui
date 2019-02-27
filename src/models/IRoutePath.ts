import TransitType from '~/enums/transitType';
import IRoutePathLink from './IRoutePathLink';

interface IViewOnlyProperties {
    internalId: string;
    color?: string;
    lastModified: Date;
    visible: boolean;
    transitType: TransitType;
    modifiedBy: string;
}

export default interface IRoutePath extends IViewOnlyProperties {
    routeId: string;
    lineId: string;
    routePathLinks?: IRoutePathLink[]; // TODO: change to be never undefined
    routePathName: string;
    routePathNameSw: string;
    direction: string;
    startTime: Date;
    endTime: Date;
    originFi: string;
    originSw: string;
    destinationFi: string;
    destinationSw: string;
    routePathShortName: string;
    routePathShortNameSw: string;
    length: number;
    exceptionPath: string;
}
