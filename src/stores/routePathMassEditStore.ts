import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import Moment from 'moment';
import { IRoutePath } from '~/models';
import { IMassEditRoutePath } from '~/models/IRoutePath';
import RouteListStore from '~/stores/routeListStore';
import RoutePathLayerListStore from '~/stores/routePathLayerListStore';
import { getMaxDate, toDateString } from '~/utils/dateUtils';
import NavigationStore from './navigationStore';
import { IRoutePathToCopy } from './routePathCopyStore';

class RoutePathMassEditStore {
    @observable private _massEditRoutePaths: IMassEditRoutePath[] | null;
    @observable private _newRoutePathIdCounter: number;
    @observable private _selectedRoutePath: IRoutePath | null;
    @observable private _selectedRoutePathIdGroups: string[][];
    @observable private _routeId: string | null;

    constructor() {
        this._massEditRoutePaths = null;
        this._newRoutePathIdCounter = 1;
        this._selectedRoutePathIdGroups = [];
        this._routeId = null;

        reaction(
            () => this.shouldShowUnsavedChangesPrompt,
            (value: boolean) => NavigationStore.setShouldShowUnsavedChangesPrompt(value)
        );
        reaction(
            () => this.shouldShowUnsavedChangesPrompt,
            (value: boolean) => this.setNavigationAction(value)
        );
    }

    @computed
    get massEditRoutePaths(): IMassEditRoutePath[] | null {
        return this._massEditRoutePaths;
    }

    @computed
    get selectedRoutePath(): IRoutePath | null {
        return this._selectedRoutePath;
    }

    @computed
    get selectedRoutePathIdGroups(): string[][] {
        return this._selectedRoutePathIdGroups;
    }

    @computed
    get shouldShowUnsavedChangesPrompt(): boolean {
        return this.isDirty && RouteListStore.routeIdToEdit != null;
    }

