import TransitType from '~/enums/transitType';
import IRoutePathLink from './IRoutePathLink';

interface IRoutePathPrimaryKey {
    routeId: string;
    direction: string;
    startTime: Date;
}

interface IViewOnlyRoutePathProperties {
    internalId: string;
    color?: string;
    visible: boolean;
    transitType: TransitType;
    lineId: string;
}

export default interface IRoutePath
    extends IRoutePathPrimaryKey,
        IViewOnlyRoutePathProperties {
    routePathLinks: IRoutePathLink[];
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
    isStartNodeUsingBookSchedule?: boolean;
    startNodeBookScheduleColumnNumber?: number;
    exceptionPath?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
}

export { IRoutePathPrimaryKey, IViewOnlyRoutePathProperties };
