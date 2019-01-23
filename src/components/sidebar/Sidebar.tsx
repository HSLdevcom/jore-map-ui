import { inject, observer } from 'mobx-react';
import React from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { Location } from 'history';
import classnames from 'classnames';
import { RouteStore } from '~/stores/routeStore';
import { SearchStore } from '~/stores/searchStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import routeBuilder  from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import hslLogo from '~/assets/hsl-logo.png';
import LinkView from './linkView/LinkView';
import NodeView from './nodeView/NodeView';
import RoutesView from './routesView/RoutesView';
import HomeView from './homeView/HomeView';
import RoutePathView from './routePathView/RoutePathView';
import NetworkView from './networkView/NetworkView';
import EditNetworkView from './editNetworkView/EditNetworkView';
import * as s from './sidebar.scss';

// Requiring location to force update on location change
// This is due to blocked updates issue
// tslint:disable-next-line
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
interface ISidebarProps{
    routeStore?: RouteStore;
    searchStore?: SearchStore;
    toolbarStore?: ToolbarStore;
    location: Location;
}

interface ILinelistState {
    searchInput: string;
}

@inject('routeStore', 'searchStore', 'toolbarStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {

    private renderRoutesView = () => {
        const queryParams = navigator.getQueryParam(QueryParams.routes);
        return queryParams ? <RoutesView /> : <Redirect to='/' />;
    }

    private renderAddNewRoutePath = (props: any) => <RoutePathView {...props} isAddingNew={true} />;
    private renderRoutePathView = (props: any) => <RoutePathView {...props} isAddingNew={false} />;

    render() {
        const goToHomeView = () => {
            this.props.toolbarStore!.selectTool(null);
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
                        <img className={s.logo} src={hslLogo} alt='HSL Logo'/>
                        <h2 className={s.title}>
                            Joukkoliikennerekisteri
                        </h2>
                    </div>
                </div>
                <div className={s.content}>
                    <Switch>
                        <Route
                            exact={true}
                            path={subSites.home}
                            component={HomeView}
                        />
                        <Route
                            exact={true}
                            path={subSites.routes}
                            component={this.renderRoutesView}
                        />
                        <Route
                            path={subSites.node}
                            component={NodeView}
                        />
                        <Route
                            exact={true}
                            path={subSites.link}
                            component={LinkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newRoutePath}
                            render={this.renderAddNewRoutePath}
                        />
                        <Route
                            exact={true}
                            path={subSites.routePath}
                            render={this.renderRoutePathView}
                        />
                        <Route
                            exact={true}
                            path={subSites.network}
                            component={NetworkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.editNetwork}
                            component={EditNetworkView}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default Sidebar;
