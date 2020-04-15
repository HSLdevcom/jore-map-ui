import classnames from 'classnames';
import React from 'react';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import * as s from './transitTypeNodeIcon.scss';

interface ITransitTypeNodeIconProps {
    nodeType: NodeType;
    transitTypes?: TransitType[];
    isDisabled?: boolean;
    isTimeAlignmentStop?: boolean;
}

class TransitTypeNodeIcon extends React.Component<ITransitTypeNodeIconProps> {
    render() {
        const { nodeType, transitTypes, isDisabled, isTimeAlignmentStop } = this.props;
        let color: string = '';
        let opacity: number = 1;
        const nodeIcon: React.ReactNode = (
            <div
                className={classnames(
                    s.nodeIcon,
                    isTimeAlignmentStop ? s.timeAlignmentIcon : undefined
                )}
            />
        );

        if (nodeType === NodeType.MUNICIPALITY_BORDER) {
            color = '#c900ff';
        } else if (nodeType === NodeType.CROSSROAD) {
            color = '#727272';
        } else {
            if (isDisabled) {
                opacity = 0.5;
            }
            transitTypes!.forEach(type => {
                color = TransitTypeUtils.getColor(type);
            });
        }

        return (
            <div
                className={s.transitTypeNodeIcon}
                style={{ borderColor: color, opacity: opacity ? opacity : 1 }}
            >
                {nodeIcon}
            </div>
        );
    }
}

export default TransitTypeNodeIcon;
