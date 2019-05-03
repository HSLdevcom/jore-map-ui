import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import * as s from './mapControlButton.scss';

interface MapControlButtonProps {
    label: string;
    isActive: boolean;
    isDisabled: boolean;
    children: React.ReactNode;
    onClick: () => void;
}

const MapControlButton = observer((props: MapControlButtonProps) => {
    const onClick = () => {
        if (!props.isDisabled) {
            props.onClick();
        }
    };

    const classes = classnames(
        s.mapControlButton,
        props.isActive && !props.isDisabled ? s.active : null,
        props.isDisabled ? s.disabled : null
    );

    return (
        <div className={classes} onClick={onClick} title={props.label}>
            {props.children}
        </div>
    );
});

export default MapControlButton;
