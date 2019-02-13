import { action, computed, observable, observe, IObjectDidChange, Lambda } from 'mobx';
import IEvent from '~/models/IEvent';
import eventType from '~/enums/eventType';
import entityName from '~/enums/entityName';
import { IRoutePathLink } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import RoutePathStore, { AddLinkDirection } from './routePathStore';
import ErrorStore from './errorStore';
import Navigator from '../routing/navigator';

const enum IObjectDidChangeUpdateTypes {
    ADDED = 'added',
}

export class GeometryEventStore {
    @observable private _events: IEvent[];
    private _routePathLinkReactor: Lambda | null = null;

    constructor() {
        this._events = [];

        this.initRoutePathLinkObservable();
        this.initClearEventListOnPageChange();
    }

    @computed
    get events(): IEvent[] {
        return this._events;
    }

    @computed
    get hasEvents(): boolean {
        return this._events.length !== 0;
    }

    @action
    private clearEvents = () => {
        this._events = [];
    }

    @action
    private pushToEvents = (
        { action, entityName, preObject }
        : {
            preObject: any,
            action: eventType,
            entityName: entityName,
        },
        ) => {
        this._events.push(
            {
                action,
                preObject,
                entity: entityName,
            });
    }

    @action
    public undo = () => {
        const event = this._events.pop();
        if (event) {
            switch (event.action) {
            case eventType.ADD_ROUTEPATH_LINK:
                this.undoRoutePathLink(event);
                break;
            }
        }
    }

    private initClearEventListOnPageChange = () => {
        observe(
            Navigator!.getStore(),
            () => {
                this.clearEvents();
            },
        );
    }

    // RoutePath undo. TODO: move this logic to some other place
    private undoRoutePathLink = async (event: IEvent) => {
        const routePathLinks = event.preObject as IRoutePathLink[];

        RoutePathStore!.setRoutePathLinks(routePathLinks);
        // Need to re-initiate watcher, since we have replaced the object that was observed
        this.observeRoutePathLinks();

        if (routePathLinks.length > 0) {
            // TODO: Don't assume we added in the end
            const previousRPLink = routePathLinks[routePathLinks.length - 1];

            const direction = RoutePathStore.addRoutePathLinkInfo.direction;
            const orderNumber =
                direction === AddLinkDirection.AfterNode
                ? previousRPLink.orderNumber + 1
                : previousRPLink.orderNumber;

            try {
                const neighbourLinks =
                await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                    previousRPLink.endNode.id,
                    direction,
                    orderNumber,
                    RoutePathStore.routePath!.transitType,
                );
                RoutePathStore!.setNeighborRoutePathLinks(neighbourLinks);
            } catch (ex) {
                ErrorStore.addError('Haku löytää sopivia naapurisolmuja epäonnistui');
            }
        } else {
            RoutePathStore!.setNeighborRoutePathLinks([]);
        }
    }

    // RoutePath watcher. TODO: move this logic to some other place
    private initRoutePathLinkObservable = () => {
        // Creating watcher which will trigger when RoutePathStore is initialized
        // We cannot watch RoutePathStore!.routePath!.routePathLinks!
        // before we know that it is defined
        observe(
            RoutePathStore!,
            (change) => {
                if (change.name !== '_routePath') {
                    return;
                }

                // We need to watch routePath, however, this object is created and
                // deleted when switching between pages. Here we create a watcher
                // when routePath is created, and remove the watcher when it is
                // deleted.
                if (
                    !change['oldValue']
                    && change['newValue']
                ) {
                    // Run when routepath is created
                    this.observeRoutePathLinks();
                } else if (
                    !change['newValue']
                    && this._routePathLinkReactor !== null
                ) {
                    // Run when routepath is removed
                    this._routePathLinkReactor!();
                }
            },
        );
    }

    private observeRoutePathLinks = () => {
        // Removing old watcher
        if (this._routePathLinkReactor) this._routePathLinkReactor();
        // Creating watcher for RoutePathStore.routePath.routePathLinks.
        // Which is the list that we want to observe.
        this._routePathLinkReactor = observe(
            RoutePathStore!.routePath!.routePathLinks!,
            (change) => {
                this.logRoutePathLinkChanges(
                    change,
                    RoutePathStore!.routePath!.routePathLinks!,
                );
            },
        );
    }

    private logRoutePathLinkChanges = (
        change: IObjectDidChange,
        routePathLinks: IRoutePathLink[],
        ) => {
        if (change.hasOwnProperty(IObjectDidChangeUpdateTypes.ADDED)) {
            change[IObjectDidChangeUpdateTypes.ADDED].slice()
                .forEach(() => {
                    const preRoutePathList = routePathLinks.slice();
                    preRoutePathList.splice(change['index'], 1);
                    this.pushToEvents({
                        action: eventType.ADD_ROUTEPATH_LINK,
                        entityName: entityName.ROUTELINK,
                        preObject: preRoutePathList,
                    });
                });
        }
    }
}

const observableGeometryEventStore = new GeometryEventStore();

export default observableGeometryEventStore;
