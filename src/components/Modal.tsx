import React from 'react';
import { observer } from 'mobx-react';
import * as s from './modal.scss';

interface IModalProps {
    closeModal: Function;
    isVisible: boolean;
    children: React.ReactNode;
}

const Modal = observer((props: IModalProps) => {
    const closeModal = (e: any) => {
        if (e.target.className === s.modalView) {
            props.closeModal();
        }
    };

    if (!props.isVisible) return (null);

    return (
        <div
            className={s.modalView}
            onClick={closeModal}
        >
            <div className={s.wrapper}>
                {props.children}
            </div>
        </div>
    );
});

export default Modal;
