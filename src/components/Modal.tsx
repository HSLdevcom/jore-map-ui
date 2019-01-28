import React from 'react';
import * as s from './modal.scss';

interface IModalProps {
    closeModal: Function;
    isVisible: boolean;
}

class Modal extends React.Component<IModalProps> {

    private closeModal = (e: any) => {
        if (e.target.className === s.modalView) {
            this.props.closeModal();
        }
    }

    render() {
        if (!this.props.isVisible) return (null);

        return (
            <div
                className={s.modalView}
                onClick={this.closeModal}
            >
                <div className={s.wrapper}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
export default Modal;
