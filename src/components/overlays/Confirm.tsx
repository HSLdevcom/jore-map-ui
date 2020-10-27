import classnames from 'classnames';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import { ConfirmStore } from '~/stores/confirmStore';
import { Button } from '../controls';
import UnmeasuredStopGapsConfirm from '../sidebar/routePathView/routePathInfoTab/UnmeasuredStopGapsConfirm';
import ModalContainer from './ModalContainer';
import SavePrompt from './SavePrompt';
import * as s from './confirm.scss';

interface IConfirmProps {
    confirmStore?: ConfirmStore;
}

@inject('confirmStore')
@observer
class Confirm extends React.Component<IConfirmProps> {
    private displayDoubleConfirm = () => {
        const confirmStore = this.props.confirmStore!;
        const isOk = confirm(confirmStore.doubleConfirmText!);
        if (isOk) {
            confirmStore!.confirm();
        }
    };

    render() {
        const confirmStore = this.props.confirmStore!;
        if (!confirmStore.isOpen) return null;

        const isConfirmButtonDisabled = confirmStore.isConfirmButtonDisabled;
        const confirmType = confirmStore.confirmType;

        const confirmButtonClassName =
            confirmType === 'save'
                ? s.saveButton
                : confirmType === 'delete'
                ? s.deleteButton
                : undefined;

        const doubleConfirmText = this.props.confirmStore!.doubleConfirmText;
        const shouldShowDoubleConfirm = !_.isEmpty(doubleConfirmText);

        const confirmComponentName = confirmStore.confirmComponentName;
        const confirmData = confirmStore.confirmData;
        return (
            <ModalContainer>
                <div className={s.confirmView} data-cy='confirmView'>
                    <div className={classnames(s.content)}>
                        {
                            {
                                default: <div className={s.padding}>{confirmData}</div>,
                                savePrompt: <SavePrompt savePromptSections={confirmData} />,
                                unmeasuredStopGapsConfirm: <UnmeasuredStopGapsConfirm />,
                            }[confirmComponentName]
                        }
                    </div>
                    <div className={s.buttonWrapper}>
                        {confirmStore!.confirmNotification && (
                            <div className={s.confirmNotification}>
                                {confirmStore!.confirmNotification}
                            </div>
                        )}
                        <div className={s.buttons}>
                            <Button
                                type={ButtonType.SQUARE}
                                onClick={confirmStore!.cancel}
                                isWide={true}
                            >
                                {confirmStore!.cancelButtonText}
                            </Button>
                            <Button
                                className={confirmButtonClassName}
                                disabled={isConfirmButtonDisabled}
                                type={ButtonType.SQUARE}
                                onClick={
                                    shouldShowDoubleConfirm
                                        ? this.displayDoubleConfirm
                                        : confirmStore!.confirm
                                }
                                isWide={true}
                                data-cy='confirmButton'
                            >
                                {confirmStore!.confirmButtonText}
                            </Button>
                        </div>
                    </div>
                </div>
            </ModalContainer>
        );
    }
}

export default Confirm;
