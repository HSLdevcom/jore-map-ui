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

    private getTypeClass = (type: ButtonType) => {
        switch (type) {
        case ButtonType.PRIMARY: {
            return s.primary;
        }
        case ButtonType.SECONDARY: {
            return s.primary;
        }
        case ButtonType.ROUND: {
            return s.round;
        }
        default: {
            return s.primary;
        }
        }
    }

    private getClassname = (type: ButtonType, className?: string) => {
        const typeClass = this.getTypeClass(type);
        return classNames(s.button, typeClass, className);
    }

    public render(): any {
        return (
            <div
                className={this.getClassname(this.props.type, this.props.className)}
                onClick={this.props.onClick}
            >
                {this.props.text}
            </div>
        );
    }
}

export default Button;
