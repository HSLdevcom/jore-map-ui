import * as React from 'react';
import TransitType from '../../enums/transitType';
import classNames from 'classnames';
import {
    switchControl,
    slider,
} from './toggleButton.scss';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';

interface IToggleButtonState {
    isChecked: boolean;
}

interface IToggleButtonProps {
    type: TransitType;
    onClick(event: any): void;
}

class ToggleButton extends React.Component<IToggleButtonProps, IToggleButtonState> {
    constructor (props: IToggleButtonProps) {
        super(props);
        this.state = {
            isChecked: false,
        };
    }

    private toggle = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ isChecked: !this.state.isChecked });
        event.stopPropagation();
        event.preventDefault();
    }

    private getClassname = () => {
        if (this.state.isChecked) {
            return classNames(slider,  TransitTypeColorHelper.getColorClass(this.props.type, true));
        }
        return slider;
    }

    public render(): any {
        return (
            <label
                onClick={this.toggle}
                className={switchControl}
            >
                <input
                    type='checkbox'
                    checked={this.state.isChecked}
                />
                <div
                    className={this.getClassname()}
                />
            </label>
        );
    }
}

export default ToggleButton;
