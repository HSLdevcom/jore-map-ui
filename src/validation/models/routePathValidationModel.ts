const routePathValidationModel = {
    nameFi: 'required|min:1|max:60|string',
    // TODO: These length limits are only made up
    length: 'required|numeric|min:1|max:100000',
};

export default routePathValidationModel;
