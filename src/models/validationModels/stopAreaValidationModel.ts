import { IStopArea } from '..';

const nameRule = 'required|min:1|max:20|string';

type StopAreaKeys = keyof IStopArea;
type IStopAreaValidationModel = { [key in StopAreaKeys]: string };

const stopAreaValidationModel: IStopAreaValidationModel = {
    id: '',
    transitType: 'required|min:1',
    nameFi: nameRule,
    nameSw: nameRule,
    modifiedBy: '',
    modifiedOn: '',
    stopAreaGroupId: 'required|min:1|max:2'
};

export default stopAreaValidationModel;
