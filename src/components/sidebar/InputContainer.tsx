import React from 'react';
import classnames from 'classnames';
import FormValidator, { IValidationResult } from '../../validation/FormValidator';
import DatePicker from '../controls/DatePicker';
import TextContainer from './TextContainer';
import * as s from './inputContainer.scss';

type inputType = 'text' | 'number' | 'date';

interface IInputProps {
    label: string|JSX.Element;
    onChange: (value: any, validationResult?: IValidationResult) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    value?: string|number|Date;
    validatorRule?: string;
    type?: inputType; // Defaults to text
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
        this.validate(null, this.props.value);
    }

    componentWillReceiveProps(nextProps: IInputProps) {
        const forceUpdate = this.props.disabled !== nextProps.disabled;
        this.validate(this.props.value, nextProps.value, forceUpdate);
    }

    private onChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.validate(this.props.value, e.currentTarget.value);
    }

    private validate = (oldValue: any, newValue: any, forceUpdate?: boolean) => {
        if (!forceUpdate && oldValue === newValue) return;
        if (!this.props.validatorRule) {
            this.updateParent(newValue);
            return;
        }
        const validatorResult: IValidationResult
            = FormValidator.validate(newValue, this.props.validatorRule);
        this.setState({
            isValid: validatorResult.isValid,
            errorMessage: validatorResult.errorMessage,
        });
        this.updateParent(newValue, validatorResult);
    }

    private updateParent = (value: any, validatorResult?: IValidationResult) => {
        if (this.props.type === 'number') {
            const parsedValue = parseFloat(value);
            this.props.onChange!(
                !isNaN(parsedValue) ? parsedValue : null,
                validatorResult,
            );
        } else {
            this.props.onChange!(value, validatorResult);
        }
    }

    private renderEditableContent = () => {
        const type = this.props.type || 'text';

        if (type === 'date') {
            return (
                <DatePicker
                    value={(this.props.value! as Date)}
                    onChange={this.props.onChange!}
                />
            );
        }
        const value = (typeof this.props.value === 'string'
            || typeof this.props.value === 'number') ?
            this.props.value : '';

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
                value={value}
                onChange={this.onChange}
            />
        );
    }

    render() {
        if (this.props.disabled) {
            return (
                <TextContainer
                    label={this.props.label}
                    value={this.props.value}
                />
            );
        }

        return (
            <div className={s.formItem}>
                <div className={s.inputLabel}>
                    {this.props.label}
                </div>
                {
                    this.renderEditableContent()
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
