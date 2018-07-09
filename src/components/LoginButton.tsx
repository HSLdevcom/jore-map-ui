import * as React from 'react'
import './LoginButton.css'

interface ILoginButtonProps {
  className: string
  show: boolean
  handleLoginModal(event: any): void
}

class LoginButton extends React.Component<ILoginButtonProps, {}> {
  constructor(props: ILoginButtonProps) {
    super(props)
  }


  public render(): any {
    return (
      <button
        className={this.props.className}
        hidden={this.props.show}
        onClick={this.props.handleLoginModal}>
        Kirjaudu
      </button>
    )
  }
}

export default LoginButton
