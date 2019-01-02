const routePathValidationModel = {
    source: 'required|min:1|max:60|string',
    destination: 'required|min:1|max:60|string',
    length: 'required|numeric|min:0|max:99999',
};

export default routePathValidationModel;
