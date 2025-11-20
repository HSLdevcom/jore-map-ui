import classnames from 'classnames';
import React from 'react';
import TransitType from '~/enums/transitType';
import TransitTypeUtils from '~/utils/TransitTypeUtils';
import TransitIcon from './TransitIcon';
import * as s from './transitTypeLink.scss';

interface ITransitIconProps {
    transitType: TransitType;
    shouldShowTransitTypeIcon: boolean;
    text: string;
    size?: transitTypeLinkSize; // defaults to large
    onClick?: () => void;
    hoverText?: string;
}

type transitTypeLinkSize = 'small' | 'medium' | 'large';

class TransitTypeLink extends React.Component<ITransitIconProps> {
    render() {
        const {
            transitType,
            shouldShowTransitTypeIcon,
            text,
            size,
            onClick,
            hoverText,
            ...attrs
        } = this.props;
        console.log(transitType)
        return (
            <div
                className={classnames(
                    s.link,
                    TransitTypeUtils.getColorClass(transitType),
                    s[size || 'large']
                )}
                onClick={onClick ? onClick : void 0}
                title={hoverText ? hoverText : ''}
                {...attrs}
            >
                {shouldShowTransitTypeIcon && (
                    <div className={classnames(s.transitTypeIcon, s[size || 'large'])}>
                        <TransitIcon transitType={transitType} isWithoutBox={false} />
                    </div>
                )}
                {text}
            </div>
        );
    }
}

export default TransitTypeLink;

export { transitTypeLinkSize };
