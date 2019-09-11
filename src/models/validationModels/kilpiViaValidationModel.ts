import IKilpiVia from '../IKilpiVia';

type IKilpiViaKeys = keyof IKilpiVia;
type IKilpiViaValidationModel = { [key in IKilpiViaKeys]: string };

const kilpiViaValidationModel: IKilpiViaValidationModel = {
    relid: `required|numeric`,
    nameFi: 'max:30|string',
    nameSw: 'max:30|string'
};

export default kilpiViaValidationModel;
