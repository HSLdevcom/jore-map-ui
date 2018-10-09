import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { Location } from 'history';
import classnames from 'classnames';
import hslLogo from '../../assets/hsl-logo.png';
import { SidebarStore } from '../../stores/sidebarStore';
import { RouteStore } from '../../stores/routeStore';
import { SearchStore } from '../../stores/searchStore';
import LinkView from './linkView/LinkView';
import NodeView from './nodeView/NodeView';
import RoutesView from './routesView/RoutesView';
import HomeView from './homeView/HomeView';
import RoutePathView from './routePathView/RoutePathView';
import routeBuilder  from '../../routing/routeBuilder';
import subSites from '../../routing/subSites';
import navigator from '../../routing/navigator';
import * as s from './sidebar.scss';

// Requiring location to force update on location change
// This is due to blocked updates issue
// tslint:disable-next-line
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
interface ISidebarProps{
    history: any;
    sidebarStore?: SidebarStore;
    routeStore?: RouteStore;
    searchStore?: SearchStore;
    location: Location;
}

interface ILinelistState {
    searchInput: string;
}

@inject('sidebarStore', 'routeStore', 'searchStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {

    private renderRoutesView = () => {
        const search = this.props.history.location.search;
        return search === '' ?  <Redirect to='/' /> : <RoutesView />;
    }

    public render(): any {
        const goToHomeView = () => {
            this.props.routeStore!.clearRoutes();
            this.props.searchStore!.setSearchInput('');
            const homeLink = routeBuilder.to(subSites.home).clear().toLink();
            navigator.goTo(homeLink);
        };

        return (
            <div
                className={classnames(
                    s.sidebarView,
                )}
            >
                <div className={s.header}>
                    <div onClick={goToHomeView} className={s.headerContainer}>
                        <img className={s.logo} src={hslLogo} />
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                </h2>
                    </div>
                </div>
                <Switch>
                    <Route exact={true} path={subSites.home} component={HomeView} />
                    <Route exact={true} path={subSites.routePath} component={RoutePathView} />
                    <Route exact={true} path={subSites.routes} component={this.renderRoutesView} />
                    <Route path={subSites.node} component={NodeView} />
                    <Route exact={true} path={subSites.link} component={LinkView} />
                </Switch>
            </div>
        );
    }
}

export default Sidebar;
