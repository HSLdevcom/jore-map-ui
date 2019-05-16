import React from 'react';
import { observer } from 'mobx-react';
import Moment from 'moment';
import classnames from 'classnames';
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
    capitalizeInput?: boolean;
    isClearButtonVisibleOnDates?: boolean;
    darkerInputLabel?: boolean;
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
            />
        );
    }

    return (
        <input
            placeholder={props.disabled ? '' : props.placeholder}
            type={props.type === 'number' ? 'number' : 'text'}
            className={classnames(
                props.className,
                props.disabled ? s.disabled : null,
                validationResult && !validationResult.isValid
                    ? s.invalidInput
                    : null
            )}
            value={
                props.value !== null && props.value !== undefined
                    ? (props.value as string | number)
                    : ''
            }
            onChange={onChange}
        />
    );
};

const renderValidatorResult = (validationResult?: IValidationResult) => {
    if (!validationResult || !validationResult.errorMessage) {
        return null;
    }
    return (
        <div className={s.errorMessage}>{validationResult.errorMessage}</div>
    );
};

const InputContainer = observer((props: IInputProps) => {
    const validationResult = props.validationResult;

    if (props.disabled) {
        if (props.type === 'date') {
            return (
                <div className={s.disabledContainerWrapper}>
                    <TextContainer
                        label={props.label}
                        value={
                            props.value
                                ? Moment(props.value).format('DD.MM.YYYY HH:mm')
                                : '-'
                        }
                        darkerInputLabel={props.darkerInputLabel}
                    />
                    {renderValidatorResult(validationResult)}
                </div>
            );
        }
        return (
            <div className={s.disabledContainerWrapper}>
                <TextContainer
                    label={props.label}
                    value={props.value}
                    darkerInputLabel={props.darkerInputLabel}
                />
                {renderValidatorResult(validationResult)}
            </div>
        );
    }

    return (
        <div className={s.formItem}>
            <div
                className={
                    props.darkerInputLabel ? s.darkerInputLabel : s.inputLabel
                }
            >
                {props.label}
            </div>
            {renderEditableContent(props)}
            {renderValidatorResult(validationResult)}
        </div>
    );
});

export default InputContainer;
