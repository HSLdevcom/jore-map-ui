import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import { AlertStore } from '~/stores/alertStore';
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
    clickPreventedNotification?: string;
    alertStore?: AlertStore;
}

const Button = inject('alertStore')(
    observer((props: IButtonProps) => {
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

        const showClickPreventedNotification = (notification: string) => {
            props.alertStore!.setNotificationMessage({
                message: notification,
            });
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
            clickPreventedNotification,
            alertStore,
            ...attrs
        } = props;

        const _onClick = () => {
            if (!isEmpty(clickPreventedNotification)) {
                showClickPreventedNotification(clickPreventedNotification!);
                return;
            }
            if (!disabled) {
                onClick();
            }
        };

        let disabledClass;
        if (!isEmpty(clickPreventedNotification)) {
            disabledClass = s.disabledClickable;
        } else if (disabled) {
            disabledClass = s.disabled;
        }

        return (
            <div
                {...attrs}
                className={classnames(
                    s.button,
                    className,
                    getTypeClass(type),
                    disabledClass,
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
    })
);

export default Button;
