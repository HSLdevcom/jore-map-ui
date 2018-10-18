import * as React from 'react';
import classnames from 'classnames';
import s from './inputContainer.scss';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: Function;
    name?: string;
    value?: string;
}

class InputContainer extends React.Component<IInputProps> {
    public render(): any {
        const onChange = (e: React.FormEvent<HTMLInputElement>) => {
            if (!this.props.disabled && this.props.onChange) {
                const value = e.type === 'checkbox'
                    ? e.currentTarget.checked
                    : e.currentTarget.value;
                this.props.onChange!(this.props.name, value);
            }
        };

        return (
            <div className={s.inputContainer}>
                <div className={classnames(s.subTopic)}>
                    {this.props.label}
                </div>
                <input
                    placeholder={this.props.disabled ? '' : this.props.placeholder}
                    type='text'
                    className={this.props.className}
                    disabled={this.props.disabled}
                    value={this.props.value!}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default InputContainer;
