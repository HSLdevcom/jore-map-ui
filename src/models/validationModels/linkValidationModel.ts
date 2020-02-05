import constants from '~/constants/constants';
import { ILink } from '..';

type ILinkValidationModel = { [key in keyof ILink]: string };

// TODO: rename as linkValidationObject
const linkValidationModel: ILinkValidationModel = {
    transitType: '',
    startNode: '',
    endNode: '',
    geometry: '',
    streetName: 'min:0|max:40|string',
    length: `required|min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`,
    measuredLength: `min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`,
    modifiedBy: '',
    modifiedOn: ''
};

export default linkValidationModel;

export { ILinkValidationModel };
