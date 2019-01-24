import React from 'react';
import classnames from 'classnames';
import ButtonType from '~/enums/buttonType';
import * as s from './button.scss';

interface IButtonProps {
    type: ButtonType;
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

    private onClick = (e: any) => {
        if (!this.props.disabled) {
            this.props.onClick(e);
        }
    }

    public render(): any {
        return (
            <div
                className={
                    classnames(
                        s.button,
                        this.props.className,
                        this.getTypeClass(this.props.type),
                        this.props.disabled ? s.disabled : null,
                    )
                }
                onClick={this.onClick}
            >
                {this.props.children}
            </div>
        );
    }
}

export default Button;
