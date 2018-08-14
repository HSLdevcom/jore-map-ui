import * as React from 'react';
import * as s from './checkbox.scss';

interface ICheckboxProps {
    onClick(event: any): void;
    checked: boolean;
    text: string;
}

class Checkbox extends React.Component<ICheckboxProps, {}> {
    private doNothing() {
        // Empty
    }

    public render(): any {
        const onClick = (event: React.MouseEvent<HTMLElement>) => {
            this.props.onClick(event);
            event.stopPropagation();
            event.preventDefault();
        };

        return (
            <label
                onClick={onClick}
                className={s.container}
            >
                {this.props.text}
                <input
                    type={'checkbox'}
                    checked={this.props.checked}
                    onChange={this.doNothing}
                />
                <span className={s.checkmark} />
            </label>
        );
    }
}

export default Checkbox;
