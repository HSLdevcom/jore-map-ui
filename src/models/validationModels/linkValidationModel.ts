const linkValidationModel = {
    osNumber: 'required|min:0|max:99999|numeric', // TODO: These are just made up
    streetName: 'required|min:0|max:99999|string', // TODO: These are just made up
    streetNumber: 'required|min:0|max:99999|numeric', // TODO: These are just made up
    length: 'required|min:0|max:99999|numeric' // TODO: These are just made up
};

export default linkValidationModel;
