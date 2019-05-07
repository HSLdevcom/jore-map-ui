import Constants from '../../constants/constants';

const routePathLinkValidationModel = {
    id: `required|min:1|max:${Constants.INTEGER_MAX_VALUE}|numeric`,
    routePathDirection: 'required|min:1|max:1|string',
    routePathStartDate: 'required|date',
    orderNumber: `required|min:1|max:${Constants.SMALL_INT_MAX_VALUE}|numeric`,
    startNodeType: 'required|min:1|max:1|string',
    transitType: 'required|min:1|max:1|string',
    isStartNodeTimeAlignmentStop: 'boolean',
    isStartNodeHastusStop: 'boolean',
    isAtBookSchedule: 'boolean',
    startNodeColumnNumber: 'numeric|max:99'
};

export default routePathLinkValidationModel;
