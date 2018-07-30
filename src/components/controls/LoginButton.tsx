import * as React from 'react'

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
      <span
        className={this.props.className}
        hidden={this.props.show}
        onClick={this.props.handleLoginModal}>
        Kirjaudu
      </span>
    )
  }
}

export default LoginButton
