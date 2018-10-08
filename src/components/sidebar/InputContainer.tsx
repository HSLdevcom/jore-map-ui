import * as React from 'react';
import classnames from 'classnames';
import s from './inputContainer.scss';

interface IInputProps {
    label: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

class InputContainer extends React.Component<IInputProps> {
    public render(): any {
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
                />
            </div>
        );
    }
}

export default InputContainer;
