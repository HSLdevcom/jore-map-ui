import INodeStop from '~/models/INodeStop';

interface IExternalNodeStop{
    id: number;
    pysnimi: string;
    pysnimir: string;
    pyssade: number;
}

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
