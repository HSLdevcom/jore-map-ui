import * as React from 'react';
import ButtonType from '../../enums/buttonType';
import classNames from 'classnames';
import { button, primary, secondary } from './button.scss';

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

    private getClassname = (type: ButtonType, className?: string) => {
        const typeClass = type === ButtonType.PRIMARY ? primary : secondary;
        return classNames(button, typeClass, className);
    }

    public render(): any {
        return (
            <span
                className={this.getClassname(this.props.type, this.props.className)}
                onClick={this.props.onClick}
            >
                {this.props.text}
            </span>
        );
    }
}

export default Button;
