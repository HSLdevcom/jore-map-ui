import NodeType from '~/enums/nodeType';
import { INodeBase } from '~/models/INode';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import * as s from './nodeTypeColors.scss';

class NodeHelper {
    public static getTypeClass = (type: NodeType, highlight?: boolean) => {
        switch (type) {
            case NodeType.STOP:
                return highlight ? s.stopMarkerHighlight : s.stopMarker;
            case NodeType.CROSSROAD:
                return highlight
                    ? s.crossroadMarkerHighlight
                    : s.crossroadMarker;
            case NodeType.MUNICIPALITY_BORDER:
                return highlight
                    ? s.municipalityMarkerHighlight
                    : s.municipalityMarker;
            case NodeType.DISABLED:
                return highlight ? s.disabledMarkerHighlight : s.disabledMarker;
            case NodeType.TIME_ALIGNMENT:
                return s.timeAlignmentMarker;
            case NodeType.INVALID:
                return s.unknownMarker;
            default:
                throw new Error(`TransitType not supported: ${type}`);
        }
    };

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
            }
        }
    };

    public static getShortId = (node: INodeBase) => {
        if (node.shortIdString) {
            return node.shortIdLetter
                ? node.shortIdLetter + node.shortIdString
                : node.shortIdString;
        }
        return '';
    };

    public static getMeasurementTypeLabel = (
        measurementType: string | undefined
    ) => {
        switch (measurementType) {
            case NodeMeasurementType.Calculated:
                return 'Laskettu';
            case NodeMeasurementType.Measured:
                return 'Mitattu';
            case undefined:
                return '-';
            default:
                return measurementType.toString();
        }
    };
}

export default NodeHelper;
