import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import Moment from 'moment';
import { IRoutePath } from '~/models';
import { IMassEditRoutePath } from '~/models/IRoutePath';
import RoutePathLayerStore from '~/stores/routePathLayerStore';
import { getMaxDate, toDateString } from '~/utils/dateUtils';
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
    public removeRoutePath = (id: string) => {
        const removeIndex = this._massEditRoutePaths?.findIndex((rp) => rp.id === id)!;
        this._massEditRoutePaths!.splice(removeIndex, 1);
        this.validateMassEditRoutePaths();
        RoutePathLayerStore.removeRoutePath(id);
    };

    @action
    public addCopiedRoutePaths = (routePathsToCopy: IRoutePathToCopy[]) => {
        let idCounter = this._newRoutePathIdCounter;
        const routePathsWithNewId: IRoutePath[] = [];
        const newMassEditRoutePaths: IMassEditRoutePath[] = [];
        routePathsToCopy.forEach((rpToCopy) => {
            const newRoutePathId = `new-${idCounter}`;

            const routePathWithNewId: IRoutePath = _.cloneDeep(rpToCopy.routePath);
            routePathWithNewId.internalId = newRoutePathId;
            routePathsWithNewId.push(routePathWithNewId);

            const newRoutePath = _.cloneDeep(rpToCopy.routePath);
            const oldRoutePath = _.cloneDeep(rpToCopy.routePath);
            newRoutePath.direction = rpToCopy.direction;
            newRoutePath.internalId = newRoutePathId;

            const maxDatePlusOne = getMaxDate();
            maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);
            newRoutePath.startTime = _.cloneDeep(maxDatePlusOne);
            newRoutePath.endTime = _.cloneDeep(maxDatePlusOne);
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
        RoutePathLayerStore.addRoutePaths(routePathsWithNewId);

        this._massEditRoutePaths = this._massEditRoutePaths!.concat(newMassEditRoutePaths);
        this._newRoutePathIdCounter = idCounter;
        this.validateMassEditRoutePaths();
    };

    // Expects that routePaths are sorted
    @action
    public validateMassEditRoutePaths = () => {
        this._massEditRoutePaths!.map((currMassEditRp: IMassEditRoutePath, index: number) => {
            if (currMassEditRp.routePath.startTime.getTime() > getMaxDate().getTime()) {
                currMassEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Aseta alkupäivämäärä',
                };
                return currMassEditRp;
            }
            if (currMassEditRp.routePath.endTime.getTime() > getMaxDate().getTime()) {
                currMassEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Aseta loppupäivämäärä',
                };
                return currMassEditRp;
            }

            const nextMassEditRp = _findNextMassEditRoutePath(
                this._massEditRoutePaths!,
                currMassEditRp,
                index
            );
            if (
                nextMassEditRp &&
                nextMassEditRp.routePath.startTime.getTime() <
                    currMassEditRp.routePath.endTime.getTime()
            ) {
                currMassEditRp.validationResult = {
                    isValid: false,
                    errorMessage: `Päivämäärät menevät päällekkäin edellisen reitinsuunnan (${_getRoutePathDescription(
                        nextMassEditRp.routePath
                    )}) kanssa`,
                };
                return currMassEditRp;
            }

            const prevRoutePathWithGap = _getPreviousRoutePathWithGap(
                currMassEditRp,
                this._massEditRoutePaths!,
                index,
                currMassEditRp.routePath.direction
            );
            if (
                currMassEditRp.routePath.startTime.getTime() >
                currMassEditRp.routePath.endTime.getTime()
            ) {
                currMassEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Alkupäivämäärä on loppupäivämäärän jälkeen.',
                };
            } else if (prevRoutePathWithGap) {
                currMassEditRp.validationResult = {
                    isValid: true,
                    errorMessage: `Tämän ja edellisen reitinsuunnan (${_getRoutePathDescription(
                        prevRoutePathWithGap
                    )}) päivämäärät eivät ole jatkuvia.`,
                };
            } else {
                currMassEditRp.validationResult = {
                    isValid: true,
                    errorMessage: '',
                };
            }
            return currMassEditRp;
        });
    };

    @action
    public stopEditing = () => {
        // To clear unsaved routePaths, need to remove them from RoutePathLayerStore
        const routePathsToRemove = this._massEditRoutePaths!.filter((mEditRp) => mEditRp.isNew).map(
            (mEditRp) => mEditRp.routePath
        );
        routePathsToRemove.forEach((rp) => RoutePathLayerStore.removeRoutePath(rp.internalId));
        this.clear();
    };

    @action
    public clear = () => {
        this._massEditRoutePaths = null;
    };
}

const _getRoutePathDescription = (routePath: IRoutePath) => {
    return `${routePath.originFi} - ${routePath.destinationFi}, ${toDateString(
        routePath.startTime
    )} - ${toDateString(routePath.endTime)}`;
};

// Group above the current group
const _findNextMassEditRoutePath = (
    massEditRoutePaths: IMassEditRoutePath[],
    currentMassEditRp: IMassEditRoutePath,
    index: number
): IMassEditRoutePath | null => {
    if (index > 0) {
        for (let i = index - 1; i >= 0; i -= 1) {
            if (
                massEditRoutePaths[i].routePath.direction === currentMassEditRp.routePath.direction
            ) {
                return massEditRoutePaths[i];
            }
        }
    }
    return null;
};

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
