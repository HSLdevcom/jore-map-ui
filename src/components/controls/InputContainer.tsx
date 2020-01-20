import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { IValidationResult } from '~/validation/FormValidator';
import DatePicker from './DatePicker';
import TextContainer from './TextContainer';
import * as s from './inputContainer.scss';

type inputType = 'text' | 'number' | 'date';

interface IInputProps {
    label: string | JSX.Element;
    onChange?: (value: any) => void;
    validationResult?: IValidationResult;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    value?: string | number | Date | null;
    type?: inputType; // Defaults to text
    isEmptyDateValueAllowed?: boolean;
    capitalizeInput?: boolean;
    isInputColorRed?: boolean;
    isClearButtonVisibleOnDates?: boolean;
    isTimeIncluded?: boolean;
    isInputLabelDarker?: boolean;
    onFocus?: () => void;
}

const renderEditableContent = (props: IInputProps) => {
    const type = props.type || 'text';
    const validationResult = props.validationResult;
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        let value = e.currentTarget.value;
        if (props.type === 'number') {
            const parsedValue = parseFloat(value);
            props.onChange!(!isNaN(parsedValue) ? parsedValue : null);
        } else {
            if (props.capitalizeInput) {
                value = value.toUpperCase();
            }
            props.onChange!(value);
        }
    };

    if (type === 'date') {
        return (
            <DatePicker
                value={props.value! as Date}
                onChange={props.onChange!}
                isClearButtonVisible={props.isClearButtonVisibleOnDates}
                isEmptyValueAllowed={props.isEmptyDateValueAllowed}
                onFocus={props.onFocus}
            />
        );
    }

    return (
        <input
            placeholder={props.disabled ? '' : props.placeholder}
            type={props.type === 'number' ? 'number' : 'text'}
            className={classnames(
                s.staticHeight,
                s.inputField,
                props.disabled ? s.disabled : null,
                validationResult && !validationResult.isValid ? s.invalidInput : null
            )}
            value={
                props.value !== null && props.value !== undefined
                    ? (props.value as string | number)
                    : ''
            }
            onChange={onChange}
            onFocus={props.onFocus}
        />
    );
};

const renderValidatorResult = (validationResult?: IValidationResult) => {
    if (!validationResult || !validationResult.errorMessage) {
        return null;
    }
    return <div className={s.errorMessage}>{validationResult.errorMessage}</div>;
};

const InputContainer = observer((props: IInputProps) => {
    if (props.disabled) {
        return (
            <TextContainer
                label={props.label}
                value={props.value}
                validationResult={props.validationResult}
                isTimeIncluded={props.isTimeIncluded}
                isInputLabelDarker={props.isInputLabelDarker}
                isInputColorRed={props.isInputColorRed}
            />
        );
    }
    return (
        <div className={classnames(s.formItem, props.className)}>
            {props.label && (
                <div className={props.isInputLabelDarker ? s.darkerInputLabel : s.inputLabel}>
                    {props.label}
                </div>
            )}
            {renderEditableContent(props)}
            {renderValidatorResult(props.validationResult)}
        </div>
    );
});

export default InputContainer;
