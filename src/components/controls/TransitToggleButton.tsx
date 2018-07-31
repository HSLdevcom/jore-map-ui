import * as React from 'react';
import lineHelper from '../../util/lineHelper';
import TransitType from '../../enums/transitType';

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
        this.state = {
            type: this.props.type,
        };
    }

    public toggleActivity = () => {
        this.props.toggleActivity(this.state.type);
    }

    public render(): any {
        return (
      <button
        className={`transit-toggle ${this.props.toggled ? this.state.type : 'toggled'}`}
        onClick={this.toggleActivity}
      >
        {lineHelper.getTransitIcon(this.state.type, true)}
      </button>
        );
    }
}

export default TransitToggleButton;
