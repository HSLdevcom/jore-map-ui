import regexRules from '~/validation/regexRules';
import IStop from '../IStop';
import constants from '../../constants/constants';

const nameRule = 'required|min:1|max:20|string';
const placeNameRule = 'min:1|max:20|string';
const longNameRule = 'min:1|max:60|string';

type StopKeys = keyof IStop;
type IStopValidationModel = { [key in StopKeys]: string };

const stopValidationModel: IStopValidationModel = {
    nodeId: '',
    municipality: 'required|min:1|max:3|string',
    nameFi: nameRule,
    nameSe: nameRule,
    placeNameFi: placeNameRule,
    placeNameSe: placeNameRule,
    addressFi: nameRule,
    addressSe: nameRule,
    modifiedBy: '',
    modifiedOn: '',
    platform: 'min:0|max:3|string',
    radius: `required|min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`,
    hastusId: 'min:0|max:6|string',
    areaId: 'min:0|max:6|string',
    elyNumber: `min:0|max:10|string|${regexRules.numbers}`,
    nameLongFi: longNameRule,
    nameLongSe: longNameRule,
    nameModifiedOn: '',
    section: 'required|min:1|max:6|string',
    postalNumber: 'min:0|max:5|string',
    transitType: 'min:0|max:1|string'
};

export default stopValidationModel;
