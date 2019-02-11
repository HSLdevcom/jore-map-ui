import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { DialogStore } from '~/stores/dialogStore';
import * as s from './dialog.scss';

interface IDialogProps {
    dialogStore?: DialogStore;
}

@inject('dialogStore')
@observer
class Dialog extends React.Component<IDialogProps> {

    render() {
        if (!this.props.dialogStore!.isDialogOpen) return null;

        return (
            <div className={s.dialogView}>
                <div className={s.wrapper}>
                    <FaCheckCircle className={s.checkIcon} />
                    {this.props.dialogStore!.message}
                </div>
            </div>
        );
    }
}

export default Dialog;
