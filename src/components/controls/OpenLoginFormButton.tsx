import * as React from 'react'
import { inject, observer } from '../../../node_modules/mobx-react'
import { LoginStore } from '../../stores/loginStore'
import './OpenLoginFormButton.css'

interface ILoginButtonProps {
  loginStore?: LoginStore
}

@inject('loginStore')
@observer
class OpenLoginFormButton extends React.Component<ILoginButtonProps> {
  public openLoginForm = () => {
    this.props.loginStore!.showLogin = true
  }

  public render(): any {
    return (
      <span
        onClick={this.openLoginForm}
        className='login-button'>
        Kirjaudu
      </span>
    )
  }
}

export default OpenLoginFormButton
