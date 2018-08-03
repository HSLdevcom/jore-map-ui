import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import LineEditView from './LineEditView';
import LineSearch from './LineSearch';
import {
  container,
  header,
  headerContainer,
  title,
  content,
  logo,
} from './sidebar.scss';

interface ISidebarProps {
    routeStore?: RouteStore;
}

interface ILinelistState {
    searchInput: string;
}

@inject('routeStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    constructor(props: ISidebarProps) {
        super(props);
    }

    public handleHeaderClick = () => {
        this.props.routeStore!.clearRoutes();
    }

    public render(): any {
        return (
          <div className={container}>
            <div className={header}>
              <div onClick={this.handleHeaderClick} className={headerContainer}>
                <img className={logo} src='hsl-logo.png' />
                <h2 className={title}>
                  Joukkoliikennerekisteri
                </h2>
              </div>
            </div>
            <div className={content}>
              { this.props.routeStore!.routes.length < 1 &&
                <LineSearch />
              }
              {this.props.routeStore!.routes.length > 0 &&
                <LineEditView />
              }
            </div>
          </div>
        );
    }
}

export default Sidebar;
