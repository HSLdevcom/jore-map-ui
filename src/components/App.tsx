import * as React from 'react'
import {BrowserRouter as Router, Link, Route} from 'react-router-dom'
import './App.css'
import Login from './Login'
import Map from './Map'

const rootPath: string = '/'

class App extends React.Component {

  public render(): any {
    return (
      <Router>
        <div>
          <Map/>
          <nav>
            <Link to={'/'}>/</Link>&nbsp;
            <Link to={'/login'}>Login</Link>
          </nav>
          <Route exact={true} path='/' rootPath={rootPath}/>
          <Route path='/login/' component={Login} rootPath={rootPath}/>
        </div>
      </Router>
    )
  }
}

export default App
