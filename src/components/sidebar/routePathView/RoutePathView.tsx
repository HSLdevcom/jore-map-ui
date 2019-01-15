import * as React from 'react';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import { match } from 'react-router';
import Loader from '~/components/shared/loader/Loader';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathService from '~/services/routePathService';
import { RouteStore } from '~/stores/routeStore';
import RoutePathTab from './routePathInfoTab/RoutePathInfoTab';
import RoutePathLinksTab from './routePathListTab/RoutePathLinksTab';
import RoutePathTabs from './RoutePathTabs';
import * as s from './routePathView.scss';
import RoutePathHeader from './RoutePathHeader';

interface IRoutePathViewState {
    isLoading: boolean;
    selectedTabIndex: number;
}

interface IRoutePathViewProps {
    routePathStore?: RoutePathStore;
    routeStore?: RouteStore;
    match?: match<any>;
}

@inject('routePathStore', 'routeStore')
@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            selectedTabIndex: 0,
        };
    }

    public componentDidMount() {
        this.fetchRoutePath();
        this.props.routeStore!.clearRoutes();
    }

    private async fetchRoutePath() {
        this.setState({
            isLoading: true,
        });
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        const startTime = moment(startTimeString);
        const routePath =
            await RoutePathService.fetchRoutePath(routeId, startTime, direction);
        this.props.routePathStore!.setRoutePath(routePath);
        this.setState({
            isLoading: false,
        });
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

    public render(): any {
        if (this.state.isLoading) {
            return (
                <div className={s.routePathView}>
                    <Loader size={Loader.MEDIUM}/>
                </div>
            );
        }
        if (!this.props.routePathStore!.routePath) return;
        return (
            <div className={s.routePathView}>
                <RoutePathHeader
                    routePath={this.props.routePathStore!.routePath!}
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
