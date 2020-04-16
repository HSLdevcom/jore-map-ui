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
    onClick: () => void;
    disabled: boolean; // disabled save button can still be clicked to show savePreventedNotification
    savePreventedNotification: string;
    className?: string;
    isWarningButton?: boolean;
    isWide?: boolean;
    hasPadding?: boolean; // defaults to true
}

const SaveButton = observer((props: ISaveButtonProps) => {
    const {
        children,
        className,
        onClick,
        disabled,
        savePreventedNotification,
        isWarningButton,
        isWide,
        hasPadding,
        ...attrs
    } = props;

    const isSaveLockEnabled = LoginStore.isSaveLockEnabled;
    let typeClass;
    if (isSaveLockEnabled || isWarningButton) {
        typeClass = s.warningButton;
    } else if (savePreventedNotification.length > 0) {
        typeClass = s.savePreventedNotificationButton;
    } else {
        typeClass = s.saveButton;
    }
    return (
        <Button
            {...attrs}
            className={classnames(s.saveButtonBase, typeClass, className ? className : undefined)}
            onClick={
                isSaveLockEnabled || savePreventedNotification.length > 0
                    ? () => showSavePreventedNotification(savePreventedNotification)
                    : onClick
            }
            disabled={disabled && savePreventedNotification.length === 0}
            type={ButtonType.SQUARE}
            isWide={isWide}
            hasPadding={typeof hasPadding === 'undefined' ? true : hasPadding}
            data-cy='saveButton'
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
