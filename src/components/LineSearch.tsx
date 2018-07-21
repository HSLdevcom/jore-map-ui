import {inject, observer} from 'mobx-react'
import * as React from 'react'
import {SidebarStore} from '../stores/sidebarStore'
import LineItems from './LineItems'
import TransitToggleButtonBar from './TransitToggleButtonBar'

interface ILineSearchProps {
  sidebarStore?: SidebarStore
  showLogin: boolean
  handleModalLoginButton(event: any): void
}

interface ILineSearchState {
  searchInput: string
  lineItems: any
}

@inject('sidebarStore')
@observer
class LineSearch extends React.Component<ILineSearchProps, ILineSearchState> {
  constructor(props: ILineSearchProps) {
    super(props)
    this.state = {
      lineItems: '',
      searchInput: '',
    }
  }

  public handleSearchInputChange = (event: any) => {
    this.setState({
      searchInput: event.target.value
    })
  }

  public render(): any {
      return (
        <div className='routes-search'>
          <div className='routes-search-header'>
            <label className='routes-label'>
              Reitit<br/>
            </label>
            <div className='input-container'>
              <input
                placeholder='Hae reitti'
                className='input'
                type='text'
                value={this.state.searchInput}
                onChange={this.handleSearchInputChange}
              />
            </div>
            <TransitToggleButtonBar filters={this.props.sidebarStore!.filters || []} />
          </div>
          <LineItems filters={this.props.sidebarStore!.filters || []} searchInput={this.state.searchInput}  />
        </div>
      )
  }
}

export default LineSearch
