import React from 'react';
import { observer } from 'mobx-react';
import Moment from 'moment';
import * as s from './inputContainer.scss';

interface IInputProps {
    label: string | JSX.Element;
    value?: string | number | null | Date;
    darkerInputLabel?: boolean;
}

const TextContainer = observer((props: IInputProps) => (
    <div className={s.formItem}>
        <div
            className={
                props.darkerInputLabel ? s.darkerInputLabel : s.inputLabel
            }
        >
            {props.label}
        </div>
        <div>
            {props.value instanceof Date
                ? Moment(props.value!).format('DD.MM.YYYY')
                : props.value
                ? props.value
                : '-'}
        </div>
    </div>
));

export default TextContainer;
