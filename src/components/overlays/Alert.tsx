import { inject, observer } from 'mobx-react';
import classnames from 'classnames';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdInformationCircle } from 'react-icons/io';
import { AlertStore, AlertType } from '~/stores/alertStore';
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
                <div className={s.content}>
                    { this.props.alertStore!.type === AlertType.Success &&
                        <FaCheckCircle className={classnames(s.icon, s.success)} />
                    }
                    { this.props.alertStore!.type === AlertType.Info &&
                        <IoMdInformationCircle className={classnames(s.icon, s.info)} />
                    }
                    {this.props.alertStore!.message}
                </div>
            </Modal>
        );
    }
}

export default Alert;
