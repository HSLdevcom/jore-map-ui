import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import { ConfirmStore } from '~/stores/confirmStore';
import { Button } from '../controls';
import SaveButton from '../shared/SaveButton';
import Modal from './Modal';
import * as s from './confirm.scss';

interface IConfirmProps {
    confirmStore?: ConfirmStore;
}

@inject('confirmStore')
@observer
class Confirm extends React.Component<IConfirmProps> {
    render() {
        const confirmStore = this.props.confirmStore!;
        if (!confirmStore.isOpen) return null;

        const isConfirmButtonDisabled = confirmStore.isConfirmButtonDisabled;
        const confirmType = confirmStore.confirmType;
        return (
            <Modal>
                <div className={s.confirmView}>
                    <div
                        className={classnames(
                            s.content,
                            typeof confirmStore!.content === 'string' ? s.padding : undefined
                        )}
                    >
                        {confirmStore!.content}
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
                            {confirmType === 'save' ? (
                                <SaveButton
                                    disabled={isConfirmButtonDisabled}
                                    onClick={confirmStore!.confirm}
                                    isWide={true}
                                    hasPadding={false}
                                >
                                    {confirmStore!.confirmButtonText}
                                </SaveButton>
                            ) : (
                                <Button
                                    disabled={isConfirmButtonDisabled}
                                    type={ButtonType.SQUARE}
                                    onClick={confirmStore!.confirm}
                                    isWide={true}
                                >
                                    {confirmStore!.confirmButtonText}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default Confirm;
