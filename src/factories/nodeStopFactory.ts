import IStop from '~/models/IStop';
import IExternalStop  from '~/models/externals/IExternalStop';

class StopFactory {
    public static createStop = (node: IExternalStop): IStop => {
        return {
            id: node.id,
            nameFi: node.pysnimi,
            nameSe: node.pysnimir,
            radius: node.pyssade,
            hastusId: node.paitunnus,
        };
    }
}

export default StopFactory;
