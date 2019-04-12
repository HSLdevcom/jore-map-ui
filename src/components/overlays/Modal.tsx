import React from 'react';
import { observer } from 'mobx-react';
import * as s from './modal.scss';

interface IModalProps {
    onExteriorClick?: () => void;
    children: React.ReactNode;
}

const Modal = observer((props: IModalProps) => (
    <div
        className={s.modalView}
        onClick={props.onExteriorClick ? props.onExteriorClick : undefined}
    >
        <div className={s.wrapper}>
            {props.children}
        </div>
    </div>
));

export default Modal;
