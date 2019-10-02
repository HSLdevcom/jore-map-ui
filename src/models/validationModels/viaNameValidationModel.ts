import IViaName from '../IViaName';

type IViaNameKeys = keyof IViaName;
type IViaNameValidationModel = { [key in IViaNameKeys]: string };

const viaNameValidationModel: IViaNameValidationModel = {
    id: `required|numeric`,
    destinationFi1: 'max:30|string',
    destinationFi2: 'max:30|string',
    destinationSw1: 'max:30|string',
    destinationSw2: 'max:30|string'
};

export default viaNameValidationModel;
