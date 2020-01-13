import classnames from 'classnames';
import { observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { IValidationResult } from '~/validation/FormValidator';
import * as s from './inputContainer.scss';

interface ITextContainerProps {
    label: string | JSX.Element;
    value?: string | number | null | Date;
    validationResult?: IValidationResult;
    isTimeIncluded?: boolean;
    isInputLabelDarker?: boolean;
    isInputColorRed?: boolean;
}

const renderValidatorResult = (validationResult?: IValidationResult) => {
    if (!validationResult || !validationResult.errorMessage) {
        return null;
    }
    return <div className={s.errorMessage}>{validationResult.errorMessage}</div>;
};

const TextContainer = observer((props: ITextContainerProps) => (
    <div className={s.formItem}>
        <div className={props.isInputLabelDarker ? s.darkerInputLabel : s.inputLabel}>
            {props.label}
        </div>
        <div
            className={classnames(
                s.textField,
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
        {renderValidatorResult(props.validationResult)}
    </div>
));

export default TextContainer;
