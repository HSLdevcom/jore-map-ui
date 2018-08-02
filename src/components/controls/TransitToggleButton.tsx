import * as React from 'react';
import lineHelper from '../../util/lineHelper';
import TransitType from '../../enums/transitType';
import './transitToggleButton.scss';

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
        className={`transit-toggle ${this.props.toggled ? this.props.type : 'toggled'}`}
        onClick={this.toggleActivity}
      >
        {lineHelper.getTransitIcon(this.props.type, true)}
      </button>
        );
    }
}

export default TransitToggleButton;
