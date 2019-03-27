import NodeType from '~/enums/nodeType';
import INodeBase from '~/models/baseModels/INodeBase';
import * as s from './nodeTypeColors.scss';

class NodeHelper {
    public static getTypeClass = (type: NodeType, highlight?: boolean) => {
        switch (type) {
        case NodeType.STOP:
            return highlight ? s.stopMarkerHighlight : s.stopMarker;
        case NodeType.CROSSROAD:
            return highlight ? s.crossroadMarkerHighlight : s.crossroadMarker;
        case NodeType.MUNICIPALITY_BORDER:
            return highlight ? s.municipalityMarkerHighlight : s.municipalityMarker;
        case NodeType.DISABLED:
            return highlight ? s.disabledMarkerHighlight : s.disabledMarker;
        case NodeType.TIME_ALIGNMENT:
            return s.timeAlignmentMarker;
        case NodeType.INVALID:
            return s.unknownMarker;
        default:
            throw new Error(`TransitType not supported: ${type}`);
        }
    }

    public static getNodeTypeName = (nodeType?: NodeType) => {
        if (!nodeType) {
            return 'Tyhjä';
        }
        switch (nodeType) {
        case NodeType.STOP: {
            return 'Pysäkki';
        }
        case NodeType.CROSSROAD: {
            return 'Risteys';
        }
        case NodeType.DISABLED: {
            return 'Ei käytössä';
        }
        case NodeType.MUNICIPALITY_BORDER: {
            return 'Kuntaraja';
        }
        default: {
            return nodeType.toString();
        }}
    }

    public static getShortId = (node: INodeBase) => {
        if (node.shortIdString) {
            return node.shortIdLetter
            ? node.shortIdLetter + node.shortIdString
            : node.shortIdString;
        }
        return '';
    }
}

export default NodeHelper;
