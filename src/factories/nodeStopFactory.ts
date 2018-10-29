import INodeStop from '~/models/INodeStop';
import IExternalNodeStop  from '~/models/externals/IExternalNodeStop.ts';

export default class StopFactory {
    public static createStop = (node: IExternalNodeStop): INodeStop => {
        return {
            id: node.id,
            nameFi: node.pysnimi,
            nameSe: node.pysnimir,
            radius: node.pyssade,
        };
    }
}
