import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdInformationCircle } from 'react-icons/io';
import { DialogStore, DialogType } from '~/stores/dialogStore';
import Loader, { LoaderSize } from './shared/loader/Loader';
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
                    { this.props.dialogStore!.type === DialogType.Success &&
                        <FaCheckCircle className={classnames(s.icon, s.success)} />
                    }
                    { this.props.dialogStore!.type === DialogType.Info &&
                        <IoMdInformationCircle className={classnames(s.icon, s.info)} />
                    }
                    { this.props.dialogStore!.type === DialogType.Loader &&
                        <div className={s.icon}>
                            <Loader size={LoaderSize.SMALL}/>
                        </div>
                    }
                    {this.props.dialogStore!.message}
                </div>
            </div>
        );
    }
}

export default Dialog;
