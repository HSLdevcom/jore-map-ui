import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { withRouter, Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import subSites from '~/routing/subSites';
import { MapStore } from '~/stores/mapStore';
import { RouteListStore } from '~/stores/routeListStore';
import { SearchStore } from '~/stores/searchStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import HomeView from './homeView/HomeView';
import LineView from './lineView/LineView';
import LineHeaderView from './lineView/lineHeaderView/LineHeaderView';
import LinkView from './linkView/LinkView';
import NodeView from './nodeView/NodeView';
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

type view = 'line' | 'lineHeader' | 'route' | 'node' | 'link' | 'routePath';

@inject('routeListStore', 'searchStore', 'toolbarStore', 'mapStore')
@observer
class Sidebar extends React.Component<ISidebarProps, ILinelistState> {
    componentDidMount() {
        this.props.mapStore!.setInitCoordinates();
    }

    private renderRouteListView = () => {
        const queryParams = navigator.getQueryParam(QueryParams.routes);
        return queryParams ? <RouteListView /> : <Redirect to='/' />;
    };

    private renderView = ({ view, isNew }: { view: view; isNew: boolean }) => (props: any) => {
        switch (view) {
            case 'line':
                return <LineView {...props} isNewLine={isNew} />;
            case 'lineHeader':
                return <LineHeaderView {...props} isNewLineHeader={isNew} />;
            case 'route':
                return <RouteView {...props} isNewRoute={isNew} />;
            case 'node':
                return <NodeView {...props} isNewNode={isNew} />;
            case 'link':
                return <LinkView {...props} isNewLink={isNew} />;
            case 'routePath':
                return <RoutePathView {...props} isNewRoutePath={isNew} />;
        }
    };

    render() {
        return (
            <div className={classnames(s.sidebarView)}>
                <div className={s.content}>
                    <Switch>
                        <Route exact={true} path={subSites.home} component={HomeView} />
                        <Route
                            exact={true}
                            path={subSites.newLine}
                            component={this.renderView({ view: 'line', isNew: true })}
                        />
                        <Route
                            exact={true}
                            path={subSites.line}
                            component={this.renderView({ view: 'line', isNew: false })}
                        />
                        <Route
                            exact={true}
                            path={subSites.newLineHeader}
                            component={this.renderView({ view: 'lineHeader', isNew: true })}
                        />
                        <Route
                            exact={true}
                            path={subSites.lineHeader}
                            component={this.renderView({ view: 'lineHeader', isNew: false })}
                        />
                        <Route
                            exact={true}
                            path={subSites.newRoute}
                            component={this.renderView({ view: 'route', isNew: true })}
                        />
                        <Route
                            exact={true}
                            path={subSites.route}
                            component={this.renderView({ view: 'route', isNew: false })}
                        />
                        <Route
                            exact={true}
                            path={subSites.routes}
                            component={this.renderRouteListView}
                        />
                        <Route
                            exact={true}
                            path={subSites.newLink}
                            component={this.renderView({ view: 'link', isNew: true })}
                        />
                        <Route
                            exact={true}
                            path={subSites.link}
                            component={this.renderView({ view: 'link', isNew: false })}
                        />
                        <Route exact={true} path={subSites.splitLink} component={SplitLinkView} />
                        <Route
                            exact={true}
                            path={subSites.newNode}
                            component={this.renderView({ view: 'node', isNew: true })}
                        />
                        <Route
                            exact={true}
                            path={subSites.node}
                            component={this.renderView({ view: 'node', isNew: false })}
                        />
                        <Route
                            exact={true}
                            path={subSites.newRoutePath}
                            render={this.renderView({ view: 'routePath', isNew: true })}
                        />
                        <Route
                            exact={true}
                            path={subSites.routePath}
                            render={this.renderView({ view: 'routePath', isNew: false })}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default withRouter(Sidebar);
