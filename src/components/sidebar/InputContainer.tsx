import React from 'react';
import classnames from 'classnames';
import FormValidator from '../../validation/FormValidator';
import * as s from './inputContainer.scss';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: Function;
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

    private validate = (value: string) => {
        const validatorResult = FormValidator.validate(value, this.props.validatorRule!);
        this.setState({
            isValid: validatorResult.isValid,
            errorMessage: validatorResult.errorMessage,
        });
        return validatorResult;
    }

    private shouldUpdate = () => {
        return (!this.props.disabled && this.props.onChange);
    }

    private onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (this.shouldUpdate()) {
            if (this.props.validatorRule) {
                const validationResult = this.validate(value);
                this.props.onChange!(value, validationResult);
            } else {
                this.props.onChange!(value);
            }
        }
    }

    render() {
        return (
            <div className={s.formItem}>
                <div className={s.inputLabel}>
                    {this.props.label}
                    {!this.props.disabled && this.props.icon && this.props.onIconClick &&
                    <div className={s.inline} onClick={this.props.onIconClick!}>
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
                { this.state.errorMessage &&
                    <div className={s.errorMessage}>
                        {this.state.errorMessage}
                    </div>
                }
            </div>
        );
    }
}

export default InputContainer;
