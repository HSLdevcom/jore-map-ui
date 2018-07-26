import {inject, observer} from 'mobx-react'
import * as React from 'react'
import {SidebarStore} from '../../stores/sidebarStore'
import TransitToggleButton from './TransitToggleButton'

interface ITransitToggleButtonBarState {
  toggles: any
}

interface ITtransitToggleButtonBarProps {
  sidebarStore?: SidebarStore
  filters: string[]
}

@inject('sidebarStore')
@observer
class TransitToggleButtonBar extends React.Component<ITtransitToggleButtonBarProps, ITransitToggleButtonBarState> {
    constructor(props: any) {
      super(props)
      this.state = {
        toggles: {
          bus: true,
          ferry: true,
          subway: true,
          train: true,
          tram: true,
        }
      }
    }

    // Set previous filters if they exist
    public componentWillMount() {
      const filters = this.props.filters
      if (!filters) {return}
      const toggles = this.state.toggles
      filters.forEach((filter: string) => {
        toggles[filter] = false
      })
      this.setState({
        toggles
      })
    }

    public handleToggle = (type: string) => {
      const value: boolean = !this.state.toggles[type]
      const toggleState: object = this.state.toggles
      toggleState[type] = value
      this.setState({
        toggles: toggleState
      })

      // Set filters for RouteSearch.tsx
      const filters: string[] = []
      for (const key in this.state.toggles) {
        if (!this.state.toggles[key]) {
          filters.push(key)
        }
      }
      this.props.sidebarStore!.setFilters(filters)
    }


    public render(): any {
        return (
          <div className='transit-toggle-container'>
            <TransitToggleButton toggleActivity={this.handleToggle} toggled={this.state.toggles.bus} type='bus' />
            <TransitToggleButton toggleActivity={this.handleToggle} toggled={this.state.toggles.tram} type='tram' />
            <TransitToggleButton toggleActivity={this.handleToggle} toggled={this.state.toggles.train} type='train' />
            <TransitToggleButton toggleActivity={this.handleToggle} toggled={this.state.toggles.subway} type='subway' />
            <TransitToggleButton toggleActivity={this.handleToggle} toggled={this.state.toggles.ferry} type='ferry' />
          </div>
        )
    }
}

export default TransitToggleButtonBar
