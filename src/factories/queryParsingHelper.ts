import { INode } from '../models';

export default class QueryParsingHelper {
    public static removeINodeDuplicates(nodes: INode[]): INode[] {
        const obj = {};

        nodes.forEach((node) => {
            obj[node.id] = node;
        });

        return Object.values(obj);
    }
}
