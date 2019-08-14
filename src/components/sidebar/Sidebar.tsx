import { inject, observer } from 'mobx-react';
import React from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { Location } from 'history';
import classnames from 'classnames';
import { RouteListStore } from '~/stores/routeListStore';
import { SearchStore } from '~/stores/searchStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LinkView from './linkView/LinkView';
import RouteListView from './routeListView/RouteListView';
import HomeView from './homeView/HomeView';
import LineView from './lineView/LineView';
import LineTopicView from './lineView/lineTopicView/LineTopicView';
import RouteView from './routeView/RouteView';
import RoutePathView from './routePathView/RoutePathView';
import NodeView from './nodeView/NodeView';
import SplitLinkView from './splitLinkView/SplitLinkView';
import * as s from './sidebar.scss';

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
    private renderNewLineView = (props: any) => (
        <LineView {...props} isNewLine={true} />
    );
    private renderLineView = (props: any) => (
        <LineView {...props} isNewLine={false} />
    );
    private renderNewLineTopicView = (props: any) => (
        <LineTopicView {...props} isNewLineTopic={true} />
    );
    private renderLineTopicView = (props: any) => (
        <LineTopicView {...props} isNewLineTopic={false} />
    );
    private renderNewRouteView = (props: any) => (
        <RouteView {...props} isNewRoute={true} />
    );
    private renderRouteView = (props: any) => (
        <RouteView {...props} isNewRoute={false} />
    );
    private renderNewNodeView = (props: any) => (
        <NodeView {...props} isNewNode={true} />
    );
    private renderNodeView = (props: any) => (
        <NodeView {...props} isNewNode={false} />
    );
    private renderNewLinkView = (props: any) => (
        <LinkView {...props} isNewLink={true} />
    );
    private renderLinkView = (props: any) => (
        <LinkView {...props} isNewLink={false} />
    );
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
                        <Route
                            exact={true}
                            path={subSites.home}
                            component={HomeView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newLine}
                            component={this.renderNewLineView}
                        />
                        <Route
                            exact={true}
                            path={subSites.line}
                            component={this.renderLineView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newLineTopic}
                            component={this.renderNewLineTopicView}
                        />
                        <Route
                            exact={true}
                            path={subSites.lineTopic}
                            component={this.renderLineTopicView}
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
                            path={subSites.routes}
                            component={this.renderRouteListView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newLink}
                            component={this.renderNewLinkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.link}
                            component={this.renderLinkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.splitLink}
                            component={SplitLinkView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newNode}
                            component={this.renderNewNodeView}
                        />
                        <Route
                            exact={true}
                            path={subSites.node}
                            component={this.renderNodeView}
                        />
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
