import { IStopArea } from '..';

const nameRule = 'required|min:1|max:20|string';

type StopAreaKeys = keyof IStopArea;
type IStopAreaValidationModel = { [key in StopAreaKeys]: string };

const stopAreaValidationModel: IStopAreaValidationModel = {
    id: '',
    transitType: 'required|min:1|max:1|string',
    nameFi: nameRule,
    nameSw: nameRule,
    terminalAreaId: 'min:1|max:10|string',
    modifiedBy: '',
    modifiedOn: '',
    stopAreaGroupId: 'required|min:1|max:2|string'
};

export default stopAreaValidationModel;
