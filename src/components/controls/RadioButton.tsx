import * as React from 'react';
import * as s from './radioButton.scss';

interface IRadioButtonProps {
    checked: boolean;
    text: string;
    onClick(event: any): void;
}

class RadioButton extends React.Component<IRadioButtonProps, {}> {

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
    private doNothing() {
        // Empty
    }
}

export default RadioButton;
