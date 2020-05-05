import regexRules from '~/validation/regexRules';
import { INode } from '..';

type INodeValidationModel = { [key in keyof INode]: string };

const nodeValidationModel: INodeValidationModel = {
    id: '',
    type: 'required|min:1|max:1|string',
    shortIdString: `min:4|max:4|string|${regexRules.numbers}`,
    modifiedBy: '',
    modifiedOn: '',
    shortIdLetter: 'min:0|max:2|string',
    coordinates: 'latLngValidator',
    coordinatesProjection: 'latLngValidator',
    measurementType: '',
    measurementDate: 'date',
    stop: '',
    transitTypes: '',
    // New node properties:
    beginningOfNodeId: `required|min:4|max:4|string|${regexRules.numbers}`,
    idSuffix: `required|min:2|max:2|string|${regexRules.numbers}`,
    transitType: '',
};

export default nodeValidationModel;

export { INodeValidationModel, nodeValidationModel };
