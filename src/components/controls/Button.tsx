import * as React from 'react';
import classNames from 'classnames';
import ButtonType from '../../enums/buttonType';
import * as s from './button.scss';

interface IButtonProps {
    type: ButtonType;
    text: string;
    className?: string;
    onClick(event: any): void;
}

class Button extends React.Component<IButtonProps, {}> {
    constructor(props: IButtonProps) {
        super(props);
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

    private getClassname = (type: ButtonType, className?: string) => {
        const typeClass = type === ButtonType.PRIMARY ? s.primary : s.secondary;
        return classNames(s.button, typeClass, className);
    }
}

export default Button;
