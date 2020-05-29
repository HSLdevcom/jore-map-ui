import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import * as s from './mapControlButton.scss';

interface MapControlButtonProps {
    label: string;
    isActive: boolean;
    isDisabled: boolean;
    onClick: () => void;
    hasNoPadding?: boolean;
    children: React.ReactNode;
}

const MapControlButton = observer((props: MapControlButtonProps) => {
    const { label, isActive, isDisabled, onClick, hasNoPadding, children, ...attrs } = props;

    const classes = classnames(
        s.mapControlButton,
        isActive && !isDisabled ? s.active : null,
        isDisabled ? s.disabled : null,
        hasNoPadding ? s.hasNoPadding : undefined
    );

    return (
        <div
            className={classes}
            onClick={isDisabled ? () => void 0 : onClick}
            title={label}
            {...attrs}
        >
            {props.children}
        </div>
    );
});

export default MapControlButton;
