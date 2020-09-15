import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import { ILine, IRoute, IRoutePath } from '~/models';
import ISchedule from '~/models/ISchedule';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import LineService from '~/services/lineService';
import RoutePathService from '~/services/routePathService';
import RouteService from '~/services/routeService';
import { isCurrentDateWithinTimeSpan } from '~/utils/dateUtils';
import ErrorStore from './errorStore';
import MapStore from './mapStore';
import RoutePathLayerListStore from './routePathLayerListStore';
import SearchStore from './searchStore';

interface IRoutePathStopNames {
    firstStopName: string;
    lastStopName: string;
}

interface IRouteItem {
    route: IRoute;
    selectedTabIndex: number; // Needs to be in store instead of RouteItem's state to prevent state reseting when RouteItem re-renders
    areAllRoutePathsVisible: boolean; // Needs to be in store instead of RouteItem's state to prevent state reseting when RouteItem re-renders
    areSchedulesVisible: boolean;
    activeSchedules: ISchedule[];
}

class RouteListStore {
    @observable private _routeItems: IRouteItem[];
    @observable private _lines: ILine[];
    @observable private _routeIdToEdit: string | null;
    @observable private _areRoutesLoading: boolean;
    @observable private _stopNameMap: Map<string, IRoutePathStopNames>;
    @observable private _loadedRouteIds: string[];

    constructor() {
        this._routeItems = [];
        this._lines = [];
        this._routeIdToEdit = null;
        this._areRoutesLoading = false;
        this._stopNameMap = new Map();

        reaction(
            () => this.routeIdToEdit != null,
            (value: boolean) => SearchStore.setIsSearchDisabled(value)
        );
    }

    @computed
    get routeItems(): IRouteItem[] {
        return this._routeItems;
    }

    @computed
    get routes(): IRoute[] {
        return this._routeItems.map(
            (routeItem: IRouteItem): IRoute => {
                return routeItem.route;
            }
        );
    }

    @computed
    get routeIdToEdit(): string | null {
        return this._routeIdToEdit;
    }

    @computed
    get areRoutesLoading(): boolean {
        return this._areRoutesLoading;
    }

    @computed
    get stopNameMap() {
        return this._stopNameMap;
    }

    public getLine(lineId: string): ILine | undefined {
        return this._lines.find((line) => line.id === lineId);
    }

    @action
    public addToRouteItems = (routes: IRoute[]) => {
        const routeItems = routes.map(
            (route: IRoute): IRouteItem => {
                return {
                    route,
                    selectedTabIndex: 0,
                    areAllRoutePathsVisible: false,
                    areSchedulesVisible: false,
                    activeSchedules: [],
                };
            }
        );
        this._routeItems = this._routeItems.concat(routeItems);
        routes.forEach((route) => {
            RoutePathLayerListStore.addRoutePaths({ routePaths: route.routePaths });
        });
    };

    @action
    public addToLines = (lines: ILine[]) => {
        this._lines = this._lines.concat(lines);
    };

    @action
    public removeFromRouteItems = (routeId: string) => {
        for (let i = 0; i < this._routeItems.length; i += 1) {
            if (this._routeItems[i].route.id === routeId) {
                this._routeItems[i].route.routePaths.forEach((routePath) =>
                    RoutePathLayerListStore.removeRoutePath(routePath.internalId)
                );
                this._routeItems.splice(i, 1);
            }
        }
    };

    @action
    public updateRoute = (route: IRoute) => {
        const routeToUpdateIndex = this._routeItems.findIndex((iterator: IRouteItem) => {
            return iterator.route.id === route.id;
        });
        this._routeItems[routeToUpdateIndex].route = route;
    };

    @action
    public setRouteIdToEdit = (routeId: string | null) => {
        this._routeIdToEdit = routeId;
    };

    @action
    public setActiveSchedules = (routeId: string, activeSchedules: ISchedule[] | null) => {
        const routeItem = this.routeItems.find((item) => item.route.id === routeId)!;
        if (activeSchedules) {
            routeItem.areSchedulesVisible = true;
            routeItem.activeSchedules = activeSchedules;
        } else {
            routeItem.areSchedulesVisible = false;
            routeItem.activeSchedules = [];
        }
    };

