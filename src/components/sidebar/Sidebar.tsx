import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LineStore } from '../../stores/lineStore';
import LineEditView from './LineEditView';
import LineSearch from './LineSearch';

interface ISidebarProps {
    lineStore?: LineStore;
}

interface ILinelistState {
    searchInput: string;
}

@inject('lineStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    constructor(props: ISidebarProps) {
        super(props);
    }

    public handleHeaderClick = () => {
        this.props.lineStore!.removeSelectedLines();
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
              { this.props.lineStore!.selectedLines.length < 1 &&
                <LineSearch />
              }
              {this.props.lineStore!.selectedLines.length > 0 &&
                <LineEditView lines={this.props.lineStore!.selectedLines} />
              }
            </div>
          </div>
        );
    }
}

export default Sidebar;
