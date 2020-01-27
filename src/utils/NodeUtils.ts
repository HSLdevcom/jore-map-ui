import NodeType from '~/enums/nodeType';
import { INodeBase } from '~/models/INode';
import NodeLocationType from '~/types/NodeLocationType';
import * as s from './nodeTypeColors.scss';

class NodeUtils {
    public static getNodeTypeClass = (
        nodeType: NodeType,
        {
            nodeLocationType,
            isNodeDisabled,
            isNodeTimeAlignment,
            isNodeHighlighted
        }: {
            nodeLocationType?: NodeLocationType;
            isNodeDisabled?: boolean;
            isNodeTimeAlignment?: boolean;
            isNodeHighlighted?: boolean;
        }
    ) => {
        if (nodeLocationType === 'coordinatesProjection') {
            return s.coordinatesProjectionMarker;
        }
        if (isNodeDisabled) {
            return isNodeHighlighted ? s.disabledMarkerHighlight : s.disabledMarker;
        }
        if (isNodeTimeAlignment) {
            return s.timeAlignmentMarker;
        }

        switch (nodeType) {
            case NodeType.STOP:
                return isNodeHighlighted ? s.stopMarkerHighlight : s.stopMarker;
            case NodeType.CROSSROAD:
                return isNodeHighlighted ? s.crossroadMarkerHighlight : s.crossroadMarker;
            case NodeType.MUNICIPALITY_BORDER:
                return isNodeHighlighted ? s.municipalityMarkerHighlight : s.municipalityMarker;
            default:
                throw new Error(`NodeType not supported: ${nodeType}`);
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
}

export default NodeUtils;
