import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { SidebarStore } from '../../stores/sidebarStore';
import LoginButton from '../controls/LoginButton';
import EditableLines from './EditableLines';
import LineSearch from './LineSearch';
import './Sidebar.css';

interface ISidebarProps {
    sidebarStore?: SidebarStore;
    showLogin: boolean;
    handleModalLoginButton(event: any): void;
}

interface ILinelistState {
    searchInput: string;
}

@inject('sidebarStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    constructor(props: ISidebarProps) {
        super(props);
    }

    public handleHeaderClick = () => {
        this.props.sidebarStore!.removeSelectedLines();
    }

    public render(): any {
        return (
          <div className='sidebar-container'>
            <div className='sidebar-header'>
              <div onClick={this.handleHeaderClick} className='sidebar-header-container'>
                <img className='sidebar-logo' src='hsl-logo.png' />
                <h2 className='sidebar-title'>
                  Joukkoliikennerekisteri
                </h2>
              </div>
            </div>
            <div className='sidebar-content'>
              <LoginButton
                  className='login-button-sidebar'
                  show={this.props.showLogin}
                  handleLoginModal={this.props.handleModalLoginButton}
              />
              { this.props.sidebarStore!.selectedLines.length < 1 &&
                <LineSearch
                  showLogin={this.props.showLogin}
                  handleModalLoginButton={this.props.handleModalLoginButton}
                />
              }
              {this.props.sidebarStore!.selectedLines.length > 0 &&
                <EditableLines nodes={this.props.sidebarStore!.selectedLines} />
              }
            </div>
          </div>
        );
    }
}

export default Sidebar;
