import * as React from 'react';
import * as s from './modal.scss';

interface IModalProps {
    closeModal: Function;
    isVisible: boolean;
}

class Modal extends React.Component<IModalProps> {

    public render(): any {
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

    private closeModal = (e: any) => {
        if (e.target.className === s.modalView) {
            this.props.closeModal();
        }
    }
}
export default Modal;
