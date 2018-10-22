import * as React from 'react';
import classNames from 'classnames';
import ButtonType from '~/enums/buttonType';
import * as s from './button.scss';

interface IButtonProps {
    type: ButtonType;
    text: string;
    className?: string;
    disabled?: boolean;
    onClick(event: any): void;
}

class Button extends React.Component<IButtonProps, {}> {
    public static defaultProps: Partial<IButtonProps> = {
        disabled: false,
    };

    private getTypeClass = (type: ButtonType) => {
        switch (type) {
        case ButtonType.SQUARE: {
            return s.square;
        }
        case ButtonType.SQUARE_SECONDARY: {
            return s.squareSecondary;
        }
        case ButtonType.ROUND: {
            return s.round;
        }
        case ButtonType.SAVE: {
            return s.save;
        }
        default: {
            return s.square;
        }
        }
    }

    private getClassname = (type: ButtonType, disabled: boolean, className?: string) => {
        const typeClass = this.getTypeClass(type);
        return classNames(s.button, typeClass, className, disabled ? s.disabled : null);
    }

    private onClick = (e: any) => {
        if (!this.props.disabled) {
            this.props.onClick(e);
        }
    }

    public render(): any {
        return (
            <div
                className={
                    this.getClassname(
                        this.props.type,
                        this.props.disabled!,
                        this.props.className,
                    )
                }
                onClick={this.onClick}
            >
                {this.props.text}
            </div>
        );
    }
}

export default Button;
