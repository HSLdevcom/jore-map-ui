import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import Moment from 'moment';
import { IRoutePath } from '~/models';
import { IMassEditRoutePath } from '~/models/IRoutePath';
import { IRoutePathToCopy } from './copyRoutePathStore';
import NavigationStore from './navigationStore';
import RouteListStore from './routeListStore';

class RoutePathMassEditStore {
    @observable private _massEditRoutePaths: IMassEditRoutePath[] | null;
    @observable private _newRoutePathIdCounter: number;

    constructor() {
        this._massEditRoutePaths = null;
        this._newRoutePathIdCounter = 1;

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
        return Boolean(
            this._massEditRoutePaths?.find(
                (massEditRp) =>
                    !massEditRp.oldRoutePath ||
                    massEditRp.routePath.startTime.getTime() !==
                        massEditRp.oldRoutePath.startTime.getTime() ||
                    massEditRp.routePath.endTime.getTime() !==
                        massEditRp.oldRoutePath.endTime.getTime()
            )
        );
    }

    @computed
    get isFormValid() {
        let isValid = true;
        this._massEditRoutePaths?.forEach((massEditRp) => {
            if (!massEditRp.validationResult.isValid) {
                isValid = false;
            }
        });
        return isValid;
    }

    @computed
    get routePaths(): IRoutePath[] {
        return this._massEditRoutePaths!.map((massEditRp) => massEditRp.routePath);
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
                isNew: false,
            });
        });
        this._massEditRoutePaths = massEditRoutePaths.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    };

    @action
    public updateRoutePathStartDate = (id: string, newStartDate: Date) => {
        this._massEditRoutePaths?.find((m) => m.id === id)!.routePath.startTime = newStartDate;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    };

    @action
    public updateRoutePathEndDate = (id: string, newEndDate: Date) => {
        this._massEditRoutePaths?.find((m) => m.id === id)!.routePath.endTime = newEndDate;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    };

    @action
    public addRoutePaths = (routePathsToCopy: IRoutePathToCopy[]) => {
        const newMassEditRoutePaths: IMassEditRoutePath[] = [];
        let idCounter = this._newRoutePathIdCounter;
        routePathsToCopy.forEach((rpToCopy) => {
            const newRoutePathId = `new-${idCounter}`;
            const newRoutePath = _.cloneDeep(rpToCopy.routePath);
            const oldRoutePath = _.cloneDeep(rpToCopy.routePath);
            newRoutePath.direction = rpToCopy.direction;
            newRoutePath.internalId = newRoutePathId;
            // TODO? newRoutePath.startTime = undefined;
            // TODO? newRoutePath.endTime = undefined;
            newMassEditRoutePaths.push({
                oldRoutePath,
                id: newRoutePathId,
                routePath: newRoutePath,
                validationResult: {
                    isValid: true,
                },
                isNew: true,
            });
            idCounter += 1;
        });
        this._massEditRoutePaths = this._massEditRoutePaths!.concat(newMassEditRoutePaths);
        this._newRoutePathIdCounter = idCounter;
    };

    @action
    public validateMassEditRoutePaths = () => {
        this._massEditRoutePaths!.map((massEditRp: IMassEditRoutePath, index: number) => {
            const prevRoutePathWithGap = _getPreviousRoutePathWithGap(
                massEditRp,
                this._massEditRoutePaths!,
                index,
                massEditRp.routePath.direction
            );
            if (massEditRp.routePath.startTime.getTime() > massEditRp.routePath.endTime.getTime()) {
                massEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Alkupäivämäärä on loppupäivämäärän jälkeen.',
                };
            } else if (prevRoutePathWithGap) {
                massEditRp.validationResult = {
                    isValid: true,
                    errorMessage: `Tämän ja edellisen reitinsuunnan (${
                        prevRoutePathWithGap.originFi
                    } - ${prevRoutePathWithGap.destinationFi}, ${Moment(
                        prevRoutePathWithGap.startTime
                    ).format('DD.MM.YYYY')} - ${Moment(prevRoutePathWithGap.endTime).format(
                        'DD.MM.YYYY'
                    )}) päivämäärät eivät ole jatkuvia.`,
                };
            } else {
                massEditRp.validationResult = {
                    isValid: true,
                    errorMessage: '',
                };
            }
            return massEditRp;
        });
    };

    @action
    public clear = () => {
        this._massEditRoutePaths = null;
    };
}

const _getPreviousRoutePathWithGap = (
    currentMassEditRp: IMassEditRoutePath,
    massEditRps: IMassEditRoutePath[],
    index: number,
    direction: string
): IRoutePath | null => {
    let prevMassEditRoutePath;
    if (index < massEditRps.length - 1) {
        // Find massEditRoutePath below index
        for (let i = index + 1; i < massEditRps.length; i += 1) {
            if (massEditRps[i].routePath.direction === direction) {
                prevMassEditRoutePath = massEditRps[i];
                break;
            }
        }
    }
    if (!prevMassEditRoutePath) return null;
    const a = Moment(currentMassEditRp.routePath.startTime);
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
