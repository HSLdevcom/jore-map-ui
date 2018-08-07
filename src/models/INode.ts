import NodeType from '../enums/nodeType';

export default interface INode {
    id: number;
    type: NodeType;
    geoJson: any;
}
