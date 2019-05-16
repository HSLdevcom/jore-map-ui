import constants from '~/constants/constants';

const linkValidationModel = {
    municipalityCode: 'min:0|max:3|string',
    streetName: 'min:0|max:40|string',
    length: `required|min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`,
    measuredLength: `min:0|max:${constants.INTEGER_MAX_VALUE}|numeric`
};

export default linkValidationModel;
