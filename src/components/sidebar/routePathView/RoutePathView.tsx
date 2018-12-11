import * as React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { match } from 'react-router';
import { IRoutePath } from '~/models';
import Loader from '~/components/shared/loader/Loader';
import RoutePathService from '~/services/routePathService';
import RoutePathViewTab from './RoutePathViewTab';
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

@observer
class RoutePathView extends React.Component<IRoutePathViewProps, IRoutePathViewState>{
    constructor(props: any) {
        super(props);
        this.state = {
            routePath: null,
            isLoading: true,
            selectedTab: 'Reitinsuunta',
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
                    <RoutePathViewTabButtons
                        tabs={['Reitinsuunta', 'Solmut ja linjat']}
                        selectedTab={this.state.selectedTab}
                        onClick={this.selectTab}
                    />
                </div>

                {(this.state.selectedTab === 'Reitinsuunta') ?
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
