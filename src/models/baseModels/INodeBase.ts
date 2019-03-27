import NodeType from '~/enums/nodeType';

export default interface INodeBase {
    id: string;
    shortIdLetter?: string;
    shortIdString?: string;
    type: NodeType;
}
