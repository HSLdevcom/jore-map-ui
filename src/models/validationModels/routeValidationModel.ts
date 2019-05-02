const routeValidationModel = {
    id: 'required|min:4|max:6|string', // TODO: Accepts only " " (empty space), 0...9, A - Ö
    routeName: 'required|min:1|max:60|string',
    routeNameShort: 'required|min:1|max:20|string',
    routeNameSw: 'required|min:1|max:60|string',
    routeNameShortSw: 'required|min:1|max:20|string',
    lineId: 'required|min:4|max:6|string',
};

export default routeValidationModel;
