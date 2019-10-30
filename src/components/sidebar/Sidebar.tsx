import classnames from 'classnames';
import { Location } from 'history';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import subSites from '~/routing/subSites';
import { RouteListStore } from '~/stores/routeListStore';
import { SearchStore } from '~/stores/searchStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import HomeView from './homeView/HomeView';
import LineView from './lineView/LineView';
import LineHeaderView from './lineView/lineHeaderView/LineHeaderView';
import LinkView from './linkView/LinkView';
import NodeView from './nodeView/NodeView';
import StopAreaView from './nodeView/StopAreaView';
import RouteListView from './routeListView/RouteListView';
import RoutePathView from './routePathView/RoutePathView';
import RouteView from './routeView/RouteView';
import * as s from './sidebar.scss';
import SplitLinkView from './splitLinkView/SplitLinkView';

// Requiring location to force update on location change
// This is due to blocked updates issue
// tslint:disable-next-line
// https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/blocked-updates.md
interface ISidebarProps {
    routeListStore?: RouteListStore;
    searchStore?: SearchStore;
    toolbarStore?: ToolbarStore;
    location: Location;
}

interface ILinelistState {
    searchInput: string;
}

@inject('routeListStore', 'searchStore', 'toolbarStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    private renderRouteListView = () => {
        const queryParams = navigator.getQueryParam(QueryParams.routes);
        return queryParams ? <RouteListView /> : <Redirect to='/' />;
    };
    private renderNewLineView = (props: any) => <LineView {...props} isNewLine={true} />;
    private renderLineView = (props: any) => <LineView {...props} isNewLine={false} />;
    private renderNewLineHeaderView = (props: any) => (
        <LineHeaderView {...props} isNewLineHeader={true} />
    );
    private renderLineHeaderView = (props: any) => (
        <LineHeaderView {...props} isNewLineHeader={false} />
    );
    private renderNewRouteView = (props: any) => <RouteView {...props} isNewRoute={true} />;
    private renderRouteView = (props: any) => <RouteView {...props} isNewRoute={false} />;
    private renderNewNodeView = (props: any) => <NodeView {...props} isNewNode={true} />;
    private renderNodeView = (props: any) => <NodeView {...props} isNewNode={false} />;
    private renderNewStopAreaView = (props: any) => {
        return <StopAreaView {...props} isNewStopArea={true} />;
    };
    private renderStopAreaView = (props: any) => <StopAreaView {...props} isNewStopArea={false} />;
    private renderNewLinkView = (props: any) => <LinkView {...props} isNewLink={true} />;
    private renderLinkView = (props: any) => <LinkView {...props} isNewLink={false} />;
    private renderNewRoutePathView = (props: any) => (
        <RoutePathView {...props} isNewRoutePath={true} />
    );
    private renderRoutePathView = (props: any) => (
        <RoutePathView {...props} isNewRoutePath={false} />
    );

    render() {
        return (
            <div className={classnames(s.sidebarView)}>
                <div className={s.content}>
                    <Switch>
                        <Route exact={true} path={subSites.home} component={HomeView} />
                        <Route
                            exact={true}
                            path={subSites.newLine}
                            component={this.renderNewLineView}
                        />
                        <Route exact={true} path={subSites.line} component={this.renderLineView} />
                        <Route
                            exact={true}
                            path={subSites.newLineHeader}
                            component={this.renderNewLineHeaderView}
                        />
                        <Route
                            exact={true}
                            path={subSites.lineHeader}
                            component={this.renderLineHeaderView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newRoute}
                            component={this.renderNewRouteView}
                        />
                        <Route
                            exact={true}
                            path={subSites.route}
                            component={this.renderRouteView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newNode}
                            component={this.renderNewNodeView}
                        />
                        <Route exact={true} path={subSites.node} component={this.renderNodeView} />
                        <Route
                            exact={true}
                            path={subSites.newStopArea}
                            component={this.renderNewStopAreaView}
                        />
                        <Route
                            exact={true}
                            path={subSites.stopArea}
                            component={this.renderStopAreaView}
                        />
                        <Route
                            exact={true}
                            path={subSites.routes}
                            component={this.renderRouteListView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newLink}
                            component={this.renderNewLinkView}
                        />
                        <Route exact={true} path={subSites.link} component={this.renderLinkView} />
                        <Route exact={true} path={subSites.splitLink} component={SplitLinkView} />
                        <Route
                            exact={true}
                            path={subSites.newRoutePath}
                            render={this.renderNewRoutePathView}
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
