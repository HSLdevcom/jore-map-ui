import TransitType from '~/enums/transitType';
import IRoutePathLink from './IRoutePathLink';

interface IRoutePathPrimaryKey {
    routeId: string;
    direction: string;
    startTime: Date;
}

interface IViewOnlyProperties {
    internalId: string;
    color?: string;
    modifiedOn: Date;
    visible: boolean;
    transitType: TransitType;
    modifiedBy: string;
}

export default interface IRoutePath
    extends IRoutePathPrimaryKey,
        IViewOnlyProperties {
    lineId: string;
    routePathLinks?: IRoutePathLink[]; // TODO: change to be never undefined
    routePathName: string; // TODO: rename as name
    routePathNameSw: string; // TODO: rename as nameSw
    endTime: Date;
    originFi: string;
    originSw: string;
    destinationFi: string;
    destinationSw: string;
    routePathShortName: string; // TODO: rename as shortName
    routePathShortNameSw: string; // TODO: rename as shortNameSw
    length: number;
    exceptionPath: string;
    isStartNodeUsingBookSchedule: boolean;
    startNodeBookScheduleColumnNumber: number | null;
}

export { IRoutePathPrimaryKey };
