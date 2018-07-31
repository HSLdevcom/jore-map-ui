import * as React from 'react';

interface IModalProps {
    closeModal: Function;
    isVisible: boolean;
}

const MODAL_CLASS_NAME = 'modal';

class Modal extends React.Component<IModalProps> {

    private closeModal = (e: any) => {
        if (e.target.className === MODAL_CLASS_NAME) {
            this.props.closeModal();
        }
    }

    public render(): any {
        if (!this.props.isVisible) return '';

        return (
        <div
            className={MODAL_CLASS_NAME}
            onClick={this.closeModal}
        >
            <div className='modal-wrapper'>
                {this.props.children}
            </div>
        </div>
        );
    }
}
export default Modal;
