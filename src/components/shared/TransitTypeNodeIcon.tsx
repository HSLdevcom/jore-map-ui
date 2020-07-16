import classnames from 'classnames';
import React from 'react';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import commonStyles from './styles/common.scss';
import * as s from './transitTypeNodeIcon.scss';

interface ITransitTypeNodeIconProps {
    nodeType: NodeType;
    transitTypes?: TransitType[];
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
}

class TransitTypeNodeIcon extends React.Component<ITransitTypeNodeIconProps> {
    private addBorder = (nodeIcon: React.ReactNode, color: string, opacity: number) => {
        return (
            <div className={s.iconBorder} style={{ opacity, borderColor: color }}>
                {nodeIcon}
            </div>
        );
    };

    render() {
        const { nodeType, transitTypes, isDisabled, isTimeAlignmentStop } = this.props;
        let opacity: number = 1;
        if (isDisabled && nodeType === NodeType.STOP) {
            opacity = 0.5;
        }

        let nodeIcon: React.ReactNode = (
            <div
                className={classnames(
                    s.nodeIcon,
                    nodeType === NodeType.STOP && transitTypes && transitTypes.length > 1
                        ? s.smallSize
                        : s.normalSize,
                    isTimeAlignmentStop ? s.timeAlignmentIcon : undefined
                )}
            />
        );

        if (nodeType === NodeType.MUNICIPALITY_BORDER) {
            nodeIcon = this.addBorder(nodeIcon, '#c900ff', opacity);
        } else if (nodeType === NodeType.CROSSROAD) {
            nodeIcon = this.addBorder(nodeIcon, '#727272', opacity);
        } else {
            if (transitTypes && transitTypes.length > 0) {
                transitTypes!.forEach((type) => {
                    nodeIcon = this.addBorder(nodeIcon, TransitTypeUtils.getColor(type), opacity);
                });
            } else {
                nodeIcon = this.addBorder(nodeIcon, commonStyles.unusedNodeColor, opacity);
            }
        }

        return nodeIcon;
    }
}

export default TransitTypeNodeIcon;
