import NodeType from '~/enums/nodeType';

export default interface INodeBase {
    id: string;
    shortId?: string;
    type: NodeType;
}
