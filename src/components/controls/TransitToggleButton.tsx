import * as React from 'react';
import lineHelper from '../../util/lineHelper';
import TransitType from '../../enums/transitType';
import classNames from 'classnames';
import {
    toggle,
    toggled,
} from './transitToggleButton.scss';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';

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

    public toggleActivity = () => {
        this.props.toggleActivity(this.props.type);
    }

    private getMergedClass = (transitType: TransitType, isToggled: boolean) => {
        if (isToggled) {
            return classNames(
                toggle,
                TransitTypeColorHelper.getColorClass(transitType, true));
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
