import { inject, observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import { ConfirmStore } from '~/stores/confirmStore';
import { Button } from '../controls';
import Modal from './Modal';
import * as s from './confirm.scss';

interface IConfirmProps {
    confirmStore?: ConfirmStore;
}

@inject('confirmStore')
@observer
class Confirm extends React.Component<IConfirmProps> {
    render() {
        const confirmStore = this.props.confirmStore;
        if (!confirmStore!.isConfirmOpen) return null;

        return (
            <Modal>
                <div className={s.confirmView}>
                    <div className={s.content}>{confirmStore!.content}</div>
                    <div className={s.buttons}>
                        <Button
                            type={ButtonType.SQUARE}
                            onClick={confirmStore!.cancel}
                            isWide={true}
                        >
                            {confirmStore!.cancelButtonText}
                        </Button>
                        <Button
                            type={ButtonType.SQUARE}
                            onClick={confirmStore!.confirm}
                            isWide={true}
                        >
                            {confirmStore!.confirmButtonText}
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default Confirm;
