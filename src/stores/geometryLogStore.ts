import { action, computed, observable, observe, IObjectDidChange } from 'mobx';
import ILogEntry from '~/models/ILogEntry';
import logActions from '~/enums/logActions';
import entityNames from '~/enums/entityNames';
import { IRoutePathLink } from '~/models';
import RoutePathStore from './routePathStore';

const enum IObjectDidChangeUpdateTypes {
    ADDED = 'added',
}

export class GeometryLogStore {
    @observable private _log: ILogEntry[];

    constructor() {
        this._log = [];

        this.initRoutePathLinkObservable();
    }

    @computed get log(): ILogEntry[] {
        return this._log;
    }

    @action
    public pushToLog(
        { action, entityName, objectId, oldObject, newObject }
      : {
          action: logActions,
          entityName: entityNames,
          objectId: string,
          oldObject?: object,
          newObject?: object,
      },
      ) {
        this._log.push({
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
                    this.pushToLog({
                        action: logActions.ADD,
                        entityName: entityNames.ROUTELINK,
                        newObject: routePathLink,
                        objectId: routePathLink.id,
                    });
                });
        }
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

const observableGeometryLogStore = new GeometryLogStore();

export default observableGeometryLogStore;
