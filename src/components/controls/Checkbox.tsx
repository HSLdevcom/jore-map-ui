import React from 'react';
import * as s from './checkbox.scss';

interface ICheckboxProps {
    checked: boolean;
    text: string;
    onClick(): void;
}

class Checkbox extends React.Component<ICheckboxProps, {}> {
    private doNothing = () => {};

    private onClick = (event: React.MouseEvent<HTMLElement>) => {
        this.props.onClick();
        event.stopPropagation();
        event.preventDefault();
    }

    public render() {
        return (
            <label
                onClick={this.onClick}
                className={s.container}
            >
                {this.props.text}
                <input
                    type='checkbox'
                    checked={this.props.checked}
                    onChange={this.doNothing}
                />
                <span className={s.checkmark} />
            </label>
        );
    }
}

export default Checkbox;
