import constants from '../../constants/constants';
import IRoutePathLink from '../IRoutePathLink';

type IRoutePathLinkValidationModel = { [key in keyof IRoutePathLink]: string };

const routePathLinkValidationModel: IRoutePathLinkValidationModel = {
    id: '',
    geometry: '',
    orderNumber: `required|min:1|max:${constants.SMALL_INT_MAX_VALUE}|numeric`,
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
    destinationSw2: 'max:30|string',
    destinationShieldFi: 'max:30|string',
    destinationShieldSw: 'max:30|string'
};

export default routePathLinkValidationModel;

export { IRoutePathLinkValidationModel };
