import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import { ConfirmStore } from '~/stores/confirmStore';
import { Button } from '../controls';
import SaveButton from '../shared/SaveButton';
import ModalContainer from './ModalContainer';
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
            <ModalContainer>
                <div className={s.confirmView} data-cy='confirmView'>
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
                                    onClick={confirmStore!.confirm}
                                    disabled={isConfirmButtonDisabled}
                                    savePreventedNotification={''}
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
                                    data-cy='confirmButton'
                                >
                                    {confirmStore!.confirmButtonText}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </ModalContainer>
        );
    }
}

export default Confirm;
