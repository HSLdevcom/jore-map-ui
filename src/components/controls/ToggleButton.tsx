import * as React from 'react';
import TransitType from '../../enums/transitType';
import classNames from 'classnames';
import * as s from './toggleButton.scss';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';

interface IToggleButtonState {
    isChecked: boolean;
}

interface IToggleButtonProps {
    type: TransitType;
    onClick(event: any): void;
    value: boolean;
}

class ToggleButton extends React.Component<IToggleButtonProps, IToggleButtonState> {
    constructor (props: IToggleButtonProps) {
        super(props);
    }

    private getClassname = () => {
        if (this.props.value) {
            return classNames(
                s.slider,  TransitTypeColorHelper.getBackgroundColorClass(this.props.type));
        }
        return s.slider;
    }

    private doNothing() {
        // Empty function
        // Needed because input field wants an onChange function if its checked field is changed
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
                className={s.toggleButtonView}
            >
                <input
                    type='checkbox'
                    checked={this.props.value}
                    onChange={this.doNothing}
                />
                <div
                    className={this.getClassname()}
                />
            </label>
        );
    }
}

export default ToggleButton;
