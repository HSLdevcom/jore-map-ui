import Constants from '~/constants/constants';
import regexRules from '~/validation/regexRules';
import { ILine } from '..';

type ILineValidationModel = { [key in keyof ILine]: string };

// TODO: rename as lineValidationObject
const lineValidationModel: ILineValidationModel = {
    id: `required|min:4|max:6|string|${regexRules.upperCaseOrNumbersOrSpace}`,
    transitType: 'required|min:1|max:1|string',
    lineBasicRoute: 'required|min:4|max:6|string',
    publicTransportType: 'required|min:2|max:2|string',
    clientOrganization: 'required|min:3|max:3|string',
    modifiedBy: '',
    modifiedOn: '',
    publicTransportDestination: 'min:1|max:6|string',
    exchangeTime: `min:0|max:${Constants.INTEGER_MAX_VALUE}|numeric`,
    lineReplacementType: 'min:0|max:2|string'
};

export default lineValidationModel;

export { ILineValidationModel };
