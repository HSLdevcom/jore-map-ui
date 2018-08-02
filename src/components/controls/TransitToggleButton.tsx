import * as React from 'react';
import lineHelper from '../../util/lineHelper';
import TransitType from '../../enums/transitType';
import classNames from 'classnames';
import {
    bus,
    ferry,
    subway,
    toggle,
    toggled,
    train,
    tram,
} from './transitToggleButton.scss';

interface ITransitToggleButtonProps {
    type: TransitType;
    toggled: boolean;
    toggleActivity(event: TransitType): void;
}

interface ITransitToggleButtonState {
    type: TransitType;
}

class TransitToggleButton extends React.Component
  <ITransitToggleButtonProps, ITransitToggleButtonState> {
    constructor(props: ITransitToggleButtonProps) {
        super(props);
    }

    private getClass = (transitType: TransitType) => {
        switch (transitType) {
        case TransitType.BUS:
            return classNames(bus);
        case TransitType.FERRY:
            return classNames(ferry);
        case TransitType.SUBWAY:
            return classNames(subway);
        case TransitType.TRAM:
            return classNames(tram);
        case TransitType.TRAIN:
            return classNames(train);
        default:
            return classNames(subway);
        }
    }

    public toggleActivity = () => {
        this.props.toggleActivity(this.props.type);
    }

    private getMergedClass = (transitType: TransitType, isToggled: boolean) => {
        if (isToggled) {
            return classNames(toggle, this.getClass(transitType));
        }
        return classNames(toggle, toggled);
    }

    public render(): any {
        return (
      <button
        className={this.getMergedClass(this.props.type, this.props.toggled)}
        onClick={this.toggleActivity}
      >
        {lineHelper.getTransitIcon(this.props.type, true)}
      </button>
        );
    }
}

export default TransitToggleButton;
