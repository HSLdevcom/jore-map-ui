import { inject, observer } from 'mobx-react';
import React from 'react';
import ButtonType from '~/enums/buttonType';
import { ConfirmStore } from '~/stores/confirmStore';
import Modal from './Modal';
import { Button } from '../controls';
import * as s from './confirm.scss';

interface IConfirmProps {
    confirmStore?: ConfirmStore;
}

@inject('confirmStore')
@observer
class Confirm extends React.Component<IConfirmProps> {
    render() {
        if (!this.props.confirmStore!.isConfirmOpen) return null;

        return (
            <Modal>
                <div className={s.confirmView}>
                    <div className={s.content}>
                        {this.props.confirmStore!.message}
                    </div>
                    <div className={s.buttons}>
                        <Button
                            type={ButtonType.SQUARE}
                            onClick={this.props.confirmStore!.cancel}
                        >
                            Peruuta
                        </Button>
                        <Button
                            type={ButtonType.SQUARE}
                            onClick={this.props.confirmStore!.confirm}
                        >
                            Hyväksy
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }
}

export default Confirm;
