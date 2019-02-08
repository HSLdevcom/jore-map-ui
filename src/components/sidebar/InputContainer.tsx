import React from 'react';
import classnames from 'classnames';
import FormValidator, { IValidationResult } from '../../validation/FormValidator';
import * as s from './inputContainer.scss';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: (value: any, validationResult?: IValidationResult) => void;
    value?: string|number;
    validatorRule?: string;
    icon?: React.ReactNode;
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
        this.validate(String(this.props.value), String(this.props.value));
    }

    componentWillReceiveProps(nextProps: IInputProps) {
        const forceUpdate = this.props.disabled !== nextProps.disabled;
        this.validate(String(this.props.value), String(nextProps.value), forceUpdate);
    }

    private validate = (oldValue: string, newValue: string, forceUpdate?: boolean) => {
        if (!this.props.onChange || !this.props.validatorRule) return;
        if ((oldValue === newValue) || forceUpdate) return;

        const wasValid = this.state.isValid;
        const validatorResult: IValidationResult
            = FormValidator.validate(newValue, this.props.validatorRule);
        const hasChanges = (oldValue !== newValue || wasValid !== validatorResult.isValid);
        if (forceUpdate || hasChanges) {
            this.setState({
                isValid: validatorResult.isValid,
                errorMessage: validatorResult.errorMessage,
            });
            this.props.onChange!(newValue, validatorResult);
        }
    }

    private onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (this.props.validatorRule) {
            this.validate(String(this.props.value), value);
        } else {
            this.props.onChange!(value);
        }
    }

    render() {
        return (
            <div className={s.formItem}>
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
                {this.props.disabled ?
                    (<div>
                        {this.props.value!}
                    </div>)
                    :
                    (<input
                        placeholder={this.props.disabled ? '' : this.props.placeholder}
                        type={typeof this.props.value === 'number' ? 'number' : 'text'}
                        className={
                            classnames(
                                this.props.className,
                                this.props.disabled ? s.disabled : null,
                                !this.state.isValid ? s.invalidInput : null)
                        }
                        disabled={this.props.disabled}
                        value={this.props.value!}
                        onChange={this.onChange}
                    />)
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
