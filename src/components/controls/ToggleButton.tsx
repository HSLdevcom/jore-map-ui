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
    value: boolean;
}

class ToggleButton extends React.Component<IToggleButtonProps, IToggleButtonState> {
    constructor (props: IToggleButtonProps) {
        super(props);
    }

    private getClassname = () => {
        if (this.props.value) {
            return classNames(slider,  TransitTypeColorHelper.getColorClass(this.props.type, true));
        }
        return slider;
    }

    public render(): any {
        const buttonOnClick = (event: React.MouseEvent<HTMLElement>) => {
            this.props.onClick(event);
            event.stopPropagation();
            event.preventDefault();
        };

        return (
            <label
                onClick={buttonOnClick}
                className={switchControl}
            >
                <input type='checkbox' checked={this.props.value}/>
                <div
                    className={this.getClassname()}
                />
            </label>
        );
    }
}

export default ToggleButton;
