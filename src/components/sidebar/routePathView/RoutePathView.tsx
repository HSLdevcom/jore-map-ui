import * as React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { match } from 'react-router';
import { IRoutePath } from '~/models';
import Loader from '~/components/shared/loader/Loader';
import RoutePathService from '~/services/routePathService';
import RoutePathViewTab from './RoutePathViewTab';
import LinkNodeListViewTab from './LinkNodeListViewTab';
import RoutePathViewTabButtons from './RoutePathViewTabButtons';
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
                <RoutePathViewTab
                    routePath={this.state.routePath!}
                />
            );
        }
        case 1: {
            return (
                <LinkNodeListViewTab
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
        const routePathViewTabs = [
            'Reitinsuunta',
            'Solmut ja linkit',
        ];

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
                    <RoutePathViewTabButtons
                        tabs={routePathViewTabs}
                        selectedTab={routePathViewTabs[this.state.selectedTabIndex]}
                        selectTab={this.selectTab}
                    />
                </div>
                {this.renderTabContent()}
            </div>
        );
    }
}

export default RoutePathView;
