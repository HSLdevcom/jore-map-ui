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
    onClick: () => void;
    hoverText?: string;
}

class TransitTypeLink extends React.Component<ITransitIconProps> {
    render() {
        const { transitType, shouldShowTransitTypeIcon, text, onClick, hoverText } = this.props;
        return (
            <div
                className={classnames(s.link, TransitTypeUtils.getColorClass(transitType))}
                title={hoverText ? hoverText : ''}
                onClick={() => onClick()}
            >
                {shouldShowTransitTypeIcon && (
                    <div className={s.transitTypeIcon}>
                        <TransitIcon transitType={transitType} isWithoutBox={false} />
                    </div>
                )}
                {text}
            </div>
        );
    }
}

export default TransitTypeLink;
