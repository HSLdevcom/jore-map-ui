import * as React from 'react'
import LoginButton from './LoginButton'
import './Sidebar.css'
import TransitToggleButton from './TransitToggleButton'

interface ISidebarProps {
  showLogin: boolean
  handleModalLoginButton(event: any): void
}

interface ISidebarState {
  routeSearchInput: string
  toggles: any
}

class Sidebar extends React.Component<ISidebarProps, ISidebarState> {
  constructor(props: ISidebarProps) {
    super(props)
    this.state = {
      routeSearchInput: '',
      toggles: {
        bus: true,
        ferry: true,
        train: true,
        tram: true,
        underground: true
      }
    }
  }

  public handleSearchInputChange = (event: any) => {
    this.setState({
      routeSearchInput: event.target.value
    })
  }

  public handleToggle = (type: string) => {
    const value: boolean = !this.state.toggles[type]
    const toggleState: object = this.state.toggles
    toggleState[type] = value
    this.setState({
      toggles: toggleState
    })
  }

  public render(): any {
    return (
      <div className='sidebar-container'>
        <div className='sidebar-header'>
          <div className='sidebar-header-container'>
            <img className='sidebar-logo' src='hsl-logo.png' alt='HSL / HSRT'/>
            <h2 className='sidebar-title'>
              Joukkoliikennerekisteri
            </h2>
          </div>
        </div>
        <div className='sidebar-content'>
          <label className='routes-label'>
            Reitit<br/>
          </label>
          <div className='routes-input-container'>
            <input placeholder='Hae reitti' className='routes-input' type='text' value={this.state.routeSearchInput} onChange={this.handleSearchInputChange}/>
          </div>
          <div className='transit-toggle-container'>
            <TransitToggleButton handleToggle={this.handleToggle} toggled={this.state.toggles.bus} type='bus' />
            <TransitToggleButton handleToggle={this.handleToggle} toggled={this.state.toggles.tram} type='tram' />
            <TransitToggleButton handleToggle={this.handleToggle} toggled={this.state.toggles.train} type='train' />
            <TransitToggleButton handleToggle={this.handleToggle} toggled={this.state.toggles.underground} type='underground' />
            <TransitToggleButton handleToggle={this.handleToggle} toggled={this.state.toggles.ferry} type='ferry' />
          </div>
          <LoginButton className='login-button-sidebar' show={this.props.showLogin} handleLoginModal={this.props.handleModalLoginButton}/>
        </div>
      </div>
    )
  }
}


export default Sidebar
