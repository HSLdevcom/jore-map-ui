import {inject, observer} from 'mobx-react'
import * as React from 'react'
import {SidebarStore} from '../../stores/sidebarStore'
import LineEditView from './LineEditView'
import LineSearch from './LineSearch'
import './Sidebar.css'

interface ISidebarProps {
  sidebarStore?: SidebarStore
}

interface ILinelistState {
  searchInput: string
}

@inject('sidebarStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
  constructor(props: ISidebarProps) {
    super(props)
  }

  public handleHeaderClick = () => {
    this.props.sidebarStore!.removeSelectedLines()
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
          {this.props.sidebarStore!.selectedLines.length < 1 &&
            <LineSearch />
          }
          {this.props.sidebarStore!.selectedLines.length > 0 &&
            <LineEditView nodes={this.props.sidebarStore!.selectedLines} />
          }

        </div>
      </div>
    )
  }
}

export default Sidebar
