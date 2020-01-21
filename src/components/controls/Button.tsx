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
            case ButtonType.WARNING: {
                return s.warning;
            }
        }
        return undefined;
    };

    const {
        children,
        onClick,
        type,
        className,
        disabled,
        isWide,
        hasPadding,
        hasReverseColor,
        hasNoTransition,
        ...attrs
    } = props;

    const _onClick = () => {
        if (!disabled) {
            onClick();
        }
    };

    return (
        <div
            {...attrs}
            className={classnames(
                s.button,
                className,
                getTypeClass(type),
                disabled ? s.disabled : null,
                isWide ? s.wide : null,
                hasPadding ? s.hasPadding : null,
                hasReverseColor ? s.reverseColor : null,
                hasNoTransition ? null : s.transition
            )}
            onClick={_onClick}
        >
            {children}
        </div>
    );
});

export default Button;
