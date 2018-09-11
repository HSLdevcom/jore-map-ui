import * as React from 'react';
import * as s from './radioButton.scss';

interface IRadioButtonProps {
    checked: boolean;
    text: string;
    onClick(event: any): void;
}

class RadioButton extends React.Component<IRadioButtonProps, {}> {
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
                    type={'radio'}
                    checked={this.props.checked}
                    onChange={this.doNothing}
                />
                <span className={s.checkmark} />
            </label>
        );
    }
}

export default RadioButton;
