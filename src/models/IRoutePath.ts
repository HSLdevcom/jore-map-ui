import TransitType from '~/enums/transitType';
import { IValidationResult } from '~/validation/FormValidator';
import IRoutePathLink, { IRoutePathLinkSaveModel, IRoutePathSegmentLink } from './IRoutePathLink';

interface IRoutePathPrimaryKey {
    routeId: string;
    direction: string;
    startDate: Date;
}

interface IViewOnlyRoutePathProperties {
    internalId: string;
    color?: string;
    isVisible?: boolean;
    transitType?: TransitType; // Same as ILine's transitType (not the same as IRoutePathLink's transitType)
    lineId?: string;
}

interface IRoutePath extends IRoutePathPrimaryKey, IViewOnlyRoutePathProperties {
    routePathLinks: IRoutePathLink[];
    nameFi: string;
    nameSw: string;
    endDate: Date;
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
    isStartDateSet: boolean;
    isEndDateSet: boolean;
}

interface IRoutePathSegment extends IRoutePathPrimaryKey {
    endDate: Date;
    originFi: string;
    destinationFi: string;
    links: IRoutePathSegmentLink[];
}

interface IRoutePathSaveModel {
    originalPrimaryKey: IRoutePathPrimaryKey; // Used when editing primarykey or copying routePaths
    routePath: Omit<IRoutePath, 'routePathLinks'>;
    routePathLinkSaveModel?: IRoutePathLinkSaveModel;
}

interface IMultipleRoutePathSaveModel {
    routeId: string;
    added: IRoutePathSaveModel[];
    modified: IRoutePathSaveModel[];
    originals: IRoutePathSaveModel[];
}

export default IRoutePath;

export {
    IRoutePathPrimaryKey,
    IViewOnlyRoutePathProperties,
    IMassEditRoutePath,
    IRoutePathSegment,
    IRoutePathSaveModel,
    IMultipleRoutePathSaveModel,
};
