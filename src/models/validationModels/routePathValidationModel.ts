const originRule = 'required|min:1|max:20|string';
const destinationRule = 'required|min:1|max:20|string';
const shortNameRule = 'required|min:1|max:20|string';
const dateRule = 'required|date';

const routePathValidationModel = {
    originFi: originRule,
    originSw: originRule,
    destinationFi: destinationRule,
    destinationSw: destinationRule,
    routePathShortName: shortNameRule,
    routePathShortNameSw: shortNameRule,
    startTime: dateRule,
    endTime: dateRule,
    direction: 'required',
    length: 'required|min:0|max:99999|numeric'
};

export default routePathValidationModel;
