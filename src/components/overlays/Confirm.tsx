import { inject, observer } from 'mobx-react';
import React from 'react';
import { AlertStore } from '~/stores/alertStore';
import * as s from './confirm.scss';
import Modal from './Modal';

interface IDialogProps {
    alertStore?: AlertStore;
}

@inject('alertStore')
@observer
class Dialog extends React.Component<IDialogProps> {
    render() {
        if (!this.props.alertStore!.isDialogOpen) return null;

        return (
            <Modal>
                <div className={s.content}>
                    {this.props.alertStore!.message}
                </div>
            </Modal>
        );
    }
}

export default Dialog;
