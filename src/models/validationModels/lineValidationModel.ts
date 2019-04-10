const linkValidationModel = {
    id: 'required|min:4|max:6|string',
    lineBasicRoute: 'required|min:4|max:6|string',
    lineStartDate: 'required|min:1|max:99999|string', // TODO: timestamp max length?
    lineEndDate: 'required|min:1|max:99999|string', // TODO: timestamp max length?
    publicTransportType: 'required|min:2|max:2|string',
    clientOrganization: 'required|min:3|max:3|string',
    transitType: 'required|min:1|max:1|string',
    lineGroup: 'required|min:3|max:3|string',
    publicTransportDestination: 'required|min:1|max:6|string',
    exchangeTime: 'required|min:0|max:99999|numeric', // TODO: integer max length?
    lineReplacementType: 'required|min:0|max:2|string',
};

export default linkValidationModel;
