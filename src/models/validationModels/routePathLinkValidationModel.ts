import Constants from '../../constants/constants';

const routePathLinkValidationModel = {
    routePathDirection: 'required|min:1|max:1|string',
    routePathStartDate: 'required|date',
    orderNumber: `required|min:1|max:${Constants.SMALL_INT_MAX_VALUE}|numeric`,
    transitType: 'required|min:1|max:1|string',
    startNodeUsage: 'min:1|max:1|string',
    isStartNodeDisabled: 'required|boolean',
    startNodeTimeAlignmentStop: 'required|min:1|max:1|string',
    isStartNodeHastusStop: 'boolean',
    isStartNodeUsingBookSchedule: 'boolean',
    startNodeBookScheduleColumnNumber: 'numeric|min:1|max:99'
};

export default routePathLinkValidationModel;
