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
    title?: string;
    disabled?: boolean;
    isWide?: boolean;
    hasPadding?: boolean;
    hasReverseColor?: boolean;
    hasNoTransition?: boolean;
    hasBorderRadius?: boolean;
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
        }
        return undefined;
    };

    const {
        children,
        onClick,
        type,
        className,
        title,
        disabled,
        isWide,
        hasPadding,
        hasReverseColor,
        hasNoTransition,
        hasBorderRadius,
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
                hasNoTransition ? null : s.transition,
                hasBorderRadius ? s.borderRadius : null
            )}
            onClick={_onClick}
            title={title ? title : ''}
        >
            {children}
        </div>
    );
});

export default Button;