    @computed
    get isDirty() {
        const isAnyRpNew = Boolean(
            this._massEditRoutePaths?.find((massEditRp) => massEditRp.isNew)
        );
        if (isAnyRpNew) return true;

        return Boolean(
            this._massEditRoutePaths?.find(
                (massEditRp) =>
                    !massEditRp.oldRoutePath ||
                    massEditRp.routePath.startDate.getTime() !==
                        massEditRp.oldRoutePath.startDate.getTime() ||
                    massEditRp.routePath.endDate.getTime() !==
                        massEditRp.oldRoutePath.endDate.getTime()
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
        if (!this._massEditRoutePaths) return [];

        return this._massEditRoutePaths!.map((massEditRp) => massEditRp.routePath);
    }

    @action
    public setSelectedRoutePath = (selectedRoutePath: IRoutePath | null) => {
        this._selectedRoutePath = selectedRoutePath;
    };

    @action
    public init = ({ routePaths, routeId }: { routePaths: IRoutePath[]; routeId: string }) => {
        const massEditRoutePaths: IMassEditRoutePath[] = [];
        _.cloneDeep(routePaths).forEach((rp: IRoutePath) => {
            massEditRoutePaths.push({
                id: rp.internalId,
                routePath: rp,
                oldRoutePath: _.cloneDeep(rp),
                validationResult: { isValid: true },
                isStartDateSet: true,
                isEndDateSet: true,
                isNew: false,
            });
        });
        this._routeId = routeId;
        this._massEditRoutePaths = massEditRoutePaths.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    };

    @action
    public updateRoutePathStartDates = (routePaths: IRoutePath[], value: Date) => {
        routePaths.forEach((rp) => {
            this.updateRoutePathStartDate(rp.internalId, value);
        });
    };

    @action
    public updateRoutePathStartDate = (id: string, newStartDate: Date) => {
        const massEditRpToUpdate = this._massEditRoutePaths!.find((m) => m.id === id)!;
        const routePathToUpdate = massEditRpToUpdate.routePath;
        routePathToUpdate.startDate = newStartDate;
        massEditRpToUpdate.isStartDateSet = true;
        // Update routePath's endDate as the same as startDate if endDate is not set
        if (!massEditRpToUpdate.isEndDateSet) {
            routePathToUpdate.endDate = _.cloneDeep(newStartDate);
            massEditRpToUpdate.isEndDateSet = true;
        }

        this.removeIdFromSelectedRoutePathIdGroups(id);

        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);

        this.validateMassEditRoutePaths();
    };

    @action
    public removeIdFromSelectedRoutePathIdGroups = (id: string) => {
        const groupIndex = this._selectedRoutePathIdGroups.findIndex((idGroup: string[]) => {
            return Boolean(idGroup.find((_id: string) => _id === id));
        });
        if (groupIndex >= 0) {
            const currentGroup = this._selectedRoutePathIdGroups[groupIndex];
            // Current group if it has only 1 element, otherwise remove id from it
            if (currentGroup.length === 1) {
                this._selectedRoutePathIdGroups.splice(groupIndex, 1);
            } else {
                this._selectedRoutePathIdGroups[groupIndex] = this._selectedRoutePathIdGroups[
                    groupIndex
                ].filter((_id) => _id !== id);
            }
        }
    };

    @action
    public updateRoutePathEndDates = (routePaths: IRoutePath[], value: Date) => {
        routePaths.forEach((rp) => {
            this.updateRoutePathEndDate(rp.internalId, value);
        });
    };

    @action
    public updateRoutePathEndDate = (id: string, newEndDate: Date) => {
        const massEditRpToUpdate = this._massEditRoutePaths?.find((m) => m.id === id)!;
        massEditRpToUpdate.routePath.endDate = newEndDate;
        massEditRpToUpdate.isEndDateSet = true;
        this._massEditRoutePaths = this._massEditRoutePaths!.slice().sort(_sortMassEditRoutePaths);
        this.validateMassEditRoutePaths();
    };

    @action
    public removeRoutePath = (id: string) => {
        const massEditRpRemoveIndex = this._massEditRoutePaths?.findIndex((rp) => rp.id === id)!;
        this._massEditRoutePaths!.splice(massEditRpRemoveIndex, 1);

        this.removeIdFromSelectedRoutePathIdGroups(id);

        if (this._selectedRoutePath?.internalId === id) {
            this._selectedRoutePath = null;
        }

        this.validateMassEditRoutePaths();
        RoutePathLayerListStore.removeRoutePath(id);
    };

    @action
    public separateRoutePath = (id: string) => {
        this.resetMassEditRpDates(id);

        // Add a new selectedRoutePathIdGroup
        this._selectedRoutePathIdGroups = this._selectedRoutePathIdGroups.concat([[id]]);

        // Have to re validate massEditRoutePaths since start and end dates were changed
        this.validateMassEditRoutePaths();
    };

    @action
    public addRoutePathsToCopy = (routePathsToCopy: IRoutePathToCopy[]) => {
        let idCounter = this._newRoutePathIdCounter;
        const routePathsWithNewId: IRoutePath[] = [];
        const newMassEditRoutePaths: IMassEditRoutePath[] = [];
        routePathsToCopy.forEach((rpToCopy) => {
            const newRoutePathId = `new-${idCounter}`;

            const routePathWithNewId: IRoutePath = _.cloneDeep(rpToCopy.routePath);
            routePathWithNewId.internalId = newRoutePathId;
            routePathWithNewId.isVisible = false;
            routePathWithNewId.color = undefined;
            routePathsWithNewId.push(routePathWithNewId);

            const newRoutePath = _.cloneDeep(rpToCopy.routePath);
            const oldRoutePath = _.cloneDeep(rpToCopy.routePath);
            newRoutePath.direction = rpToCopy.direction;
            newRoutePath.internalId = newRoutePathId;
            newRoutePath.routeId = this._routeId!;

            const maxDate = getMaxDate();
            newRoutePath.startDate = _.cloneDeep(maxDate);
            newRoutePath.endDate = _.cloneDeep(maxDate);
            newMassEditRoutePaths.push({
                oldRoutePath,
                id: newRoutePathId,
                routePath: newRoutePath,
                validationResult: {
                    isValid: true,
                },
                isStartDateSet: false,
                isEndDateSet: false,
                isNew: true,
            });
            idCounter += 1;
        });
        RoutePathLayerListStore.addRoutePaths({ routePaths: routePathsWithNewId });

        this._massEditRoutePaths = this._massEditRoutePaths!.concat(newMassEditRoutePaths);
        this._newRoutePathIdCounter = idCounter;
        this.addSelectedRoutePathIdGroup(routePathsWithNewId);

        this.validateMassEditRoutePaths();
    };

    // Expects that routePaths are sorted
    @action
    public validateMassEditRoutePaths = () => {
        this._massEditRoutePaths!.map((currMassEditRp: IMassEditRoutePath, index: number) => {
            if (!currMassEditRp.isStartDateSet) {
                currMassEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Aseta alkupäivämäärä',
                };
                return currMassEditRp;
            }
            if (!currMassEditRp.isEndDateSet) {
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
                nextMassEditRp.routePath.startDate.getTime() <=
                    currMassEditRp.routePath.endDate.getTime()
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
                currMassEditRp.routePath.startDate.getTime() >
                currMassEditRp.routePath.endDate.getTime()
            ) {
                currMassEditRp.validationResult = {
                    isValid: false,
                    errorMessage: 'Alkupäivämäärä on loppupäivämäärän jälkeen.',
                };
                // Display a warning, non continuous routePaths are still valid
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
    public addSelectedRoutePathIdGroup = (routePathsToAdd: IRoutePath[]) => {
        const newRoutePathIdGroup: string[] = [];
        routePathsToAdd.forEach((rpToAdd: IRoutePath) => {
            this.resetMassEditRpDates(rpToAdd.internalId);
            newRoutePathIdGroup.push(rpToAdd.internalId);
        });

        // Add a new selectedRoutePathPair
        this._selectedRoutePathIdGroups = this._selectedRoutePathIdGroups.concat([
            newRoutePathIdGroup,
        ]);

        // Have to re validate massEditRoutePaths since start and end dates were changed
        this.validateMassEditRoutePaths();
    };

    @action
    public resetMassEditRpDates = (routePathId: string) => {
        this.removeIdFromSelectedRoutePathIdGroups(routePathId);

        // Set new routePath's startDate and endDate as max dates
        const massEditRp = this._massEditRoutePaths!.find(
            (massEditRp) => massEditRp.id === routePathId
        );
        const maxDate = getMaxDate();
        maxDate.setDate(maxDate.getDate() + 1);
        massEditRp!.routePath.startDate = _.cloneDeep(maxDate);
        massEditRp!.routePath.endDate = _.cloneDeep(maxDate);
        massEditRp!.isStartDateSet = false;
        massEditRp!.isEndDateSet = false;
    };

    @action
    public clear = () => {
        this.setNavigationAction(false);
        this._selectedRoutePathIdGroups = [];

        // To clear unsaved routePaths, need to remove them from RoutePathLayerListStore
        const routePathsToRemove = this._massEditRoutePaths!.filter((mEditRp) => mEditRp.isNew).map(
            (mEditRp) => mEditRp.routePath
        );
        routePathsToRemove.forEach((rp) => RoutePathLayerListStore.removeRoutePath(rp.internalId));

        this._routeId = null;
        this._massEditRoutePaths = null;

        RouteListStore.setRouteIdToEdit(null);
    };

    private setNavigationAction = (value: boolean) => {
        const action = value ? this.clear : null;
        NavigationStore.setNavigationAction(action);
    };
}

const _getRoutePathDescription = (routePath: IRoutePath) => {
    return `${routePath.originFi} - ${routePath.destinationFi}, ${toDateString(
        routePath.startDate
    )} - ${toDateString(routePath.endDate)}`;
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
    const a = Moment(currentMassEditRp.routePath.startDate);
    const b = Moment(prevMassEditRoutePath.routePath.endDate);
    const diffInDays = a.diff(b, 'days');
    return diffInDays > 1 ? prevMassEditRoutePath.routePath : null;
};

const _sortMassEditRoutePaths = (a: IMassEditRoutePath, b: IMassEditRoutePath) => {
    if (a.routePath.startDate < b.routePath.startDate) return 1;
    if (a.routePath.startDate > b.routePath.startDate) return -1;
    return 0;
};

export default new RoutePathMassEditStore();

export { RoutePathMassEditStore };
