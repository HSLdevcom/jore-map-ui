import React from 'react';
import { IValidationResult } from '~/validation/FormValidator';
import ButtonType from '~/enums/buttonType';
import InputContainer from '../sidebar/InputContainer';
import Button from './Button';
import * as s from './calculatedInputField.scss';

interface ICalculatedInputFieldProps {
    label: string;
    value: number;
    calculatedValue: number;
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
            disabled={props.isDisabled || props.value === props.calculatedValue}
            onClick={props.useCalculatedValue}
            type={ButtonType.SQUARE}
            className={s.calulateButton}
        >
            Laske
            <span>{props.calculatedValue}m</span>
        </Button>
    </div>
);

export default CalculatedInputField;
