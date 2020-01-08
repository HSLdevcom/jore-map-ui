import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { withRouter, Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import SubSites from '~/routing/subSites';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { SearchStore } from '~/stores/searchStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import PageNotFoundView from './PageNotFoundView';
import HomeView from './homeView/HomeView';
import LineView from './lineView/LineView';
import LinkView from './linkView/LinkView';
import NodeView from './nodeView/NodeView';
import StopAreaView from './nodeView/stopAreaView/StopAreaView';
import RouteListView from './routeListView/RouteListView';
import RoutePathView from './routePathView/RoutePathView';
import RouteView from './routeView/RouteView';
import * as s from './sidebar.scss';
import SplitLinkView from './splitLinkView/SplitLinkView';

interface ISidebarProps extends RouteComponentProps {
    routeListStore?: RouteListStore;
    searchStore?: SearchStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

interface ILinelistState {
    searchInput: string;
}

type view = 'line' | 'route' | 'node' | 'stopArea' | 'link' | 'routePath';

@inject('routeListStore', 'searchStore', 'toolbarStore', 'mapStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    private renderRouteListView = () => {
        const queryParams = navigator.getQueryParam(QueryParams.routes);
        return queryParams ? <RouteListView /> : <Redirect to='/' />;
    };

    private renderView = ({
        editPath,
        newPath,
        view
    }: {
        editPath: SubSites;
        newPath: SubSites;
        view: view;
    }) => {
        return [
            <Route
                key={'route-new'}
                exact={true}
                path={newPath}
                component={this.renderComponent({ view, isNew: true })}
            />,
            <Route
                key={'route-edit'}
                exact={true}
                path={editPath}
                component={this.renderComponent({ view, isNew: false })}
            />
        ];
    };

    private renderComponent = ({ view, isNew }: { view: view; isNew: boolean }) => (props: any) => {
        switch (view) {
            case 'line':
                return <LineView {...props} isNewLine={isNew} />;
            case 'route':
                return <RouteView {...props} isNewRoute={isNew} />;
            case 'node':
                return <NodeView {...props} isNewNode={isNew} />;
            case 'stopArea':
                return <StopAreaView {...props} isNewStopArea={isNew} />;
            case 'link':
                return <LinkView {...props} isNewLink={isNew} />;
            case 'routePath':
                return <RoutePathView {...props} isNewRoutePath={isNew} />;
        }
    };

    render() {
        const isMapFullscreen = this.props.mapStore!.isMapFullscreen;

        return (
            <div className={classnames(s.sidebarView, isMapFullscreen ? s.hidden : null)}>
                <div className={s.content}>
                    <Switch>
                        <Route exact={true} path={SubSites.home} component={HomeView} />
                        <Route
                            exact={true}
                            path={SubSites.routes}
                            component={this.renderRouteListView}
                        />
                        <Route exact={true} path={SubSites.splitLink} component={SplitLinkView} />
                        {this.renderView({
                            editPath: SubSites.line,
                            newPath: SubSites.newLine,
                            view: 'line'
                        })}
                        {this.renderView({
                            editPath: SubSites.route,
                            newPath: SubSites.newRoute,
                            view: 'route'
                        })}
                        {this.renderView({
                            editPath: SubSites.link,
                            newPath: SubSites.newLink,
                            view: 'link'
                        })}
                        {this.renderView({
                            editPath: SubSites.node,
                            newPath: SubSites.newNode,
                            view: 'node'
                        })}
                        {this.renderView({
                            editPath: SubSites.stopArea,
                            newPath: SubSites.newStopArea,
                            view: 'stopArea'
                        })}
                        {this.renderView({
                            editPath: SubSites.routePath,
                            newPath: SubSites.newRoutePath,
                            view: 'routePath'
                        })}
                        <Route path={'*'} component={PageNotFoundView} />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default withRouter(Sidebar);
