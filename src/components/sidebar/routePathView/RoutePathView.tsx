import * as React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { match } from 'react-router';
import { IRoutePath } from '~/models';
import Loader from '~/components/shared/loader/Loader';
import RoutePathService from '~/services/routePathService';
import RoutePathViewTabType from '~/enums/routePathViewTabType';
import RoutePathViewTab from './RoutePathViewTab';
import LinkNodeListViewTab from './LinkNodeListViewTab';
import RoutePathViewTabButtons from './RoutePathViewTabButtons';
import * as s from './routePathView.scss';

interface IRoutePathViewState {
    routePath: IRoutePath | null;
    isLoading: boolean;
    selectedTab: string;
}

interface IRoutePathViewProps {
    match?: match<any>;
}

interface IRoutePathViewTabObject {
    type: RoutePathViewTabType;
    component: JSX.Element;
}

@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: IRoutePathViewProps) {
        super(props);
        this.state = {
            routePath: null,
            isLoading: true,
            selectedTab: RoutePathViewTabType.ROUTE,
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

    public selectTab = (selectedTab: string) => () => {
        this.setState({
            selectedTab,
        });
    }

    public getContentComponent = (tabs: IRoutePathViewTabObject[]) => {
        let content = null;
        tabs.forEach((tab: IRoutePathViewTabObject) => {
            if (this.state.selectedTab === tab.type) {
                content = tab.component;
            }
        });
        return content;
    }

    public render(): any {
        const tabs: IRoutePathViewTabObject[] = [
            {
                type: RoutePathViewTabType.ROUTE,
                component: (
                    <RoutePathViewTab
                        routePath={this.state.routePath!}
                    />
                ),
            },
            {
                type: RoutePathViewTabType.NODES_AND_LINES,
                component: (
                    <LinkNodeListViewTab
                        routePath={this.state.routePath!}
                    />
                ),
            },
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
                        tabs={tabs.map((tab) => {
                            return tab.type;
                        })}
                        selectedTab={this.state.selectedTab}
                        onClick={this.selectTab}
                    />
                </div>
                {this.getContentComponent(tabs)}
            </div>
        );
    }
}

export default RoutePathView;
