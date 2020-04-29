import TransitType from '~/enums/transitType';
import { IValidationResult } from '~/validation/FormValidator';
import IRoutePathLink, { IRoutePathLinkSaveModel, IRoutePathSegmentLink } from './IRoutePathLink';

interface IRoutePathPrimaryKey {
    routeId: string;
    direction: string;
    startTime: Date;
}

interface IViewOnlyRoutePathProperties {
    internalId: string;
    color?: string;
    visible?: boolean; // TODO: rename as isVisible
    transitType?: TransitType;
    lineId?: string;
}

interface IRoutePath extends IRoutePathPrimaryKey, IViewOnlyRoutePathProperties {
    routePathLinks: IRoutePathLink[];
    nameFi: string;
    nameSw: string;
    endTime: Date;
    originFi: string;
    originSw: string;
    destinationFi: string;
    destinationSw: string;
    shortNameFi: string;
    shortNameSw: string;
    length: number;
    isStartNodeUsingBookSchedule?: boolean;
    startNodeBookScheduleColumnNumber?: number;
    exceptionPath?: string;
    modifiedOn?: Date;
    modifiedBy?: string;
}

interface IMassEditRoutePath {
    id: string;
    routePath: IRoutePath;
    oldRoutePath?: IRoutePath;
    validationResult: IValidationResult;
    isNew: boolean;
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
}

export default IRoutePath;

export {
    IRoutePathPrimaryKey,
    IViewOnlyRoutePathProperties,
    IMassEditRoutePath,
    IRoutePathSegment,
    IRoutePathSaveModel,
};
