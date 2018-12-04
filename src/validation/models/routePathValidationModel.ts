const routePathValidationModel = {
    nameFi: 'required|min:1|max:60|string',
    // TODO: These length limits are only made up
    length: 'required|min:1|max:1000|numeric',
};

export default routePathValidationModel;
