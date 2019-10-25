import { IStopArea } from '~/models';
import IExternalStopArea from '~/models/externals/IExternalStopArea';

class StopAreaFactory {
    public static mapExternalStopArea = (externalStopArea: IExternalStopArea): IStopArea => {
        return {
            id: externalStopArea.pysalueid,
            transitType: externalStopArea.verkko,
            nameFi: externalStopArea.nimi,
            nameSw: externalStopArea.nimir,
            modifiedBy: externalStopArea.tallentaja,
            modifiedOn: externalStopArea.tallpvm ? new Date(externalStopArea.tallpvm) : undefined,
            stopAreaGroupId: externalStopArea.pysakkialueryhma
        };
    };

    public static createNewStopArea = (): IStopArea => {
        return {
            id: '',
            transitType: undefined,
            nameFi: '',
            nameSw: '',
            modifiedBy: '',
            modifiedOn: new Date(),
            stopAreaGroupId: undefined
        };
    };
}

export default StopAreaFactory;
