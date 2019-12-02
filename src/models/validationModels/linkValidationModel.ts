import constants from '~/constants/constants';
import { ILink } from '..';

type LinkKeys = keyof ILink;
type ILinkValidationModel = { [key in LinkKeys]: string };

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
