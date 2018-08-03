import { action, computed, observable, toJS } from 'mobx';
import { IRoute } from '../models';

export class RouteStore {
    @observable private _openRoutes = observable<IRoute>([]);

    @computed get openRoutes(): IRoute[] {
        return toJS(this._openRoutes);
    }

    @action
    public addToOpenedRoutes(node: IRoute) {
        this._openRoutes.push(node);
    }

    @action
    public clearOpenRoutes() {
        this._openRoutes.clear();
    }
}

const observableStoreStore = new RouteStore();

export default observableStoreStore;
