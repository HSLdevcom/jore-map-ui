const originRule = 'required|min:1|max:20|string';
const destinationRule = 'required|min:1|max:20|string';
const shortNameRule = 'required|min:1|max:20|string';
const dateRule = 'required|date';

const routePathValidationModel = {
    direction: 'required|min:1|max:1|string',
    startTime: dateRule,
    originFi: originRule,
    originSw: originRule,
    destinationFi: destinationRule,
    destinationSw: destinationRule,
    routePathShortName: shortNameRule,
    routePathShortNameSw: shortNameRule,
    endTime: dateRule,
    length: 'required|min:0|max:99999|numeric',
    isStartNodeUsingBookSchedule: 'boolean',
    startNodeBookScheduleColumnNumber: 'numeric|min:1|max:99'
};

export default routePathValidationModel;
