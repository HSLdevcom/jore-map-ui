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
    routePathLinks: IRoutePathLink[]; // TODO: change to be never undefined
    name: string;
    nameSw: string;
    endTime: Date;
    originFi: string;
    originSw: string;
    destinationFi: string;
    destinationSw: string;
    shortName: string;
    shortNameSw: string;
    length: number;
    exceptionPath: string;
    isStartNodeUsingBookSchedule: boolean;
    startNodeBookScheduleColumnNumber: number | null;
}

export { IRoutePathPrimaryKey };
