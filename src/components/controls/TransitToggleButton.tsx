import React from 'react';
import classNames from 'classnames';
import lineHelper from '~/util/lineHelper';
import TransitType from '~/enums/transitType';
import TransitTypeColorHelper from '~/util/transitTypeColorHelper';
import * as s from './transitToggleButton.scss';

interface ITransitToggleButtonProps {
    type: TransitType;
    toggled: boolean;
    disabled?: boolean;
    toggleActivity(event: TransitType): void;
}

interface ITransitToggleButtonState {
    type: TransitType;
}

class TransitToggleButton extends React.Component
  <ITransitToggleButtonProps, ITransitToggleButtonState> {
    public toggleActivity = () => {
        this.props.toggleActivity(this.props.type);
    }

    private getToggledButtonClass = (transitType: TransitType, isToggled: boolean) => {
        if (isToggled) {
            return TransitTypeColorHelper.getBackgroundColorClass(transitType);
        }
        return s.toggled;
    }

    public render() {
        return (
            <div
                className={classNames(
                    s.button,
                    this.getToggledButtonClass(this.props.type, this.props.toggled),
                    this.props.disabled ? s.disabled : undefined,
                )}
                onClick={!this.props.disabled ? this.toggleActivity : void 0}
            >
                {lineHelper.getTransitIcon(this.props.type, true)}
            </div>
        );
    }
}

export default TransitToggleButton;
