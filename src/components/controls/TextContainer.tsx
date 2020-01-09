import classnames from 'classnames';
import { observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import * as s from './inputContainer.scss';

interface ITextContainerProps {
    label: string | JSX.Element;
    value?: string | number | null | Date;
    isTimeIncluded?: boolean;
    isInputLabelDarker?: boolean;
    isInputColorRed?: boolean;
}

const TextContainer = observer((props: ITextContainerProps) => (
    <div className={s.formItem}>
        <div className={props.isInputLabelDarker ? s.darkerInputLabel : s.inputLabel}>
            {props.label}
        </div>
        <div
            className={classnames(
                s.inputField,
                s.staticHeight,
                props.isInputColorRed ? s.redInputText : null
            )}
        >
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
