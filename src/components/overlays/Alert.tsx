import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdInformationCircle } from 'react-icons/io';
import { AlertStore, AlertType } from '~/stores/alertStore';
import Loader, { LoaderSize } from '../shared/loader/Loader';
import Modal from './Modal';
import * as s from './alert.scss';

interface IAlertProps {
    alertStore?: AlertStore;
}

@inject('alertStore')
@observer
class Alert extends React.Component<IAlertProps> {
    render() {
        if (!this.props.alertStore!.isAlertOpen) return null;

        return (
            <Modal>
                <div className={s.alertView}>
                    {this.props.alertStore!.type === AlertType.Success && (
                        <FaCheckCircle className={classnames(s.icon, s.success)} />
                    )}
                    {this.props.alertStore!.type === AlertType.Info && (
                        <IoMdInformationCircle className={classnames(s.icon, s.info)} />
                    )}
                    {this.props.alertStore!.type === AlertType.Loader && (
                        <div className={s.icon}>
                            <Loader size={LoaderSize.SMALL} />
                        </div>
                    )}
                    {this.props.alertStore!.message}
                </div>
            </Modal>
        );
    }
}

export default Alert;
