import * as React from 'react';
import classnames from 'classnames';
import * as s from './linkView.scss';

interface IInputProps {
    label: string;
    placeholder: string;
    className?: string;
}

class InputContainer extends React.Component<IInputProps> {
    public render(): any {
        return (
            <div className={s.inputContainer}>
                <div className={classnames(s.subTopic)}>
                    {this.props.label}
                </div>
                <input
                    placeholder={this.props.placeholder}
                    type='text'
                    className={this.props.className}
                />
            </div>
        );
    }
}

export default InputContainer;
