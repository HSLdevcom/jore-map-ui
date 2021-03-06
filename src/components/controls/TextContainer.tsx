import classnames from 'classnames';
import { observer } from 'mobx-react';
import Moment from 'moment';
import React from 'react';
import { IValidationResult } from '~/validation/FormValidator';
import Loader from '../shared/loader/Loader';
import * as s from './inputContainer.scss';

interface ITextContainerProps {
    label?: string | JSX.Element;
    value?: string | number | null | Date;
    validationResult?: IValidationResult;
    isTimeIncluded?: boolean;
    isInputLabelDarker?: boolean;
    isLoading?: boolean;
    className?: string;
}

const renderValidatorResult = (validationResult?: IValidationResult) => {
    if (!validationResult || !validationResult.errorMessage) {
        return null;
    }
    return (
        <div className={validationResult.isValid ? s.warningMessage : s.errorMessage}>
            {validationResult.errorMessage}
        </div>
    );
};

const TextContainer = observer((props: ITextContainerProps) => {
    const {
        label,
        value,
        validationResult,
        isTimeIncluded,
        isInputLabelDarker,
        isLoading,
        className,
        ...attrs
    } = props;

    return (
        <div className={classnames(s.formItem, className)}>
            <div className={isInputLabelDarker ? s.darkerInputLabel : s.inputLabel}>
                {label ? label : ''}
            </div>
            <div className={classnames(s.textField, s.staticHeight)} {...attrs}>
                {isLoading ? (
                    <div className={s.loaderContainer}>
                        <Loader size='tiny' hasNoMargin={true} />
                    </div>
                ) : value instanceof Date ? (
                    Moment(value!).format(isTimeIncluded ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY')
                ) : value || typeof value === 'number' ? (
                    value
                ) : (
                    '-'
                )}
            </div>
            {renderValidatorResult(validationResult)}
        </div>
    );
});

export default TextContainer;
