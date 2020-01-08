import Constants from '~/constants/constants';
import IRoutePath, { IViewOnlyRoutePathProperties } from '../IRoutePath';

const originRule = 'required|min:1|max:20|string';
const destinationRule = 'required|min:1|max:20|string';
const nameRule = 'required|min:1|max:60|string';
const shortNameRule = 'required|min:1|max:20|string';
const dateRule = 'required|date';

type RoutePathKeys = keyof Pick<
    IRoutePath,
    Exclude<keyof IRoutePath, keyof IViewOnlyRoutePathProperties>
>;
type IRoutePathValidationModel = { [key in RoutePathKeys]: string };

// TODO: rename as routePathValidationObject
const routePathValidationModel: IRoutePathValidationModel = {
    routePathLinks: '',
    routeId: 'required|min:4|max:6|string',
    direction: 'required|min:1|max:1|string',
    startTime: dateRule,
    endTime: dateRule,
    originFi: originRule,
    originSw: originRule,
    destinationFi: destinationRule,
    destinationSw: destinationRule,
    length: `required|min:0|max:${Constants.INTEGER_MAX_VALUE}|numeric`,
    modifiedBy: '',
    modifiedOn: '',
    shortName: shortNameRule,
    shortNameSw: shortNameRule,
    name: nameRule,
    nameSw: nameRule,
    isStartNodeUsingBookSchedule: 'boolean',
    startNodeBookScheduleColumnNumber: 'numeric|min:0|max:99',
    exceptionPath: 'min:1|max:1|string'
};

export default routePathValidationModel;

export { IRoutePathValidationModel };
