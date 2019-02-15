import React from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { IoMdCalendar, IoMdClose } from 'react-icons/io';
import DatePicker from 'react-date-picker';
import FormValidator, { IValidationResult } from '../../validation/FormValidator';
import * as s from './inputContainer.scss';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: (value: any, validationResult?: IValidationResult) => void;
    value?: string|number|Date;
    validatorRule?: string;
    icon?: React.ReactNode;
    type?: 'text' | 'number' | 'date';
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

    private validate = (oldValue: any, newValue: any, forceUpdate?: boolean) => {
        if (!this.props.onChange || !this.props.validatorRule) return;
        if ((oldValue === newValue) && !forceUpdate) return;

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
            this.validate(this.props.value, value);
        } else {
            this.props.onChange!(value);
        }
    }

    private onDatePickerChange = (date: Date) => {
        this.props.onChange!(date);
    }

    render() {
        const type = this.props.type || 'text';
        const dateStringDisplayFormat = 'DD.MM.YYYY';

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
                        {type === 'date'
                            ? moment(this.props.value!).format(dateStringDisplayFormat)
                            : this.props.value!}
                    </div>)
                    : type === 'date' ?
                    (
                        <div className={s.datepickerContainer}>
                            <DatePicker
                                value={(this.props.value as Date)}
                                onChange={this.onDatePickerChange}
                                locale='fi-FI'
                                calendarIcon={<IoMdCalendar />}
                                clearIcon={<IoMdClose />}
                            />
                        </div>
                    ) : (
                        <input
                            placeholder={this.props.disabled ? '' : this.props.placeholder}
                            type={typeof this.props.value === 'number' ? 'number' : 'text'}
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
                    )
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
