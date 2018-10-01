import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '../../../stores/routeStore';
import searchStore from '../../../stores/searchStore';
import { Checkbox, TransitToggleButtonBar } from '../../controls';
import { IRoute } from '../../../models';
import RouteShow from './RouteShow';
import Loader from '../../shared/loader/Loader';
import QueryParams from '../../../routing/queryParams';
import navigator from '../../../routing/navigator';
import RouteAndStopHelper from '../../../storeAbstractions/routeAndStopAbstraction';
import * as s from './routesList.scss';
import TransitType from '../../../enums/transitType';
import { NetworkStore } from '../../../stores/networkStore';

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

    public toggleSelectedTransitTypes = (type: TransitType) => {
        this.props.networkStore!.toggleTransitType(type);
    }

    public toggleShowLinks = () => {
        this.props.networkStore!.toggleShowLinks();
    }

    public toggleShowNodes = () => {
        this.props.networkStore!.toggleShowNodes();
    }

    public toggleShowPoints = () => {
        this.props.networkStore!.toggleShowPoints();
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
                    <label className={s.inputTitle}>VERKKO</label>
                    <TransitToggleButtonBar
                        toggleSelectedTypes={this.toggleSelectedTransitTypes}
                        selectedTypes={this.props.networkStore!.selectedTypes}
                    />
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleShowLinks}
                            checked={this.props.networkStore!.isLinksVisible}
                            text={'Näytä alueen linkit'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleShowPoints}
                            checked={this.props.networkStore!.isPointsVisible}
                            text={'Näytä linkkien pisteet'}
                        />
                    </div>
                    <div className={s.checkboxContainer}>
                        <Checkbox
                            onClick={this.toggleShowNodes}
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
