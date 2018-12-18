import { action, computed, observable, observe, IObjectDidChange, Lambda } from 'mobx';
import IEvent from '~/models/IEvent';
import eventType from '~/enums/eventType';
import entityName from '~/enums/entityName';
import { IRoutePathLink } from '~/models';
import RoutePathLinkService from '~/services/routePathLinkService';
import RoutePathStore from './routePathStore';
import Navigator from '../routing/navigator';

const enum IObjectDidChangeUpdateTypes {
    ADDED = 'added',
}

export class GeometryEventStore {
    @observable private _events: IEvent[];

    constructor() {
        this._events = [];

        this.initRoutePathLinkObservable();
        this.initClearEventListOnPageChange();
    }

    @computed get events(): IEvent[] {
        return this._events;
    }

    @action
    private clearEvents() {
        this._events = [];
    }

    @action
    private pushToEvents(
        { action, entityName, preObject }
        : {
            preObject: any,
            action: eventType,
            entityName: entityName,
        },
        ) {
        this._events.push(
            {
                action,
                preObject,
                timestamp: new Date(),
                entity: entityName,
            });
    }

    @action
    public undo() {
        const event = this._events.pop();
        if (event) {
            switch (event.action) {
            case eventType.ADD_ROUTEPATH_LINK:
                this.undoRoutePathLink(event);
                break;
            }
        }
    }

    @computed get hasEvents(): boolean {
        return this._events.length !== 0;
    }

    private logRoutePathLinkChanges(
        change: IObjectDidChange,
        routePathLinks: IRoutePathLink[],
        ) {
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

    private initClearEventListOnPageChange() {
        observe(
            Navigator!.getStore(),
            () => {
                this.clearEvents();
            },
        );
    }

    public undoRoutePathLink = async (event: IEvent) => {
        const routePathLinks = event.preObject as IRoutePathLink[];

        RoutePathStore!.setRoutePathLinks(routePathLinks);

        if (routePathLinks.length > 0) {
            const neighbourLinks =
                await RoutePathLinkService.fetchAndCreateRoutePathLinksWithStartNodeId(
                    routePathLinks[routePathLinks.length - 1].endNode.id,
                );
            RoutePathStore!.setNeighborRoutePathLinks(neighbourLinks);
        } else {
            RoutePathStore!.setNeighborRoutePathLinks([]);
        }
    }

    private initRoutePathLinkObservable() {
        let routePathReactor : Lambda | null = null;
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
                    // Creating watcher for RoutePathStore.routePath.routePathLinks.
                    // Which is the list that we want to observe.
                    routePathReactor = observe(
                        RoutePathStore!.routePath!.routePathLinks!,
                        (change) => {
                            this.logRoutePathLinkChanges(
                                change,
                                RoutePathStore!.routePath!.routePathLinks!,
                            );
                        },
                    );
                } else if (
                    !change['newValue']
                    && routePathReactor !== null
                ) {
                    routePathReactor!();
                }
            },
        );
    }
}

const observableGeometryEventStore = new GeometryEventStore();

export default observableGeometryEventStore;
