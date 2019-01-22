import * as React from 'react';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import Loader from '~/components/shared/loader/Loader';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathService from '~/services/routePathService';
import navigator from '~/routing/navigator';
import { RouteStore } from '~/stores/routeStore';
import RouteService from '~/services/routeService';
import { NetworkStore, NodeSize, MapLayer } from '~/stores/networkStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import LineService from '~/services/lineService';
import ToolbarTool from '~/enums/toolbarTool';
import RoutePathFactory from '~/factories/routePathFactory';
import RoutePathTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import RoutePathTabs from './RoutePathTabs';
import RoutePathHeader from './RoutePathHeader';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    isLoading: boolean;
    selectedTabIndex: number;
}

interface IRoutePathViewProps {
    routePathStore?: RoutePathStore;
    routeStore?: RouteStore;
    networkStore?: NetworkStore;
    toolbarStore?: ToolbarStore;
    match?: match<any>;
    isAddingNew: boolean;
}

@inject('routeStore', 'routePathStore', 'networkStore', 'toolbarStore')
@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            selectedTabIndex: 0,
        };
    }

    private async initializeAsAddingNew() {
        if (!this.props.routePathStore!.routePath) {
            this.props.routePathStore!.setRoutePath(await this.createNewRoutePath());
        } else {
            this.props.routePathStore!.setRoutePath(
                RoutePathFactory.createNewRoutePathFromOld(this.props.routePathStore!.routePath!));
        }
        this.props.toolbarStore!.selectTool(ToolbarTool.AddNewRoutePathLink);
        this.props.routePathStore!.setIsCreating(true);
    }

    private initializeMap() {
        if (this.props.isAddingNew) {
            this.props.networkStore!.setNodeSize(NodeSize.large);
            this.props.networkStore!.showMapLayer(MapLayer.node);
            this.props.networkStore!.showMapLayer(MapLayer.link);
        }

        this.setTransitType();
    }

    private async createNewRoutePath() {
        const queryParams = navigator.getQueryParamValues();
        const route = await RouteService.fetchRoute(queryParams.routeId);
        // TODO: add transitType to this call (if transitType is routePath's property)
        if (route) {
            return RoutePathFactory.createNewRoutePath(queryParams.lineId, route);
        }
        return null;
    }

    private async setTransitType() {
        const routePath = this.props.routePathStore!.routePath;
        if (routePath && routePath.lineId) {
            const line = await LineService.fetchLine(routePath.lineId);
            if (line) {
                this.props.networkStore!.setSelectedTransitTypes([line.transitType]);
            }
        }
    }

    private async fetchRoutePath() {
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        const startTime = moment(startTimeString);
        const routePath =
            await RoutePathService.fetchRoutePath(routeId, startTime, direction);
        this.props.routePathStore!.setRoutePath(routePath);
    }

    public selectTab = (selectedTabIndex: number) => () => {
        this.setState({
            selectedTabIndex,
        });
    }

    public renderTabContent = () => {
        switch (this.state.selectedTabIndex) {
        case 0: {
            return (
                <RoutePathTab
                    routePath={this.props.routePathStore!.routePath!}
                    isAddingNew={this.props.isAddingNew}
                />
            );
        }
        case 1: {
            return (
                <RoutePathLinksTab
                    routePath={this.props.routePathStore!.routePath!}
                />
            );
        }
        default: {
            return null;
        }
        }
    }

    async componentDidMount() {
        if (this.props.isAddingNew) {
            this.initializeAsAddingNew();
        } else {
            await this.fetchRoutePath();
        }
        this.initializeMap();
        this.props.routeStore!.clearRoutes();
        this.setState({
            isLoading: false,
        });
    }

    componentWillUnmount() {
        this.props.toolbarStore!.selectTool(null);
        this.props.networkStore!.setNodeSize(NodeSize.normal);
        this.props.routePathStore!.setIsCreating(false);
        this.props.routePathStore!.setRoutePath(null);
    }

    public render(): any {
        if (this.state.isLoading) {
            return (
                <div className={s.routePathView}>
                    <Loader size={Loader.MEDIUM}/>
                </div>
            );
        }
        if (!this.props.routePathStore!.routePath) return null;
        return (
            <div className={s.routePathView}>
                <RoutePathHeader
                    routePath={this.props.routePathStore!.routePath!}
                    isAddingNew={this.props.isAddingNew}
                />
                <div>
                    <RoutePathTabs
                        selectedTab={this.state.selectedTabIndex}
                        selectTab={this.selectTab}
                    />
                </div>
                {this.renderTabContent()}
            </div>
        );
    }
}

export default RoutePathView;
