import DevTools from 'mobx-react-devtools'
import * as React from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import './App.css'
import LoginModal from './LoginModal'
import Map from './Map'
import Sidebar from './Sidebar'
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


  public handleModalLoginButton = () => {
    const show = !this.state.showLogin
    this.setState({
      showLogin: show
    })
  }

  public render(): any {
    return (
      <Router>
        <div className={'app-container'}>
          <DevTools />
          <Map/>
          {this.state.showLogin && <LoginModal handleModalLoginButton={this.handleModalLoginButton}/>}
          <Sidebar showLogin={this.state.showLogin} handleModalLoginButton={this.handleModalLoginButton}/>
          <Route exact={true} path='/' rootPath={rootPath}/>
        </div>
      </Router>
    )
  }
}

export default App
