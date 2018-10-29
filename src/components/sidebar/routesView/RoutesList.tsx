import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '~/stores/routeStore';
import searchStore from '~/stores/searchStore';
import { IRoute } from '~/models';
import QueryParams from '~/routing/queryParams';
import navigator from '~/routing/navigator';
import RouteAndStopHelper from '~/storeAbstractions/routeAndStopAbstraction';
import TransitType from '~/enums/transitType';
import { NetworkStore } from '~/stores/networkStore';
import { Checkbox, TransitToggleButtonBar } from '../../controls';
import RouteShow from './RouteShow';
import Loader from '../../shared/loader/Loader';
import * as s from './routesList.scss';

interface IRoutesListState {
    isLoading: boolean;
}

interface IRoutesListProps {
    routeStore?: RouteStore;
    networkStore?: NetworkStore;
}

@inject('routeStore', 'networkStore')
@observer
class RoutesList extends React.Component<IRoutesListProps, IRoutesListState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    async componentDidMount() {
        await this.queryRoutes();
        searchStore!.setSearchInput('');
    }

    private async queryRoutes() {
        const routeIds = navigator.getQueryParam(QueryParams.routes);
        if (routeIds) {
            this.setState({ isLoading: true });
            await RouteAndStopHelper.addRequiredDataForRoutes(routeIds);
            this.setState({ isLoading: false });
        }
    }

    public toggleTransitType = (type: TransitType) => {
        this.props.networkStore!.toggleTransitType(type);
    }

    public toggleIsLinksVisible = () => {
        this.props.networkStore!.toggleIsLinksVisible();
    }

    public toggleIsNodesVisible = () => {
        this.props.networkStore!.toggleIsNodesVisible();
    }

    public toggleIsPointsVisible = () => {
        this.props.networkStore!.toggleIsPointsVisible();
    }

    public render(): any {
        const routeList = (routes: IRoute[]) => {
            let visibleRoutePathsIndex = 0;
            if (routes.length < 1) return null;
            return routes.map((route: IRoute) => {
                const routeShow = (
                    <RouteShow
                        key={route.routeId}
                        route={route}
                        visibleRoutePathsIndex={visibleRoutePathsIndex}
                    />
                );
                visibleRoutePathsIndex += route.routePaths.filter(
                    x => x.visible).length;
                return routeShow;
            });
        };
        if (this.state.isLoading) {
            return(
                <div className={s.routesListView}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.routesListView}>
                <div className={s.routeList}>
                    {
                        routeList(this.props.routeStore!.routes)
                    }
                </div>
                <div className={s.network}>
                    <div className={s.inputTitle}>VERKKO</div>
                    <TransitToggleButtonBar
                        toggleSelectedTransitType={this.toggleTransitType}
                        selectedTransitTypes={this.props.networkStore!.selectedTransitTypes}
                    />
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleIsLinksVisible}
                            checked={this.props.networkStore!.isLinksVisible}
                            text={'Näytä alueen linkit'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleIsPointsVisible}
                            checked={this.props.networkStore!.isPointsVisible}
                            text={'Näytä linkkien pisteet'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleIsNodesVisible}
                            checked={this.props.networkStore!.isNodesVisible}
                            text={'Näytä alueen solmut'}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default RoutesList;
