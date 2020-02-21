import constants from '~/constants/constants';
import { ILink } from '..';

type ILinkValidationModel = { [key in keyof ILink]: string };

const linkValidationModel: ILinkValidationModel = {
    transitType: '',
    startNode: '',
    endNode: '',
    geometry: '',
    length: `required|min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`,
    measuredLength: `min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`,
    modifiedBy: '',
    modifiedOn: ''
};

export default linkValidationModel;

export { ILinkValidationModel };
