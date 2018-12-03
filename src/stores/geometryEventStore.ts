import { action, computed, observable, observe, IObjectDidChange } from 'mobx';
import IEvent from '~/models/IEvent';
import eventType from '~/enums/eventType';
import entityName from '~/enums/entityName';
import { IRoutePathLink } from '~/models';
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
        { action, entityName, objectId, oldObject, newObject }
      : {
          action: eventType,
          entityName: entityName,
          objectId: string,
          oldObject?: object,
          newObject?: object,
      },
      ) {
        this._events.push({
            action,
            objectId,
            postObject: newObject,
            preObject: oldObject,
            timestamp: new Date(),
            entity: entityName,
        });
    }

    private logRoutePathLinkChanges(change: IObjectDidChange) {
        if (change.hasOwnProperty(IObjectDidChangeUpdateTypes.ADDED)) {
            change[IObjectDidChangeUpdateTypes.ADDED].slice()
                .forEach((routePathLink: IRoutePathLink) => {
                    this.pushToEvents({
                        action: eventType.ADD,
                        entityName: entityName.ROUTELINK,
                        newObject: routePathLink,
                        objectId: routePathLink.id,
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

    private initRoutePathLinkObservable() {
        // Creating watcher which will trigger when RoutePathStore is initialized
        // We cannot watch RoutePathStore!.routePath!.routePathLinks!
        // before we know that it is defined
        const reactor = observe(
            RoutePathStore!,
            () => {
                const routePath = RoutePathStore!.routePath;
                if (routePath) {
                    // RoutePath store and RoutePathStore!.routePath are defined
                    // We can now delete old watcher and create new watcher for:
                    // RoutePathStore!.routePath!.routePathLinks!
                    reactor();
                    observe(
                        RoutePathStore!.routePath!.routePathLinks!,
                        (change) => {
                            this.logRoutePathLinkChanges(change);
                        },
                    );
                }
            },
        );
    }
}

const observableGeometryEventStore = new GeometryEventStore();

export default observableGeometryEventStore;
