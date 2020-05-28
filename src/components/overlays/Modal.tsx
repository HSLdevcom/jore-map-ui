import { inject, observer } from 'mobx-react';
import React from 'react';
import { ModalStore } from '~/stores/modalStore';
import ModalContainer from './ModalContainer';

interface IModalProps {
    modalStore?: ModalStore;
}

@inject('modalStore')
@observer
class Modal extends React.Component<IModalProps> {
    render() {
        const modalStore = this.props.modalStore!;

        if (!modalStore.isOpen) return null;

        return <ModalContainer>{modalStore.content}</ModalContainer>;
    }
}

export default Modal;
