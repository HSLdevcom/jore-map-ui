import * as React from 'react'
import './TransitToggleButton.css'

interface IToggleButtonProps {
  type: string
  toggled: boolean
  handleToggle(event: any): void
}

interface IToggleButtonState {
  type: string
}

class ToggleButton extends React.Component<IToggleButtonProps, IToggleButtonState> {
  constructor(props: IToggleButtonProps) {
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
      return this.state.type
    } else {
      return 'untoggled'
    }
  }

  public render(): any {
    return (
      <button
        id={this.toggleClass()}
        className={'transit-toggle'}
        onClick={this.handleClick}
      />
    )
  }
}

export default ToggleButton
