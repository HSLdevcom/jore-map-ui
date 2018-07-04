import * as React from 'react'
import './LoginButton.css'

interface ILoginButtonProps {
  handleLoginModal(event: any): void
}

class LoginButton extends React.Component<ILoginButtonProps, {}> {
  constructor(props: ILoginButtonProps) {
    super(props)
  }


  public render(): any {
    return (
      <button
        onClick={this.props.handleLoginModal}
        className='login-button'>
        Kirjaudu
      </button>
    )
  }
}

export default LoginButton
