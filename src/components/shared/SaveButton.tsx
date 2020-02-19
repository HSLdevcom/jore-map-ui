import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import AlertStore from '~/stores/alertStore';
import LoginStore from '~/stores/loginStore';
import { Button } from '../controls';
import * as s from './saveButton.scss';

interface ISaveButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick: () => void;
    disabled?: boolean;
    isSavePrevented?: boolean;
    savePreventedNotification?: string;
    isWide?: boolean;
    hasPadding?: boolean; // defaults to true
}

const SaveButton = observer((props: ISaveButtonProps) => {
    const {
        children,
        className,
        onClick,
        disabled,
        isSavePrevented,
        savePreventedNotification,
        isWide,
        hasPadding,
        ...attrs
    } = props;

    const isSaveLockEnabled = LoginStore.isSaveLockEnabled;
    const isWarningButton = isSaveLockEnabled || isSavePrevented;
    const typeClass = disabled ? undefined : isWarningButton ? s.warningButton : s.saveButton;
    return (
        <Button
            {...attrs}
            className={classnames(s.saveButtonBase, typeClass, className ? className : undefined)}
            onClick={
                isWarningButton
                    ? () => showSavePreventedNotification(savePreventedNotification)
                    : onClick
            }
            disabled={disabled}
            type={ButtonType.SQUARE}
            isWide={isWide}
            hasPadding={typeof hasPadding === 'undefined' ? true : hasPadding}
        >
            {children}
        </Button>
    );
});

const showSavePreventedNotification = (savePreventedNotification?: string) => {
    const alertText = LoginStore.isSaveLockEnabled
        ? 'Tallentaminen estetty, infopoiminta on käynnissä. Odota kunnes infopoiminta loppuu.'
        : savePreventedNotification!;
    AlertStore.setNotificationMessage({
        message: alertText
    });
};

export default SaveButton;
