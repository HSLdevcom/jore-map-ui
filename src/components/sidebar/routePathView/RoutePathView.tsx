import * as React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { match } from 'react-router';
import { IRoutePath } from '~/models';
import Loader from '~/components/shared/loader/Loader';
import RoutePathService from '~/services/routePathService';
import RoutePathTab from './RoutePathTab';
import RoutePathLinksTab from './RoutePathLinksTab';
import RoutePathTabButtons from './RoutePathTabButtons';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    routePath: IRoutePath | null;
    isLoading: boolean;
    selectedTabIndex: number;
}

interface IRoutePathViewProps {
    match?: match<any>;
}

@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            routePath: null,
            isLoading: true,
            selectedTabIndex: 0,
        };
    }

    public componentDidMount() {
        this.fetchRoutePath();
    }

    private async fetchRoutePath() {
        const [routeId, startTimeString, direction] = this.props.match!.params.id.split(',');
        const startTime = moment(startTimeString);
        const routePath =
            await RoutePathService.fetchRoutePath(routeId, startTime, direction);
        this.setState({
            routePath,
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
                    routePath={this.state.routePath!}
                />
            );
        }
        case 1: {
            return (
                <RoutePathLinksTab
                    routePath={this.state.routePath!}
                />
            );
        }
        default: {
            return;
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
        if (!this.state.routePath) return;
        return (
            <div className={s.routePathView}>
                <div className={s.flexInnerRow}>
                    <RoutePathTabButtons
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
