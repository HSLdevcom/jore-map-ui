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
        this.validate(null, this.props.value);
    }

    componentWillReceiveProps(nextProps: IInputProps) {
        const forceUpdate = this.props.disabled !== nextProps.disabled;
        this.validate(this.props.value, nextProps.value, forceUpdate);
    }

    private updateValue = (value: any, validatorResult?: IValidationResult) => {
        if (this.props.type === 'number') {
            this.props.onChange!(parseFloat(value), validatorResult);
        } else {
            this.props.onChange!(value, validatorResult);
        }
    }

    private validate = (oldValue: any, newValue: any, forceUpdate?: boolean) => {
        if (!this.props.validatorRule) return;
        if (!forceUpdate && oldValue === newValue) return;

        const validatorResult: IValidationResult
            = FormValidator.validate(newValue, this.props.validatorRule);
        this.setState({
            isValid: validatorResult.isValid,
            errorMessage: validatorResult.errorMessage,
        });
        return validatorResult;
    }

    private onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        let validatorResult: IValidationResult | undefined = undefined;
        if (this.props.validatorRule) {
            validatorResult = this.validate(this.props.value, value);
        }
        this.updateValue(value, validatorResult);
    }

    private renderDisabledContent = () => {
        const type = this.props.type || 'text';

        if (type === 'text' || type === 'number') {
            return (
                <div className={s.editingDisabled}>
                    {this.props.value!}
                </div>
            );
        }
        if (type === 'date') {
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
        throw new Error(`inputContainer type not supported: ${type}`);
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

    private renderInputLabel = () => {
        const isIconVisible = !this.props.disabled && this.props.icon && this.props.onIconClick;
        return (
            <div className={s.inputLabel}>
                {this.props.label}
                {isIconVisible &&
                <div
                    className={classnames(s.inline, s.pointer)}
                    onClick={this.props.onIconClick!}
                >
                    {this.props.icon}
                </div>
                }
            </div>
        );
    }

    render() {
        return (
            <div className={s.formItem}>
                {this.renderInputLabel()}
                {
                    this.props.disabled ?
                        this.renderDisabledContent() :
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
