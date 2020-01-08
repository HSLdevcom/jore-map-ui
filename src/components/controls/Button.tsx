import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import * as s from './button.scss';

interface IButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    type?: ButtonType;
    className?: string;
    disabled?: boolean;
    isWide?: boolean;
    hasPadding?: boolean;
    hasReverseColor?: boolean;
    hasNoTransition?: boolean;
}

const Button = observer((props: IButtonProps) => {
    const getTypeClass = (type?: ButtonType) => {
        switch (type) {
            case ButtonType.SQUARE: {
                return undefined; // default button type is square
            }
            case ButtonType.ROUND: {
                return s.round;
            }
            case ButtonType.SAVE: {
                return s.save;
            }
        }
        return undefined;
    };

    const onClick = () => {
        if (!props.disabled) {
            props.onClick();
        }
    };

    return (
        <div
            className={classnames(
                s.button,
                props.className,
                getTypeClass(props.type),
                props.disabled ? s.disabled : null,
                props.isWide ? s.wide : null,
                props.hasPadding ? s.hasPadding : null,
                props.hasReverseColor ? s.reverseColor : null,
                props.hasNoTransition ? null : s.transition
            )}
            onClick={onClick}
        >
            {props.children}
        </div>
    );
});

export default Button;
