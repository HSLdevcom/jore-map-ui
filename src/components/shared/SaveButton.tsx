import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import AlertStore from '~/stores/alertStore';
import LoginStore from '~/stores/loginStore';
import { Button } from '../controls';
import * as s from './saveButton.scss';

interface ISaveButtonProps {
    onClick: () => void;
    text: string;
    isSavePrevented?: boolean;
    savePreventedNotification?: string;
    className?: string;
}

const SaveButton = observer((props: ISaveButtonProps) => {
    const { onClick, text, isSavePrevented, savePreventedNotification, className } = props;

    const isSaveLockEnabled = LoginStore.isSaveLockEnabled;
    const isWarningButton = isSaveLockEnabled || isSavePrevented;
    return (
        <Button
            onClick={
                isWarningButton
                    ? () => showSavePreventedNotification(savePreventedNotification)
                    : onClick
            }
            className={classnames(
                isWarningButton ? s.warningButton : s.saveButton,
                className ? className : undefined
            )}
            type={ButtonType.SQUARE}
        >
            {text}
        </Button>
    );
});

const showSavePreventedNotification = (savePreventedNotification?: string) => {
    const alertText = LoginStore.isSaveLockEnabled
        ? 'Tallentaminen estetty, infopoiminta käynnissä. Odota kunnes infopoiminta loppuu.'
        : savePreventedNotification!;
    AlertStore.setNotificationMessage({
        message: alertText
    });
};

export default SaveButton;
