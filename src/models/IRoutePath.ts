import TransitType from '~/enums/transitType';
import IRoutePathLink, { IRoutePathLinkSaveModel, IRoutePathSegmentLink } from './IRoutePathLink';
import IViaName from './IViaName';

interface IRoutePathPrimaryKey {
    routeId: string;
    direction: string;
    startTime: Date;
}

interface IViewOnlyRoutePathProperties {
    internalId: string;
    color?: string;
    visible: boolean;
    transitType?: TransitType;
    lineId?: string;
}

interface IRoutePath extends IRoutePathPrimaryKey, IViewOnlyRoutePathProperties {
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

interface IRoutePathSegment extends IRoutePathPrimaryKey {
    endTime: Date;
    originFi: string;
    destinationFi: string;
    links: IRoutePathSegmentLink[];
}

interface IRoutePathSaveModel {
    routePath: Omit<IRoutePath, 'routePathLinks'>;
    routePathLinkSaveModel: IRoutePathLinkSaveModel;
    viaNames: IViaName[];
}

export default IRoutePath;

export {
    IRoutePathPrimaryKey,
    IViewOnlyRoutePathProperties,
    IRoutePathSegment,
    IRoutePathSaveModel
};
