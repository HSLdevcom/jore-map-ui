import NodeType from '~/enums/nodeType';

export default interface INodeBase {
    id: string;
    shortId?: string; // TODO: split as identifierLetter identifierString (solkirjain sollistunnus)
    type: NodeType;
}
