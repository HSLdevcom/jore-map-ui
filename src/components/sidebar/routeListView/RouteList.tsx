import classnames from 'classnames';
import L from 'leaflet';
import { autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import TransitIcon from '~/components/shared/TransitIcon';
import ButtonType from '~/enums/buttonType';
import { IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { RouteListStore } from '~/stores/routeListStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { RouteStore } from '~/stores/routeStore';
import { SearchStore } from '~/stores/searchStore';
import TransitTypeHelper from '~/util/TransitTypeHelper';
import Loader from '../../shared/loader/Loader';
import SidebarHeader from '../SidebarHeader';
import RouteItem from './RouteItem';
import * as s from './routeList.scss';

interface IRouteListProps {
    routeStore?: RouteStore;
    errorStore?: ErrorStore;
    confirmStore?: ConfirmStore;
    searchStore?: SearchStore;
    routeListStore?: RouteListStore;
    networkStore?: NetworkStore;
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
    alertStore?: AlertStore;
}

interface IRouteListState {
    isLoading: boolean;
}

@inject(
    'routeStore',
    'searchStore',
    'routeListStore',
    'networkStore',
    'routePathStore',
    'errorStore',
    'confirmStore',
    'mapStore',
    'alertStore'
)
@observer
class RouteList extends React.Component<IRouteListProps, IRouteListState> {
    constructor(props: IRouteListProps) {
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

    componentWillUnmount() {
        this.props.routeStore!.clear();
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

    private redirectToNewRoutePathView = (route: IRoute) => () => {
        const newRoutePathLink = routeBuilder
            .to(SubSites.newRoutePath)
            .set(QueryParams.routeId, route.id)
            .set(QueryParams.lineId, route.lineId)
            .toLink();

        navigator.goTo(newRoutePathLink);
    };

    private closeRoutePrompt = (route: IRoute) => {
        if (this.props.routeStore!.routeIdToEdit === route.id) {
            this.props.confirmStore!.openConfirm({
                content: `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat sulkea reitin? Tallentamattomat muutokset kumotaan.`,
                onConfirm: () => {
                    this.props.routeStore!.resetChanges();
                    this.closeRoute(route);
                },
                confirmButtonText: 'Kyllä'
            });
        } else {
            this.closeRoute(route);
        }
    };

    private closeRoute = (route: IRoute) => {
        this.props.routeListStore!.removeFromRoutes(route.id);
        const closeRouteLink = routeBuilder
            .to(SubSites.current, navigator.getQueryParamValues())
            .remove(QueryParams.routes, route.id)
            .toLink();
        navigator.goTo(closeRouteLink);
    };

    private editRoutePrompt = (route: IRoute) => {
        const routeStore = this.props.routeStore!;
        const confirmStore = this.props.confirmStore!;
        if (!routeStore.isDirty) {
            routeStore.setRouteToEdit(route);
            return;
        }
        const promptMessage =
            route.id === routeStore.routeIdToEdit
                ? `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan.`
                : `Sinulla on reitin ${
                      routeStore.route.routeName
                  } muokkaus kesken. Oletko varma, että haluat muokata toista reittiä? Tallentamattomat muutokset kumotaan.`;
        confirmStore.openConfirm({
            content: promptMessage,
            onConfirm: () => routeStore.setRouteToEdit(route),
            confirmButtonText: 'Kyllä'
        });
    };

    private showSavePrompt = () => {
        const confirmStore = this.props.confirmStore;
        const currentRoute = this.props.routeStore!.route;
        const oldRoute = this.props.routeStore!.oldRoute;
        const saveModel: ISaveModel = {
            newData: currentRoute,
            oldData: oldRoute,
            model: 'route'
        };
        confirmStore!.openConfirm({
            content: <SavePrompt saveModels={[saveModel]} />,
            onConfirm: () => {
                this.save();
            }
        });
    };

    private save = async () => {
        const routeStore = this.props.routeStore!;
        const routeListStore = this.props.routeListStore!;
        this.setState({ isLoading: true });

        const route = routeStore.route;
        try {
            await RouteService.updateRoute(route!);
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
            return;
        }
        routeListStore.updateRoute(route);
        routeStore.setOldRoute(route);
        routeStore.setRouteToEdit(null);
        this.setState({ isLoading: false });
    };

    render() {
        const routeStore = this.props.routeStore!;
        const routeListStore = this.props.routeListStore!;
        if (this.state.isLoading) {
            return <Loader />;
        }
        const routes = routeListStore.routes;
        if (routes.length < 1) return null;

        const routeIdToEdit = routeStore.routeIdToEdit;
        return (
            <div className={s.routeListView}>
                <div className={s.routeList}>
                    {routes.map((route: IRoute, index: number) => {
                        const isEditing = routeIdToEdit === route.id;
                        const isSaveButtonDisabled =
                            !routeStore.route ||
                            !(isEditing && routeStore.isDirty) ||
                            !routeStore.isRouteFormValid;
                        return (
                            <div key={index} className={s.routeListItem}>
                                <SidebarHeader
                                    isEditing={isEditing}
                                    isBackButtonVisible={true}
                                    isEditButtonVisible={true}
                                    onCloseButtonClick={() => this.closeRoutePrompt(route)}
                                    onEditButtonClick={() => this.editRoutePrompt(route)}
                                >
                                    <div className={s.routeName}>
                                        <TransitIcon
                                            transitType={route!.line!.transitType!}
                                            isWithoutBox={false}
                                        />
                                        <div
                                            className={classnames(
                                                s.label,
                                                TransitTypeHelper.getColorClass(
                                                    route.line!.transitType!
                                                )
                                            )}
                                        >
                                            <div className={s.routeId}>{route.id}</div>
                                        </div>
                                        {route.routeName}
                                    </div>
                                </SidebarHeader>
                                <div className={s.routeItemWrapper}>
                                    <RouteItem route={route} isEditingDisabled={!isEditing} />
                                </div>
                                <div className={s.buttonContainer}>
                                    <Button
                                        onClick={this.redirectToNewRoutePathView(route)}
                                        type={ButtonType.SQUARE}
                                        disabled={Boolean(routeStore.routeIdToEdit)}
                                    >
                                        {`Luo uusi reitin suunta reitille ${route.id}`}
                                    </Button>
                                    {isEditing && (
                                        <Button
                                            onClick={() => this.showSavePrompt()}
                                            type={ButtonType.SAVE}
                                            disabled={isSaveButtonDisabled}
                                        >
                                            Tallenna muutokset
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default RouteList;
