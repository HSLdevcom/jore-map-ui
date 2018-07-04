import DevTools from 'mobx-react-devtools'
import * as React from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import './App.css'
import LoginButton from './LoginButton'
import LoginModal from './LoginModal'
import Map from './Map'

const rootPath: string = '/'

interface IAppState {
  showLogin: boolean
}

class App extends React.Component<any, IAppState> {
  constructor(props: any) {
    super(props)
    this.state = {
      showLogin: false
    }
  }

  public handleLoginModal = () => {
    const show = !this.state.showLogin
    this.setState({
      showLogin: show
    })
  }

  public handleModalLoginButton = () => {
    this.handleLoginModal()
  }

  public render(): any {
    return (
      <Router>
        <div className={'app-container'}>
          <DevTools />
          <Map/>
          {this.state.showLogin && <LoginModal handleModalLoginButton={this.handleModalLoginButton}/>}
          <LoginButton handleLoginModal={this.handleLoginModal}/>
          <Route exact={true} path='/' rootPath={rootPath}/>
        </div>
      </Router>
    )
  }
}

export default App
