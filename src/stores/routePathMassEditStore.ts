import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import { IRoutePath } from '~/models';
import { IMassEditRoutePath } from '~/models/IRoutePath';
import NavigationStore from './navigationStore';
import RouteListStore from './routeListStore';

class RoutePathMassEditStore {
    @observable private _massEditRoutePaths: IMassEditRoutePath[] | null;

    constructor() {
        this._massEditRoutePaths = null;

        reaction(
            () => this.shouldShowUnsavedChangesPrompt,
            (value: boolean) => NavigationStore.setShouldShowUnsavedChangesPrompt(value)
        );
    }

    @computed
    get massEditRoutePaths(): IMassEditRoutePath[] | null {
        return this._massEditRoutePaths;
    }

    @computed
    get shouldShowUnsavedChangesPrompt(): boolean {
        return this.isDirty && RouteListStore.routeIdToEdit != null;
    }

    @computed
    get isDirty() {
        return Boolean(this._massEditRoutePaths?.find(massEditRp => massEditRp.routePath.startTime.getTime() !== massEditRp.oldStartDate.getTime() || massEditRp.routePath.endTime.getTime() !== massEditRp.oldEndDate.getTime() ))
    }

    @computed
    get isFormValid() {
        return Boolean(this._massEditRoutePaths?.find(massEditRp => {
            return !massEditRp.validationResult.isValid;
        }))
    }

    @computed
    get routePaths(): IRoutePath[] {
        return this._massEditRoutePaths!.map(massEditRp => massEditRp.routePath);
    }

    // TODO:
    // @computed
    // get isFormValid() {
    //     return this._validationStore.isValid();
    // }

    @action
    public init = ({ routePaths }: { routePaths: IRoutePath[] }) => {
        const originalRoutePathOrder = [];
        const massEditRoutePaths: IMassEditRoutePath[] = [];
        _.cloneDeep(routePaths).forEach((rp: IRoutePath) => {
            originalRoutePathOrder.push(rp.internalId);
            massEditRoutePaths.push({
                id: rp.internalId,
                routePath: rp,
                oldEndDate: rp.endTime,
                oldStartDate: rp.startTime,
                validationResult: { isValid: true },
                isNew: false
            })
        });
        this._massEditRoutePaths = massEditRoutePaths;
    };

    @action
    public updateRoutePathStartDate = (id: string, newStartDate: Date) => {
        this._massEditRoutePaths?.find(m => m.id === id)!.routePath.startTime = newStartDate;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
    }

    @action
    public updateRoutePathEndDate = (id: string, newEndDate: Date) => {
        this._massEditRoutePaths?.find(m => m.id === id)!.routePath.endTime = newEndDate;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
    }

    @action
    public validateMassEditRoutePaths = () => {

    }

    @action
    public clear = () => {
        this._massEditRoutePaths = null;
    };
}

const _sortMassEditRoutePaths = (a: IMassEditRoutePath, b: IMassEditRoutePath) => {
    if (a.routePath.startTime < b.routePath.startTime) return -1;
    if (a.routePath.startTime > b.routePath.startTime) return 1;
    return 0;
};

export default new RoutePathMassEditStore();

export { RoutePathMassEditStore };
