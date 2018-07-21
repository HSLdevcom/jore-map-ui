import * as React from 'react'
import lineHelper from '../util/lineHelper'
import './TransitToggleButton.css'

interface ITransitToggleButtonProps {
  type: string
  toggled: boolean
  handleToggle(event: any): void
}

interface ITransitToggleButtonState {
  type: string
}

class TransitToggleButton extends React.Component<ITransitToggleButtonProps, ITransitToggleButtonState> {
  constructor(props: ITransitToggleButtonProps) {
    super(props)
    this.state = {
      type: this.props.type
    }
  }

  public handleClick = () => {
    this.props.handleToggle(this.state.type)
  }

  public toggleClass = () => {
    if (this.props.toggled) {
      return 'transit-toggle ' + this.state.type
    } else {
      return 'transit-toggle toggled'
    }
  }

  public render(): any {
    return (
      <button
        className={this.toggleClass()}
        onClick={this.handleClick}
      >
        {lineHelper.getTransitIcon(this.state.type, true)}
      </button>
    )
  }
}

export default TransitToggleButton
