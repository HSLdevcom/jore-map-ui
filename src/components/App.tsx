import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { LoginStore } from '../stores/loginStore';
import './App.css';
import OpenLoginFormButton from './controls/OpenLoginFormButton';
import LoginModal from './login/LoginModal';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
const rootPath: string = '/';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps {
    loginStore?: LoginStore;
}

@inject('loginStore')
@observer
class App extends React.Component<IAppProps, IAppState> {
    public render(): any {
        return (
            <Router>
              <div className={'app-container'}>
                <Map/>
                <OpenLoginFormButton/>
                { this.props.loginStore!.showLogin &&
                    <LoginModal />
                }
                <Sidebar />
                <Route exact={true} path='/' rootPath={rootPath}/>
              </div>
            </Router>
        );
    }
}

export default App;
