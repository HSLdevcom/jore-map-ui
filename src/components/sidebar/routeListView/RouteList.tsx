import classnames from 'classnames';
import L from 'leaflet';
import { autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import Button from '~/components/controls/Button';
import ButtonType from '~/enums/buttonType';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import subSites from '~/routing/subSites';
import RouteService from '~/services/routeService';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { SearchStore } from '~/stores/searchStore';
import Loader from '../../shared/loader/Loader';
import RouteItem from './RouteItem';
import * as s from './routeList.scss';

interface IRouteListState {
    isLoading: boolean;
}

interface IRouteListProps {
    errorStore?: ErrorStore;
    searchStore?: SearchStore;
    routeListStore?: RouteListStore;
    networkStore?: NetworkStore;
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
}

@inject('searchStore', 'routeListStore', 'networkStore', 'routePathStore', 'errorStore', 'mapStore')
@observer
class RouteList extends React.Component<IRouteListProps, IRouteListState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    async componentDidMount() {
        await this.fetchRoutes();
        this.props.routePathStore!.clear();
        this.props.searchStore!.setSearchInput('');

        autorun(() => this.centerMapToRoutes());
    }

    private fetchRoutes = async () => {
        const routeIds = navigator.getQueryParam(QueryParams.routes) as string[];
        if (routeIds) {
            this.setState({ isLoading: true });
            const currentRouteIds = this.props.routeListStore!.routes.map(r => r.id);
            const missingRouteIds = routeIds.filter(id => !currentRouteIds.includes(id));
            currentRouteIds
                .filter(id => !routeIds.includes(id))
                .forEach(id => this.props.routeListStore!.removeFromRoutes(id));

            try {
                const routes = await RouteService.fetchMultipleRoutes(missingRouteIds);
                this.props.routeListStore!.addToRoutes(routes);
            } catch (e) {
                this.props.errorStore!.addError(
                    `Reittien (soltunnus ${routeIds.join(', ')}) haku epäonnistui.`,
                    e
                );
            }
            this.setState({ isLoading: false });
        }
    };

    private centerMapToRoutes = () => {
        const routes: IRoute[] = this.props.routeListStore!.routes;
        if (!routes) return;

        const bounds: L.LatLngBounds = new L.LatLngBounds([]);
        routes.forEach(route => {
            route.routePaths.forEach(routePath => {
                routePath.routePathLinks.forEach(routePathLink => {
                    routePathLink.geometry.forEach(pos => {
                        bounds.extend(pos);
                    });
                });
            });
        });
        if (!bounds.isValid()) return;

        this.props.mapStore!.setMapBounds(bounds);
    };

    private renderRouteList = () => {
        const routes = this.props.routeListStore!.routes;

        if (routes.length < 1) return null;

        return routes.map((route: IRoute) => {
            return (
                <div key={route.id}>
                    <RouteItem key={route.id} route={route} />
                    <Button
                        onClick={this.redirectToNewRoutePathView(route)}
                        className={s.createRoutePathButton}
                        type={ButtonType.SQUARE}
                    >
                        {`Luo uusi reitin suunta reitille ${route.id}`}
                    </Button>
                </div>
            );
        });
    };

    private redirectToNewRoutePathView = (route: IRoute) => () => {
        const newRoutePathLink = routeBuilder
            .to(subSites.newRoutePath)
            .set(QueryParams.routeId, route.id)
            .set(QueryParams.lineId, route.lineId)
            .toLink();

        navigator.goTo(newRoutePathLink);
    };

    render() {
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.routeListView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }
        return (
            <div className={s.routeListView}>
                <div className={s.routeList}>{this.renderRouteList()}</div>
            </div>
        );
    }
}

export default RouteList;
