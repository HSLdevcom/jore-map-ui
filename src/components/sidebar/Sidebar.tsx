import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../stores/routeStore';
import RoutesEdit from './RoutesEdit';
import LineSearch from './LineSearch';
import * as s from './sidebar.scss';

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
            <div className={s.sidebarView}>
                <div className={s.header}>
                    <div onClick={this.handleHeaderClick} className={s.headerContainer}>
                        <img className={s.logo} src='hsl-logo.png' />
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                </h2>
                    </div>
                </div>
                <div className={s.content}>
                    {this.props.routeStore!.routes.length < 1 &&
                        <LineSearch />
                    }
                    {this.props.routeStore!.routes.length > 0 &&
                        <RoutesEdit />
                    }
                </div>
            </div>
        );
    }
}

export default Sidebar;
