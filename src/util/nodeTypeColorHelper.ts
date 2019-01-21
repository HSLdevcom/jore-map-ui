import NodeType from '~/enums/nodeType';
import * as s from './nodeTypeColors.scss';

class NodeTypeColorHelper {
    public static getColor = (type: NodeType) => {
        switch (type) {
        case NodeType.STOP:
            return '#007ac9';
        case NodeType.CROSSROAD:
            return '#727272';
        case NodeType.MUNICIPALITY_BORDER:
            return '#c900ff';
        case NodeType.DISABLED:
            return '#353333';
        case NodeType.TIME_ALIGNMENT:
            return '#007ac9';
        case NodeType.INVALID:
            return '#ff0000';
        default:
            throw new Error(`TransitType not supported: ${type}`);
        }
    }

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
}

export default NodeTypeColorHelper;
