import React from 'react';
import { observer } from 'mobx-react';
import Moment from 'moment';
import * as s from './inputContainer.scss';

interface ITextContainerProps {
    label: string | JSX.Element;
    value?: string | number | null | Date;
    isTimeIncluded?: boolean;
    darkerInputLabel?: boolean;
}

const TextContainer = observer((props: ITextContainerProps) => (
    <div className={s.formItem}>
        <div className={props.darkerInputLabel ? s.darkerInputLabel : s.inputLabel}>
            {props.label}
        </div>
        <div className={s.staticHeight}>
            {props.value instanceof Date
                ? Moment(props.value!).format(
                      props.isTimeIncluded ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY'
                  )
                : props.value
                ? props.value
                : '-'}
        </div>
    </div>
));

export default TextContainer;
