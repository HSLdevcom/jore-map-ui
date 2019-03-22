import React from 'react';
import classnames from 'classnames';
import { IValidationResult } from '~/validation/FormValidator';
import DatePicker from '../controls/DatePicker';
import TextContainer from './TextContainer';
import * as s from './inputContainer.scss';

type inputType = 'text' | 'number' | 'date';

interface IInputProps {
    label: string|JSX.Element;
    onChange: (value: any) => void;
    validationResult?: IValidationResult;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    value?: string|number|Date;
    validatorRule?: string;
    type?: inputType; // Defaults to text
}

const renderEditableContent = (props: IInputProps) => {
    const type = props.type || 'text';
    const validationResult = props.validationResult;
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (props.type === 'number') {
            const parsedValue = parseFloat(value);
            props.onChange!(
                !isNaN(parsedValue) ? parsedValue : null,
            );
        } else {
            props.onChange!(value);
        }
    };

    if (type === 'date') {
        return (
            <DatePicker
                value={(props.value! as Date)}
                onChange={props.onChange!}
            />
        );
    }

    return (
        <input
            placeholder={props.disabled ? '' : props.placeholder}
            type={props.type === 'number' ? 'number' : 'text'}
            className={
                classnames(
                    props.className,
                    props.disabled ? s.disabled : null,
                    (validationResult && !validationResult.isValid) ? s.invalidInput : null)
            }
            value={props.value !== null && props.value !== undefined ?
                (props.value as string | number) : ''}
            onChange={onChange}
        />
    );
};

const InputContainer = (props: IInputProps) => {
    const validationResult = props.validationResult;

    if (props.disabled) {
        return (
            <TextContainer
                label={props.label}
                value={props.value}
            />
        );
    }

    return (
        <div className={s.formItem}>
            <div className={s.inputLabel}>
                {props.label}
            </div>
            {
                renderEditableContent(props)
            }
            { validationResult && validationResult.errorMessage && !props.disabled &&
                <div className={s.errorMessage}>
                    {validationResult.errorMessage}
                </div>
            }
        </div>
    );
};

export default InputContainer;
