import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import Moment from 'moment';
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
        return Boolean(this._massEditRoutePaths?.find(massEditRp =>
            !massEditRp.oldRoutePath ||
            massEditRp.routePath.startTime.getTime() !== massEditRp.oldRoutePath.startTime.getTime() ||
            massEditRp.routePath.endTime.getTime() !== massEditRp.oldRoutePath.endTime.getTime()))
    }

    @computed
    get isFormValid() {
        let isValid = true;
        this._massEditRoutePaths?.forEach(massEditRp => {
            if (!massEditRp.validationResult.isValid) {
                isValid = false;
            }
        })
        return isValid;
    }

    @computed
    get routePaths(): IRoutePath[] {
        return this._massEditRoutePaths!.map(massEditRp => massEditRp.routePath);
    }

    @action
    public init = ({ routePaths }: { routePaths: IRoutePath[] }) => {
        const massEditRoutePaths: IMassEditRoutePath[] = [];
        _.cloneDeep(routePaths).forEach((rp: IRoutePath) => {
            massEditRoutePaths.push({
                id: rp.internalId,
                routePath: rp,
                oldRoutePath: _.cloneDeep(rp),
                validationResult: { isValid: true },
                isNew: false
            })
        });
        this._massEditRoutePaths = massEditRoutePaths.slice().sort(_sortMassEditRoutePaths);;
        this.validateMassEditRoutePaths();
    };

    @action
    public updateRoutePathStartDate = (id: string, newStartDate: Date) => {
        this._massEditRoutePaths?.find(m => m.id === id)!.routePath.startTime = newStartDate;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    }

    @action
    public updateRoutePathEndDate = (id: string, newEndDate: Date) => {
        this._massEditRoutePaths?.find(m => m.id === id)!.routePath.endTime = newEndDate;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    }

    @action
    public validateMassEditRoutePaths = () => {
        this._massEditRoutePaths!.map((massEditRp: IMassEditRoutePath, index: number) => {
            const prevRoutePathWithGap = _getPreviousRoutePathWithGap(massEditRp, this._massEditRoutePaths!, index, massEditRp.routePath.direction);
            if (massEditRp.routePath.startTime.getTime() > massEditRp.routePath.endTime.getTime()) {
                massEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Alkupäivämäärä on loppupäivämäärän jälkeen.'
                }
            } else if (prevRoutePathWithGap) {
                massEditRp.validationResult = {
                    isValid: true,
                    errorMessage: `Tämän päivämäärän ja edellisen reitinsuunnan päivämäärän (${prevRoutePathWithGap.originFi} - ${prevRoutePathWithGap.destinationFi}, ${Moment(prevRoutePathWithGap.startTime).format('DD.MM.YYYY')} - ${Moment(prevRoutePathWithGap.endTime).format('DD.MM.YYYY')}) välillä on väli.`
                }
            } else {
                massEditRp.validationResult = {
                    isValid: true,
                    errorMessage: ''
                }
            }
            return massEditRp;
        })
    }

    @action
    public clear = () => {
        this._massEditRoutePaths = null;
    };
}

const _getPreviousRoutePathWithGap = (currentMassEditRp: IMassEditRoutePath, massEditRps: IMassEditRoutePath[], index: number, direction: string): IRoutePath | null => {
    let prevMassEditRoutePath;
    if (index < massEditRps.length - 1) {
        // Find massEditRoutePath below index
        for (let i = index + 1; i < massEditRps.length; i += 1) {
            if (massEditRps[i].routePath.direction === direction) {
                prevMassEditRoutePath = massEditRps[i];
                break;
            };
        }
    }
    if (!prevMassEditRoutePath) return null;
    const a = Moment(currentMassEditRp.routePath.startTime)
    const b = Moment(prevMassEditRoutePath.routePath.endTime);
    const diffInDays = a.diff(b, 'days');
    return diffInDays > 1 ? prevMassEditRoutePath.routePath : null;
};

const _sortMassEditRoutePaths = (a: IMassEditRoutePath, b: IMassEditRoutePath) => {
    if (a.routePath.startTime < b.routePath.startTime) return 1;
    if (a.routePath.startTime > b.routePath.startTime) return -1;
    return 0;
};

export default new RoutePathMassEditStore();

export { RoutePathMassEditStore };
