import IViaName from '../IViaName';

type IViaNameValidationModel = { [key in keyof IViaName]: string };

const viaNameValidationModel: IViaNameValidationModel = {
    id: `required|numeric`,
    destinationFi1: 'max:30|string',
    destinationFi2: 'max:30|string',
    destinationSw1: 'max:30|string',
    destinationSw2: 'max:30|string'
};

export default viaNameValidationModel;
