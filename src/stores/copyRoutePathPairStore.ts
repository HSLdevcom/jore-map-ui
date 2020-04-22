import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import { IRoutePath } from '~/models';

interface IRoutePathToCopy {
    routePath: IRoutePath;
    lineId: string;
    routeId: string;
}

class CopyRoutePathPairStore {
    @observable private _lineId: string | null;
    @observable private _routeId: string | null;
    @observable private _routePathDirection1: IRoutePathToCopy | null;
    @observable private _routePathDirection2: IRoutePathToCopy | null;

    constructor() {
        this.clear();
    }

    @computed
    get lineId() {
        return this._lineId;
    }

    @computed
    get routeId() {
        return this._routeId;
    }

    @computed
    get routePathDirection1() {
        return this._routePathDirection1;
    }

    @computed
    get routePathDirection2() {
        return this._routePathDirection2;
    }

    @computed
    get isVisible() {
        return this._lineId !== null && this._routeId !== null;
    }

    @action
    public init = ({ lineId, routeId }: { lineId: string; routeId: string }) => {
        this._lineId = lineId;
        this._routeId = routeId;
    };

    @action
    public clear = () => {
        this._lineId = null;
        this._routeId = null;
        this._routePathDirection1 = null;
        this._routePathDirection2 = null;
    };
}

export default new CopyRoutePathPairStore();

export { CopyRoutePathPairStore };
