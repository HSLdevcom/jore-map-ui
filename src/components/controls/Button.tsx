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
    hasBorderRadius?: boolean;
    hasNoTransition?: boolean;
    hasNoMargin?: boolean;
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
        hasNoMargin,
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
                disabled ? s.disabled : undefined,
                isWide ? s.wide : undefined,
                hasPadding ? s.hasPadding : undefined,
                hasReverseColor ? s.reverseColor : undefined,
                hasNoTransition ? undefined : s.transition,
                hasBorderRadius ? s.borderRadius : undefined,
                hasNoMargin ? s.hasNoMargin : undefined
            )}
            onClick={_onClick}
            title={title ? title : ''}
        >
            {children}
        </div>
    );
});

export default Button;
