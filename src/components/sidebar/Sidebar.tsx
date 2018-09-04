import { inject, observer } from 'mobx-react';
import * as React from 'react';
import * as s from './sidebar.scss';
import { Route, Switch } from 'react-router';
import hslLogo from '../../assets/hsl-logo.png';
import { RouteStore } from '../../stores/routeStore';
import { LineStore } from '../../stores/lineStore';
import RoutesView from './RoutesView';
import HomeView from './HomeView';
import routeBuilder from '../../routing/routeBuilder';
import routing from '../../routing/routing';
import { Location } from 'history';
import navigator from '../../routing/navigator';

interface ISidebarProps{
    routeStore?: RouteStore;
    lineStore?: LineStore;
    location: Location;
}

interface ILinelistState {
    searchInput: string;
}

@inject('routeStore', 'lineStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    public render(): any {
        const handleHeaderClick = () => {
            this.props.routeStore!.clearRoutes();
            this.props.lineStore!.setSearchInput('');
            navigator.push(
                routeBuilder
                    .to(routing.home)
                    .clear()
                    .toLink(),
            );
        };
        return (
            <div className={s.sidebarView}>
                <div className={s.header}>
                    <div onClick={handleHeaderClick} className={s.headerContainer}>
                        <img className={s.logo} src={hslLogo} />
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                </h2>
                    </div>
                </div>
                <Switch>
                    <Route path={routing.routes.location} component={RoutesView} />
                    <Route path={routing.home.location} component={HomeView} />
                </Switch>
            </div>
        );
    }
}

export default Sidebar;
