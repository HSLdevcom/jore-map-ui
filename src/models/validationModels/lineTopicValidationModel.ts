import regexRules from '~/validation/regexRules';
import { ILineTopic } from '..';

type LineTopicKeys = keyof ILineTopic;
type ILineTopicValidationModel = { [key in LineTopicKeys]: string };

const lineTopicValidationModel: ILineTopicValidationModel = {
    lineId: `required|min:4|max:6|string|${
        regexRules.upperCaseOrNumbersOrSpace
    }`,
    startDate: 'required|date',
    endDate: 'required|date',
    lineNameFi: 'min:0|max:60|string',
    lineShortNameFi: 'min:0|max:20|string',
    lineNameSw: 'min:0|max:60|string',
    lineShortNameSw: 'min:0|max:20|string',
    lineStartPlace1Fi: 'min:0|max:30|string',
    lineStartPlace1Sw: 'min:0|max:30|string',
    lineStartPlace2Fi: 'min:0|max:30|string',
    lineStartPlace2Sw: 'min:0|max:30|string',
    modifiedBy: 'min:0|max:20|string',
    modifiedOn: ''
};

export default lineTopicValidationModel;
