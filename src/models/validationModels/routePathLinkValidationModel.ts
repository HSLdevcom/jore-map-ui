import { IRoutePathLink } from '..';
import Constants from '../../constants/constants';

type RoutePathLinkKeys = keyof IRoutePathLink;
type IRoutePathLinkValidationModel = { [key in RoutePathLinkKeys]: string };

const routePathLinkValidationModel: IRoutePathLinkValidationModel = {
    id: '',
    geometry: '',
    orderNumber: `required|min:1|max:${Constants.SMALL_INT_MAX_VALUE}|numeric`,
    transitType: 'required|min:1|max:1|string',
    startNode: '',
    endNode: '',
    startNodeUsage: 'min:1|max:1|string',
    startNodeType: 'required|min:1|max:1|string',
    startNodeTimeAlignmentStop: 'required|min:1|max:1|string',
    isStartNodeHastusStop: 'boolean',
    isStartNodeUsingBookSchedule: 'boolean',
    startNodeBookScheduleColumnNumber: 'numeric|min:1|max:99',
    modifiedBy: '',
    modifiedOn: '',
    viaNameId: `string`,
    destinationFi1: 'max:30|string',
    destinationFi2: 'max:30|string',
    destinationSw1: 'max:30|string',
    destinationSw2: 'max:30|string'
};

export default routePathLinkValidationModel;

export { IRoutePathLinkValidationModel };
