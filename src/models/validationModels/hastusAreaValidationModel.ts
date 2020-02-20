import IHastusArea from '../IHastusArea';

type IHastusAreaValidationModel = { [key in keyof IHastusArea]: string };

// TODO: rename as hastusAreaValidationObject
const hastusAreaValidationModel: IHastusAreaValidationModel = {
    id: 'required|min:1|max:6|string',
    name: 'required|min:1|max:40|string'
};

export default hastusAreaValidationModel;

export { IHastusAreaValidationModel };
