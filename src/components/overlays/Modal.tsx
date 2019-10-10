import { observer } from 'mobx-react';
import React from 'react';
import * as s from './modal.scss';

interface IModalProps {
    onExteriorClick?: () => void;
    children: React.ReactNode;
}

const Modal = observer((props: IModalProps) => {
    const onExteriorDivClick = (e: any) => {
        if (e.target.className === s.modalView && props.onExteriorClick) {
            props.onExteriorClick();
        }
    };

    return (
        <div className={s.modalView} onClick={onExteriorDivClick}>
            <div className={s.wrapper}>{props.children}</div>
        </div>
    );
});

export default Modal;
