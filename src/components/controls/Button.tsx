import * as React from 'react';
import ButtonType from '../../enums/buttonType';
import './button.scss';

interface IButtonProps {
    onClick(event: any): void;
    type: ButtonType;
    text: string;
    className?: string;
}

class Button extends React.Component<IButtonProps, {}> {
    constructor(props: IButtonProps) {
        super(props);
    }

    public render(): any {
        return (
            <span
                className={'button ' + this.props.type + ' ' + this.props.className}
                onClick={this.props.onClick}
            >
                {this.props.text}
            </span>
        );
    }
}

export default Button;
