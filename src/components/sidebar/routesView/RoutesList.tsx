import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { RouteStore } from '~/stores/routeStore';
import { SearchStore } from '~/stores/searchStore';
import { NetworkStore } from '~/stores/networkStore';
import { IRoute } from '~/models';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import navigator from '~/routing/navigator';
import TransitType from '~/enums/transitType';
import ButtonType from '~/enums/buttonType';
import Button from '~/components/controls/Button';
import RouteService from '~/services/routeService';
import { Checkbox, TransitToggleButtonBar } from '../../controls';
import RouteShow from './RouteShow';
import Loader from '../../shared/loader/Loader';
import * as s from './routesList.scss';

interface IRoutesListState {
    isLoading: boolean;
}

interface IRoutesListProps {
    searchStore?: SearchStore;
    routeStore?: RouteStore;
    networkStore?: NetworkStore;
}

@inject('searchStore', 'routeStore', 'networkStore')
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
        this.props.searchStore!.setSearchInput('');
    }

    private async queryRoutes() {
        const routeIds = navigator.getQueryParam(QueryParams.routes) as string[];
        if (routeIds) {
            this.setState({ isLoading: true });
            const currentRouteIds = this.props.routeStore!.routes.map(r => r.routeId);
            const missingRouteIds = routeIds.filter(id => !currentRouteIds.includes(id));
            currentRouteIds
                .filter(id => !routeIds.includes(id))
                .forEach(id => this.props.routeStore!.removeFromRoutes(id));

            const routes = await RouteService.fetchMultipleRoutes(missingRouteIds);
            if (routes) {
                this.props.routeStore!.addToRoutes(routes);
            }
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

    public renderRouteList() {
        const routes = this.props.routeStore!.routes;

        if (routes.length < 1) return null;

        return routes.map((route: IRoute) => {
            return (
                <div key={route.routeId}>
                    <RouteShow
                        key={route.routeId}
                        route={route}
                    />
                    <Button
                        onClick={this.redirectToNewRoutePathView(route)}
                        className={s.createRoutePathButton}
                        type={ButtonType.SQUARE}
                        text={`Luo uusi reitin suunta reitille ${route.routeId}`}
                    />
                </div>
            );
        });
    }

    private redirectToNewRoutePathView = (route: IRoute) => () => {
        const newRoutePathLink = routeBuilder
        .to(subSites.newRoutePath, { routeId: route.routeId, lineId: route.lineId })
        .toLink();

        // const newRoutePath = RoutePathFactory.createNewRoutePath('1', '1');
        // this.props.routePathStore!.setRoutePath(newRoutePath);

        navigator.goTo(newRoutePathLink);
    }

    public render(): any {
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
                        this.renderRouteList()
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
