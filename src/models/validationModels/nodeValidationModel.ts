import regexRules from '~/validation/regexRules';
import { INode } from '..';

type NodeKeys = keyof INode;
type INodeValidationModel = { [key in NodeKeys]: string };

const nodeValidationModel: INodeValidationModel = {
    id: '',
    type: 'required|min:1|max:1|string',
    shortIdString: `min:0|max:4|string|${regexRules.numbers}`,
    tripTimePoint: 'min:0|max:1|string',
    modifiedBy: '',
    modifiedOn: '',
    shortIdLetter: 'min:0|max:2|string',
    coordinates: 'latLngValidator',
    coordinatesManual: 'latLngValidator',
    coordinatesProjection: 'latLngValidator',
    measurementType: 'min:0|max:1|string',
    measurementDate: 'date',
    stop: '',
    transitTypes: ''
};

export default nodeValidationModel;
