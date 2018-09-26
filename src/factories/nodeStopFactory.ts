import INodeStop from '../models/INodeStop';
export default class StopFactory {
    public static createStop = (node: any): INodeStop => {
        return {
            id: node.id,
            nameFi: node.pysnimi,
            nameSe: node.pysnimir,
            radius: node.pyssade,
        };
    }
}
