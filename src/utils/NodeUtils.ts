import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import { INodeBase } from '~/models/INode';
import NodeLocationType from '~/types/NodeLocationType';
import * as s from './nodeUtils.scss';

class NodeUtils {
    public static getNodeTypeClasses = (
        nodeType: NodeType,
        {
            nodeLocationType,
            isNodeDisabled,
            isNodeTimeAlignment,
            isNodeHighlighted,
        }: {
            nodeLocationType?: NodeLocationType;
            isNodeDisabled?: boolean;
            isNodeTimeAlignment?: boolean;
            isNodeHighlighted?: boolean;
        }
    ) => {
        const res = [];
        if (nodeLocationType === 'coordinatesProjection') {
            res.push(s.coordinatesProjectionMarker);
        }
        if (isNodeDisabled) {
            res.push(s.disabledMarker);
        }
        if (isNodeTimeAlignment) {
            res.push(s.timeAlignmentMarker);
        }

        switch (nodeType) {
            case NodeType.STOP:
                res.push(isNodeHighlighted ? s.stopMarkerHighlight : s.stopMarker);
                break;
            case NodeType.CROSSROAD:
                res.push(isNodeHighlighted ? s.crossroadMarkerHighlight : s.crossroadMarker);
                break;
            case NodeType.MUNICIPALITY_BORDER:
                res.push(isNodeHighlighted ? s.municipalityMarkerHighlight : s.municipalityMarker);
                break;
            default:
                throw new Error(`NodeType not supported: ${nodeType}`);
        }
        return res;
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
            case NodeType.MUNICIPALITY_BORDER: {
                return 'Kuntaraja';
            }
            default: {
                throw new Error(`NodeType not supported: ${nodeType}`);
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

    // Note: same mapping found from jore-map-backend. If changed, change backend mapping also.
    // Better would be to create an API method that returns mapping for this
    public static getNodeIdUsageCode = (nodeType: NodeType, transitType?: TransitType | null) => {
        if (nodeType !== NodeType.STOP) return '0';
        switch (transitType) {
            case TransitType.BUS:
                return '2';
            case TransitType.TRAM:
                return '4';
            case TransitType.TRAIN:
                return '5';
            case TransitType.SUBWAY:
                return '6';
            case TransitType.FERRY:
                return '7';
            default:
                return '3'; // Default number that is not restricted to any usage
        }
    };
}

export default NodeUtils;
