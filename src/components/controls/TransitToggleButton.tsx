import * as React from 'react';
import lineHelper from '../../util/lineHelper';

interface ITransitToggleButtonProps {
    type: string;
    toggled: boolean;
    toggleActivity(event: string): void;
}

interface ITransitToggleButtonState {
    type: string;
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
