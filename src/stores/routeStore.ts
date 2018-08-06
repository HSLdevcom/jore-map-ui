import { action, computed, observable, toJS } from 'mobx';
import { IRoute, IDirection } from '../models';

export class RouteStore {
    @observable private _routes = observable<IRoute>([]);

    @computed get routes(): IRoute[] {
        return toJS(this._routes);
    }

    @action
    public addToRoutes(node: IRoute) {
        this._routes.push(node);
    }

    @action
    public clearRoutes() {
        this._routes.clear();
    }

    private findObservableDirection(route: IRoute, direction: IDirection): IDirection | null {
        let directionObservable: IDirection | null = null;

        this._routes.find((r) => {
            const found = r.directions.find(d =>
                d.direction === direction.direction &&
                d.endTime.getTime() === direction.endTime.getTime() &&
                d.startTime.getTime() === direction.startTime.getTime() &&
                r.lineId === route.lineId,
            );
            if (found) {
                directionObservable = found;
                return true;
            }
            return false;
        });
        return directionObservable;
    }

    @action
    public toggleDirectionIsVisible(route: IRoute, direction: IDirection) {
        const directionObservable = this.findObservableDirection(route, direction);
        if (directionObservable) {
            directionObservable.visible = !directionObservable.visible;
        }
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
