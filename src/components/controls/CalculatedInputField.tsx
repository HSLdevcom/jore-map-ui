import React from 'react';
import { IValidationResult } from '~/validation/FormValidator';
import ButtonType from '~/enums/buttonType';
import Button from './Button';
import InputContainer from './InputContainer';
import * as s from './calculatedInputField.scss';

interface ICalculatedInputFieldProps {
    label: string;
    value: number;
    isDisabled: boolean;
    validationResult?: IValidationResult;
    onChange: (value: number) => void;
    useCalculatedValue: () => void;
}

const CalculatedInputField = (props: ICalculatedInputFieldProps) => (
    <div className={s.calculateInputFieldView}>
        <InputContainer
            label={props.label}
            value={props.value}
            disabled={props.isDisabled}
            type='number'
            onChange={props.onChange}
            validationResult={props.validationResult}
        />
        <Button
            disabled={props.isDisabled}
            onClick={props.useCalculatedValue}
            type={ButtonType.SQUARE}
            className={s.calulateButton}
        >
            Laske
        </Button>
    </div>
);

export default CalculatedInputField;
