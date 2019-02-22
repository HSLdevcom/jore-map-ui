import React from 'react';
import classnames from 'classnames';
import moment from 'moment';
import FormValidator, { IValidationResult } from '../../validation/FormValidator';
import DatePicker from '../controls/DatePicker';
import * as s from './inputContainer.scss';

type inputType = 'text' | 'number' | 'date';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: (value: any, validationResult?: IValidationResult) => void;
    value?: string|number|Date;
    validatorRule?: string;
    icon?: React.ReactNode;
    type?: inputType; // Defaults to text
    onIconClick?: () => void;
}

interface IInputState {
    isValid: boolean;
    errorMessage?: string;
}

class InputContainer extends React.Component<IInputProps, IInputState> {
    constructor(props: IInputProps) {
        super(props);
        this.state = {
            isValid: true,
            errorMessage: '',
        };
    }

    componentDidMount() {
        this.validateAndUpdate(null, this.props.value);
    }

    componentWillReceiveProps(nextProps: IInputProps) {
        const forceUpdate = this.props.disabled !== nextProps.disabled;
        this.validateAndUpdate(this.props.value, nextProps.value, forceUpdate);
    }

    private updateValue = (value: any, validatorResult?: IValidationResult) => {
        if (this.props.type === 'number') {
            this.props.onChange!(parseFloat(value), validatorResult);
        } else {
            this.props.onChange!(value, validatorResult);
        }
    }

    private validateAndUpdate = (oldValue: any, newValue: any, forceUpdate?: boolean) => {
        if (!this.props.onChange || !this.props.validatorRule) return;
        if ((oldValue === newValue || isNaN(newValue)) && !forceUpdate) return;

        const wasValid = this.state.isValid;
        const validatorResult: IValidationResult
            = FormValidator.validate(newValue, this.props.validatorRule);
        const hasChanges = (oldValue !== newValue || wasValid !== validatorResult.isValid);
        if (forceUpdate || hasChanges) {
            this.setState({
                isValid: validatorResult.isValid,
                errorMessage: validatorResult.errorMessage,
            });
            this.updateValue(newValue, validatorResult);
        }
    }

    private onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (this.props.validatorRule) {
            this.validateAndUpdate(this.props.value, value);
        } else {
            this.updateValue(value);
        }
    }

    private renderDisabledContent = (type: inputType) => {
        return (
            <div>
                {
                    type === 'date' ?
                        moment(this.props.value!).format('DD.MM.YYYY') :
                        this.props.value!
                }
            </div>
        );
    }

    private renderEditableContent = (type: inputType) => {
        if (type === 'date') {
            return (
                <DatePicker
                    value={(this.props.value! as Date)}
                    onChange={this.props.onChange!}
                />
            );
        }
        return (
            <input
                placeholder={this.props.disabled ? '' : this.props.placeholder}
                type={this.props.type === 'number' ? 'number' : 'text'}
                className={
                    classnames(
                        this.props.className,
                        this.props.disabled ? s.disabled : null,
                        !this.state.isValid ? s.invalidInput : null)
                }
                disabled={this.props.disabled}
                value={this.props.value ? (this.props.value as string | number) : ''}
                onChange={this.onChange}
            />
        );
    }

    private renderInputLabel = () => (
        <div className={s.inputLabel}>
            {this.props.label}
            {!this.props.disabled && this.props.icon && this.props.onIconClick &&
            <div
                className={classnames(s.inline, s.pointer)}
                onClick={this.props.onIconClick!}
            >
                {this.props.icon}
            </div>
            }
        </div>
    )

    render() {
        const type = this.props.type || 'text';

        return (
            <div className={s.formItem}>
                {this.renderInputLabel()}
                {
                    this.props.disabled ?
                        this.renderDisabledContent(type) :
                        this.renderEditableContent(type)
                }
                { this.state.errorMessage && !this.props.disabled &&
                    <div className={s.errorMessage}>
                        {this.state.errorMessage}
                    </div>
                }
            </div>
        );
    }
}

export default InputContainer;
