import * as React from 'react';
import classnames from 'classnames';
import s from './inputContainer.scss';
import FormValidator from '../../validation/FormValidator';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: Function;
    value?: string;
    validator?: string;
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
        const validatorResult = FormValidator.validateString(value, this.props.validator!);
        this.setState({
            isValid: validatorResult.isValid,
            errorMessage: validatorResult.errorMessage,
        });
    }

    private shouldUpdate = () => {
        return (!this.props.disabled && this.props.onChange);
    }

    private onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        if (this.shouldUpdate()) {
            if (this.props.validator) {
                this.validate(value);
            }

            this.props.onChange!(value);
        }
    }

    public render(): any {
        return (
            <div className={s.formItem}>
                <div className={s.inputLabel}>
                    {this.props.label}
                </div>
                <input
                    placeholder={this.props.disabled ? '' : this.props.placeholder}
                    type='text'
                    className={
                        classnames(
                            this.props.className,
                            this.props.disabled ? s.disabled : null,
                            !this.state.isValid ? s.invalidInput : null)
                    }
                    disabled={this.props.disabled}
                    value={this.props.value!}
                    onChange={this.onChange}
                />
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
