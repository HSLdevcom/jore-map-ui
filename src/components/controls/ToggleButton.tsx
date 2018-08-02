import * as React from 'react';
import TransitType from '../../enums/transitType';
import classNames from 'classnames';
import {
    bus,
    ferry,
    slider,
    subway,
    switchControl,
    train,
    tram,
} from './toggleButton.scss';

interface IToggleButtonProps {
    type: TransitType;
    onClick(event: any): void;
}

class ToggleButton extends React.Component<IToggleButtonProps, {}> {
    private getTypeClass = (type: TransitType) => {
        switch (type) {
        case TransitType.BUS:
            return classNames(slider, bus);
        case TransitType.FERRY:
            return classNames(slider, ferry);
        case TransitType.SUBWAY:
            return classNames(slider, subway);
        case TransitType.TRAM:
            return classNames(slider, tram);
        case TransitType.TRAIN:
            return classNames(slider, train);
        default:
            return classNames(slider, bus);
        }
    }

    public render(): any {
        return (
            <label
                onClick={this.props.onClick}
                className={switchControl}
            >
                <input type='checkbox' />
                <div
                    className={this.getTypeClass(this.props.type)}
                />
            </label>
        );
    }
}

export default ToggleButton;
