import regexRules from '~/validation/regexRules';

const routeValidationModel = {
    id: `required|min:4|max:6|string|${regexRules.upperCaseOrNumbersOrSpace}`,
    routeName: 'required|min:1|max:60|string',
    routeNameShort: 'required|min:1|max:20|string',
    routeNameSw: 'required|min:1|max:60|string',
    routeNameShortSw: 'required|min:1|max:20|string',
    lineId: 'required|min:4|max:6|string'
};

export default routeValidationModel;
