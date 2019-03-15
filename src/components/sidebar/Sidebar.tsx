import { inject, observer } from 'mobx-react';
import React from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { Location } from 'history';
import classnames from 'classnames';
import { RouteStore } from '~/stores/routeStore';
import { SearchStore } from '~/stores/searchStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LinkView from './linkView/LinkView';
import RoutesView from './routesView/RoutesView';
import RouteLinkView from './routeLinkView/RouteLinkView';
import HomeView from './homeView/HomeView';
import RoutePathView from './routePathView/RoutePathView';
import NodeView from './nodeView/NodeView';
import * as s from './sidebar.scss';

// Requiring location to force update on location change
// This is due to blocked updates issue
// tslint:disable-next-line
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
interface ISidebarProps {
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
    private renderAddNewRoutePath = (props: any) =>
        <RoutePathView {...props} isNewRoutePath={true} />
    private renderRoutePathView = (props: any) =>
        <RoutePathView {...props} isNewRoutePath={false} />

    render() {
        return (
            <div
                className={classnames(
                    s.sidebarView,
                )}
            >
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
                            exact={true}
                            path={subSites.routelink}
                            component={RouteLinkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.link}
                            component={LinkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.node}
                            component={NodeView}
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
                    </Switch>
                </div>
            </div>
        );
    }
}

export default Sidebar;
