const routePathValidationModel = {
    source: 'required|min:1|max:20|string',
    destination: 'required|min:1|max:20|string',
    length: 'required|numeric|min:0|max:99999',
    shortName: 'required|min:1|max:20|string',
};

export default routePathValidationModel;
