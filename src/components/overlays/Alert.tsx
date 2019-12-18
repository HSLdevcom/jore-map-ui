import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdInformationCircle } from 'react-icons/io';
import { AlertStore, AlertType } from '~/stores/alertStore';
import { Button } from '../controls';
import Loader, { LoaderSize } from '../shared/loader/Loader';
import Modal from './Modal';
import * as s from './alert.scss';

interface IAlertProps {
    alertStore?: AlertStore;
}

@inject('alertStore')
@observer
class Alert extends React.Component<IAlertProps> {
    private closeAlert = () => {
        this.props.alertStore!.close();
    };
    render() {
        const alertStore = this.props.alertStore!;

        if (!alertStore.isAlertOpen) return null;

        return (
            <Modal>
                <div className={s.alertView}>
                    {alertStore.type === AlertType.Success && (
                        <FaCheckCircle className={classnames(s.icon, s.success)} />
                    )}
                    {alertStore.type === AlertType.Info && (
                        <IoMdInformationCircle className={classnames(s.icon, s.info)} />
                    )}
                    {alertStore.type === AlertType.Loader && (
                        <div className={s.icon}>
                            <Loader size={LoaderSize.SMALL} />
                        </div>
                    )}
                    {alertStore.message}
                    {alertStore.isCancelButtonVisible && (
                        <Button className={s.closeAlertButton} onClick={this.closeAlert}>
                            OK
                        </Button>
                    )}
                </div>
            </Modal>
        );
    }
}

export default Alert;