    @action
    public clear = () => {
        this._routeItems = [];
        this._routeIdToEdit = null;
        this._loadedRouteIds = [];
        this._areRoutesLoading = false;
        this._stopNameMap = new Map();
        RoutePathLayerListStore.clear();
    };

    @action
    public setSelectedTabIndex = (routeId: string, index: number) => {
        const routeItem = this._routeItems.find((routeItem) => routeItem.route.id === routeId);
        routeItem!.selectedTabIndex = index;
    };

    @action
    public toggleAllRoutePathsVisible = (routeId: string) => {
        const routeItem = this._routeItems.find((routeItem) => routeItem.route.id === routeId);
        routeItem!.areAllRoutePathsVisible = !routeItem!.areAllRoutePathsVisible;
    };

    @action
    public setAreRoutesLoading = (areRoutesLoading: boolean) => {
        this._areRoutesLoading = areRoutesLoading;
    };

    @action
    public setLoadedRouteIds = (loadedRouteIds: string[]) => {
        this._loadedRouteIds = loadedRouteIds;
    };

    @action
    public mergeMapToStopNamesMap = (newMap: Map<string, IRoutePathStopNames>) => {
        this._stopNameMap = new Map([...this._stopNameMap, ...newMap]);
    };

    public fetchRoutes = async ({ forceUpdate }: { forceUpdate: boolean }) => {
        const routeIds: string[] = navigator.getQueryParam(QueryParams.routes) as string[];

        if (!forceUpdate) {
            if (this._areRoutesLoading || _.isEqual(this._loadedRouteIds, routeIds)) {
                return;
            }
        }
        if (routeIds) {
            this.setAreRoutesLoading(true);
            const currentRouteIds = this.routeItems.map((routeItem) => routeItem.route.id);
            const missingRouteIds = routeIds.filter((id) => !currentRouteIds.includes(id));
            currentRouteIds
                .filter((id) => !routeIds.includes(id))
                .forEach((id) => this.removeFromRouteItems(id));

            const routeIdsNotFound: string[] = [];
            const promises: Promise<void>[] = [];
            const missingRoutes: IRoute[] = [];
            const missingLines: ILine[] = [];
            missingRouteIds.map((routeId: string) => {
                const createPromise = async () => {
                    const route = await RouteService.fetchRoute({
                        routeId,
                        areRoutePathLinksExcluded: true,
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
            this.addToLines(missingLines);
            this.addToRouteItems(missingRoutes);

            let hasActiveRoutePath: boolean = false;
            missingRoutes.forEach((route: IRoute) => {
                route.routePaths.forEach((rp: IRoutePath, index: number) => {
                    if (isCurrentDateWithinTimeSpan(rp.startDate, rp.endDate)) {
                        hasActiveRoutePath = true;
                    }
                });
            });
            if (!hasActiveRoutePath) {
                MapStore.initCoordinates();
            }

            if (routeIdsNotFound.length > 0) {
                ErrorStore.addError(`Reittien (${routeIdsNotFound.join(', ')}) haku epäonnistui.`);
            }
            this.setAreRoutesLoading(false);
            this.setLoadedRouteIds(routeIds);
        }
    };

    public fetchStopNames = async (routePaths: IRoutePath[]) => {
        const newMap: Map<string, IRoutePathStopNames> = new Map();
        const promises: Promise<void>[] = [];
        for (let i = 0; i < routePaths.length; i += 1) {
            const routePath: IRoutePath = routePaths[i];
            const oldStopNames = this._stopNameMap.get(routePath.internalId);
            if (!oldStopNames) {
                const createPromise = async () => {
                    const stopNames = await RoutePathService.fetchFirstAndLastStopNamesOfRoutePath({
                        direction: routePath.direction,
                        startDate: routePath.startDate,
                        routeId: routePath.routeId,
                    });
                    newMap.set(routePath.internalId, stopNames as IRoutePathStopNames);
                };
                promises.push(createPromise());
            }
        }
        await Promise.all(promises).then(() => {
            this.mergeMapToStopNamesMap(newMap);
        });
    };

    public getRouteItem = (routeId: string): IRouteItem | undefined => {
        return this._routeItems.find((routeItem) => routeItem.route.id === routeId);
    };
}

export default new RouteListStore();

export { RouteListStore, IRouteItem, IRoutePathStopNames };
