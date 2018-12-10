import * as React from 'react';
import moment from 'moment';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import { match } from 'react-router';
import { IRoutePath } from '~/models';
import Loader from '~/components/shared/loader/Loader';
import RoutePathService from '~/services/routePathService';
import { RoutePathStore } from '~/stores/routePathStore';
import RoutePathViewTab from './RoutePathViewTab';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    routePath: IRoutePath | null;
    isLoading: boolean;
    selectedTabIndex: number;
}

interface IRoutePathViewProps {
    routePathStore?: RoutePathStore;
    match?: match<any>;
}

const tabs = [
    'Reitinsuunta',
    'Solmut ja linjat',
];

@inject('routePathStore')
@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
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

    public onTabClick = (selectedTabIndex: number) => () => {
        this.setState({
            selectedTabIndex,
        });
    }

    public generateTabs = () => {
        return tabs.map((tab: string, index) => {
            return(
                <div
                    key={index}
                    className={(this.state.selectedTabIndex === index) ?
                    classnames(s.tabButton, s.selected) :
                    s.tabButton}
                    onClick={this.onTabClick(index)}
                >
                    <div className={s.tabLabel}>
                        {tab}
                    </div>
                </div>
            );
        });
    }

    public render(): any {
        if (!this.state.routePath) {
            return (
                <div className={s.routePathView}>
                    <Loader size={Loader.MEDIUM}/>
                </div>
            );
        }
        return (
            <div className={s.routePathView}>
                <div className={s.flexInnerRow}>
                    {this.generateTabs()}
                </div>

                {(this.state.selectedTabIndex === 0) ?
                    <RoutePathViewTab
                        routePath={this.state.routePath}
                    /> :
                    <div>
                        Solmut ja linjat
                    </div>
                }

            </div>
        );
    }
}

export default RoutePathView;
