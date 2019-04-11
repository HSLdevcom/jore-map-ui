import Constants from '~/constants/constants';

const linkValidationModel = {
    id: 'required|min:4|max:6|string',
    lineBasicRoute: 'required|min:4|max:6|string',
    lineStartDate: 'required|date',
    lineEndDate: 'required|date',
    publicTransportType: 'required|min:2|max:2|string',
    clientOrganization: 'required|min:3|max:3|string',
    transitType: 'required|min:1|max:1|string',
    publicTransportDestination: 'required|min:1|max:6|string',
    exchangeTime: `required|min:0|max:${Constants.INTEGER_MAX_VALUE}|numeric`,
    lineReplacementType: 'required|min:0|max:2|string',
};

export default linkValidationModel;
