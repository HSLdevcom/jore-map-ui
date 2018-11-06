import INodeStop from '~/models/INodeStop';
import IExternalStop  from '~/models/externals/IExternalStop';

export default class StopFactory {
    public static createStop = (node: IExternalStop): INodeStop => {
        return {
            id: node.id,
            nameFi: node.pysnimi,
            nameSe: node.pysnimir,
            radius: node.pyssade,
        };
    }
}
