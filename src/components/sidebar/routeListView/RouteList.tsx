import L from 'leaflet';
import _ from 'lodash';
import { autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { Button } from '~/components/controls';
import TransitTypeLink from '~/components/shared/TransitTypeLink';
import ButtonType from '~/enums/buttonType';
import { ILine, IRoute } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LineService from '~/services/lineService';
import RouteService from '~/services/routeService';
import { AlertStore } from '~/stores/alertStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { LoginStore } from '~/stores/loginStore';
import { MapStore } from '~/stores/mapStore';
import { NetworkStore } from '~/stores/networkStore';
import { IRouteItem, RouteListStore } from '~/stores/routeListStore';
import { RoutePathMassEditStore } from '~/stores/routePathMassEditStore';
import { RoutePathStore } from '~/stores/routePathStore';
import { RouteStore } from '~/stores/routeStore';
import { SearchStore } from '~/stores/searchStore';
import NavigationUtils from '~/utils/NavigationUtils';
import Loader from '../../shared/loader/Loader';
import SidebarHeader from '../SidebarHeader';
import RouteItem from './RouteItem';
import * as s from './routeList.scss';

interface IRouteListProps {
    routeIds: string[];
    routeStore?: RouteStore;
    errorStore?: ErrorStore;
    confirmStore?: ConfirmStore;
    searchStore?: SearchStore;
    routeListStore?: RouteListStore;
    networkStore?: NetworkStore;
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
    alertStore?: AlertStore;
    loginStore?: LoginStore;
    routePathMassEditStore?: RoutePathMassEditStore;
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
    'alertStore',
    'loginStore',
    'routePathMassEditStore'
)
@observer
class RouteList extends React.Component<IRouteListProps, IRouteListState> {
    private _isMounted: boolean;
    constructor(props: IRouteListProps) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    async componentDidUpdate(prevProps: IRouteListProps) {
        if (!_.isEqual(this.props.routeIds, prevProps.routeIds)) {
            await this.fetchRoutes();
        }
    }

    async componentDidMount() {
        this._isMounted = true;
        await this.fetchRoutes();

        this.props.routePathStore!.clear();
        this.props.searchStore!.setSearchInput('');

        autorun(() => this.centerMapToRoutes());
    }

    componentWillUnmount() {
        this.props.routeStore!.clear();
        this._isMounted = false;
    }

    private fetchRoutes = async () => {
        const routeIds = _.values(navigator.getQueryParam(QueryParams.routes));
        if (routeIds) {
            this._setState({ isLoading: true });
            const currentRouteIds = this.props.routeListStore!.routeItems.map(routeItem => routeItem.route.id);
            const missingRouteIds = routeIds.filter(id => !currentRouteIds.includes(id));
            currentRouteIds
                .filter(id => !routeIds.includes(id))
                .forEach(id => this.props.routeListStore!.removeFromRouteItems(id));

            const routeIdsNotFound: string[] = [];
            const promises: Promise<void>[] = [];
            const missingRoutes: IRoute[] = [];
            const missingLines: ILine[] = [];
            missingRouteIds.map((routeId: string) => {
                const createPromise = async () => {
                    const route = await RouteService.fetchRoute(routeId, {
                        areRoutePathLinksExcluded: true
                    });
                    if (!route) {
                        routeIdsNotFound.push(routeId);
                    } else {
                        missingRoutes.push(route);
                        const line = await LineService.fetchLine(route.lineId);
                        missingLines.push(line);
                    }
                };
                promises.push(createPromise());
            });

            await Promise.all(promises);
            this.props.routeListStore!.addToLines(missingLines);
            this.props.routeListStore!.addToRouteItems(missingRoutes);


            if (routeIdsNotFound.length > 0) {
                this.props.errorStore!.addError(`Reittien (${routeIdsNotFound.join(', ')}) haku epäonnistui.`);
            }
            this._setState({ isLoading: false });
        }
    };

    private centerMapToRoutes = () => {
        const routes: IRoute[] = this.props.routeListStore!.routes;
        const isLoading = this.state.isLoading;
        if (!routes || isLoading) return;
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
        if (!bounds.isValid()) {
            this.props.mapStore!.initCoordinates();
            return;
        }

        this.props.mapStore!.setMapBounds(bounds);
    };

    private redirectToNewRoutePathView = (route: IRoute) => () => {
        const newRoutePathLink = routeBuilder
            .to(SubSites.newRoutePath)
            .set(QueryParams.routeId, route.id)
            .set(QueryParams.lineId, route.lineId)
            .toLink();

        navigator.goTo({ link: newRoutePathLink });
    };

    private closeRoutePrompt = (route: IRoute) => {
        const routeListStore = this.props.routeListStore!;
        const routeStore = this.props.routeStore!;
        const routePathMassEditStore = this.props.routePathMassEditStore!;
        const selectedTabIndex = routeListStore.getRouteItem(route.id)?.selectedTabIndex;
        const isEditingRoutePaths = selectedTabIndex === 0;
        const isDirty = isEditingRoutePaths ? routePathMassEditStore.isDirty : routeStore.isDirty;
        if (
            routeListStore.routeIdToEdit === route.id &&
            isDirty
        ) {
            this.props.confirmStore!.openConfirm({
                content: `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat sulkea reitin? Tallentamattomat muutokset kumotaan.`,
                onConfirm: () => {
                    this.closeRoute(route, isEditingRoutePaths);
                },
                confirmButtonText: 'Kyllä'
            });
        } else {
            this.closeRoute(route, isEditingRoutePaths);
        }
    };

    private closeRoute = (route: IRoute, isEditingRoutePaths: boolean) => {
        const routeListStore = this.props.routeListStore!;
        const routeStore = this.props.routeStore!;
        const routePathMassEditStore = this.props.routePathMassEditStore!;

        if (routeListStore.routeIdToEdit === route.id) {
            if (isEditingRoutePaths) {
                routePathMassEditStore.clear();
            } else {
                routeStore.clear();
            }
            routeListStore.setRouteIdToEdit(null);
        }

        this.props.routeListStore!.removeFromRouteItems(route.id);
        const closeRouteLink = routeBuilder
            .to(SubSites.current, navigator.getQueryParamValues())
            .remove(QueryParams.routes, route.id)
            .toLink();
        navigator.goTo({ link: closeRouteLink, shouldSkipUnsavedChangesPrompt: true });
    };

    private startEditPrompt = (route: IRoute) => {
        const confirmStore = this.props.confirmStore!;
        const routeListStore = this.props.routeListStore!;
        const routeStore = this.props.routeStore!;
        const routePathMassEditStore = this.props.routePathMassEditStore!;

        const newRouteId = route.id === routeListStore.routeIdToEdit ? null : route.id;
        const selectedTabIndex = routeListStore.getRouteItem(route.id)?.selectedTabIndex;
        const isEditingRoutePaths = selectedTabIndex === 0;

        const isDirty = isEditingRoutePaths ? routePathMassEditStore.isDirty : routeStore.isDirty;
        if (!isDirty) {
            this.startEdit({ route, newRouteId, isEditingRoutePaths })
            return;
        }

        let promptMessage;
        if (isEditingRoutePaths) {
            promptMessage = `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan.`;
        }
        else if (route.id === routeListStore.routeIdToEdit) {
            promptMessage = `Sinulla on tallentamattomia muutoksia. Oletko varma, että haluat lopettaa muokkaamisen? Tallentamattomat muutokset kumotaan.`;
        } else {
            promptMessage = `Sinulla on reitin ${
                routeStore.route.routeName
                } muokkaus kesken. Oletko varma, että haluat muokata toista reittiä? Tallentamattomat muutokset kumotaan.`;
        }

        confirmStore.openConfirm({
            content: promptMessage,
            onConfirm: () => {
                this.startEdit({ route, newRouteId, isEditingRoutePaths })
            },
            confirmButtonText: 'Kyllä'
        });
    };

    private startEdit = ({ route, newRouteId, isEditingRoutePaths }: { route: IRoute, newRouteId: string | null, isEditingRoutePaths: boolean }) => {
        const routeStore = this.props.routeStore!;
        const routeListStore = this.props.routeListStore!;
        const routePathMassEditStore = this.props.routePathMassEditStore!;
        const isEditing = Boolean(newRouteId);
        routeListStore.setRouteIdToEdit(newRouteId);
        if (isEditing) {
            if (isEditingRoutePaths) {
                routeListStore.setAllRoutePathsVisible(route.id);
                routePathMassEditStore.init({ routePaths: route.routePaths });
            } else {
                routeStore.init({ route, isNewRoute: false });
            }
        } else {
            routePathMassEditStore.clear();
            routeStore.clear();
        }
    }

    render() {
        const routeListStore = this.props.routeListStore!;
        const routeItems = routeListStore.routeItems;
        const routeIdToEdit = routeListStore.routeIdToEdit;
        if (routeItems.length < 1) {
            return <Loader />;
        }
        return (
            <div className={s.routeListView} data-cy='routeListView'>
                <div className={s.routeList}>
                    {routeItems.map((routeItem: IRouteItem, index: number) => {
                        const route = routeItem.route;
                        const isEditing = routeIdToEdit === route.id;
                        const transitType = routeListStore.getLine(route.lineId)?.transitType!;
                        return (
                            <div key={index} className={s.routeListItem}>
                                <SidebarHeader
                                    isEditing={isEditing}
                                    isBackButtonVisible={true}
                                    isEditButtonVisible={true}
                                    isEditPromptHidden={true}
                                    onCloseButtonClick={() => this.closeRoutePrompt(route)}
                                    onEditButtonClick={() => this.startEditPrompt(route)}
                                >
                                    <TransitTypeLink
                                        transitType={transitType}
                                        shouldShowTransitTypeIcon={true}
                                        text={route!.id}
                                        onClick={() => NavigationUtils.openLineView({ lineId: route!.lineId })}
                                        hoverText={`Avaa linja ${route!.lineId}`}
                                        data-cy='routeId'
                                    />
                                </SidebarHeader>
                                <div className={s.routeItemWrapper}>
                                    <RouteItem
                                        route={route}
                                        routeIdToEdit={routeIdToEdit}
                                        selectedTabIndex={routeItem.selectedTabIndex}
                                        areAllRoutePathsVisible={routeItem.areAllRoutePathsVisible} />
                                </div>
                                {this.props.loginStore!.hasWriteAccess && (
                                    <div className={s.buttonContainer}>
                                        <Button
                                            onClick={this.redirectToNewRoutePathView(route)}
                                            type={ButtonType.SQUARE}
                                            disabled={Boolean(routeListStore.routeIdToEdit)}
                                        >
                                            {`Luo uusi reitinsuunta reitille ${route.id}`}
                                        </Button>
                                    </div>
                                )}
                                {!this.props.loginStore!.hasWriteAccess && (
                                    <div className={s.sectionDivider} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default RouteList;

