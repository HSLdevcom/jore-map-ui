import * as React from 'react';
import classnames from 'classnames';
import s from './inputContainer.scss';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: Function;
    value?: string;
}

class InputContainer extends React.Component<IInputProps> {
    public render(): any {
        const onChange = (e: React.FormEvent<HTMLInputElement>) => {
            if (!this.props.disabled && this.props.onChange) {
                this.props.onChange!(e.currentTarget.value);
            }
        };

        return (
            <div className={s.formItem}>
                <div className={s.inputLabel}>
                    {this.props.label}
                </div>
                <input
                    placeholder={this.props.disabled ? '' : this.props.placeholder}
                    type='text'
                    className={
                        classnames(this.props.className, this.props.disabled ? s.disabled : null)
                    }
                    disabled={this.props.disabled}
                    value={this.props.value!}
                    onChange={onChange}
                />
            </div>
        );
    }
}

export default InputContainer;
