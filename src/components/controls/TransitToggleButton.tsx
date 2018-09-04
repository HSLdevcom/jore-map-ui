import * as React from 'react';
import classNames from 'classnames';
import lineHelper from '../../util/lineHelper';
import TransitType from '../../enums/transitType';
import TransitTypeColorHelper from '../../util/transitTypeColorHelper';
import * as s from './transitToggleButton.scss';

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

    public render(): any {
        return (
            <button
                className={classNames(
                    s.toggle,
                    this.getToggledButtonClass(this.props.type, this.props.toggled),
                )}
                onClick={this.toggleActivity}
            >
                {lineHelper.getTransitIcon(this.props.type, true)}
            </button>
        );
    }

    private getToggledButtonClass = (transitType: TransitType, isToggled: boolean) => {
        if (isToggled) {
            return TransitTypeColorHelper.getBackgroundColorClass(transitType);
        }
        return s.toggled;
    }
}

export default TransitToggleButton;
