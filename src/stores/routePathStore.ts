import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import ToolbarToolType from '~/enums/toolbarToolType';
import { IRoutePath, IRoutePathLink } from '~/models';
import routePathLinkValidationModel, {
    IRoutePathLinkValidationModel,
} from '~/models/validationModels/routePathLinkValidationModel';
import routePathValidationModel, {
    IRoutePathValidationModel,
} from '~/models/validationModels/routePathValidationModel';
import GeometryUndoStore from '~/stores/geometryUndoStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import { toDateString } from '~/utils/dateUtils';
import { getText } from '~/utils/textUtils';
import { IValidationResult } from '~/validation/FormValidator';
import NavigationStore from './navigationStore';
import RoutePathCopySegmentStore from './routePathCopySegmentStore';
import RoutePathLayerStore from './routePathLayerStore';
import ToolbarStore from './toolbarStore';
import ValidationStore, { ICustomValidatorMap } from './validationStore';

interface UndoState {
    routePathLinks: IRoutePathLink[];
    isStartNodeUsingBookSchedule: boolean;
    startNodeBookScheduleColumnNumber?: number;
}

enum ListFilter {
    stop,
    otherNodes,
    link,
}

interface IRoutePathNodes {
    [nodeId: string]: string;
}

class RoutePathStore {
    @observable private _routePath: IRoutePath | null;
    @observable private _oldRoutePath: IRoutePath | null;
    @observable private _isNewRoutePath: boolean;
    @observable private _existingRoutePaths: IRoutePath[];
    @observable private _listFilters: ListFilter[];
    @observable private _invalidLinkOrderNumbers: number[];
    @observable private _isEditingDisabled: boolean;
    @observable private _selectedTabIndex: number;
    private _routePathNodes: IRoutePathNodes | null;
    private _geometryUndoStore: GeometryUndoStore<UndoState>;
    private _validationStore: ValidationStore<IRoutePath, IRoutePathValidationModel>;
    private _routePathLinkValidationStoreMap: Map<
        string,
        ValidationStore<IRoutePathLink, IRoutePathLinkValidationModel>
    >;

    constructor() {
        this._listFilters = [ListFilter.link];
        this._invalidLinkOrderNumbers = [];
        this._existingRoutePaths = [];
        this._isEditingDisabled = true;
        this._selectedTabIndex = 0;
        this._routePathNodes = null;
        this._geometryUndoStore = new GeometryUndoStore();
        this._validationStore = new ValidationStore();
        this._routePathLinkValidationStoreMap = new Map();

        reaction(
            () => this.isDirty && !this._isEditingDisabled,
            (value: boolean) => NavigationStore.setShouldShowUnsavedChangesPrompt(value)
        );
        reaction(() => this._isEditingDisabled, this.onChangeIsEditingDisabled);
        reaction(
            () => this._routePath && this._routePath.routePathLinks.length,
            _.debounce(() => ToolbarStore.updateDisabledRoutePathToolStatus(), 25)
        );
        reaction(
            () => this.routePath && this.routePath.routePathLinks.length,
            () => this.updateRoutePathNodes()
        );
    }

    @computed
    get routePath(): IRoutePath | null {
        return this._routePath;
    }

    @computed
    get oldRoutePath(): IRoutePath | null {
        return this._oldRoutePath;
    }

    get isNewRoutePath(): boolean {
        return this._isNewRoutePath;
    }

    get existingRoutePaths(): IRoutePath[] {
        return this._existingRoutePaths;
    }

    @computed
    get isDirty() {
        return !_.isEqual(this._routePath, this._oldRoutePath);
    }

    @computed
    get selectedTabIndex() {
        return this._selectedTabIndex;
    }

    @computed
    get listFilters() {
        return this._listFilters;
    }

    @computed
    get invalidLinkOrderNumbers() {
        return this._invalidLinkOrderNumbers;
    }

    @computed
    get invalidPropertiesMap() {
        return this._validationStore.getInvalidPropertiesMap();
    }

    @computed
    get isFormValid() {
        let areRoutePathLinksValid = true;
        this._routePathLinkValidationStoreMap.forEach((rpLinkValidationStore) => {
            if (!rpLinkValidationStore.isValid()) {
                areRoutePathLinksValid = false;
            }
        });
        return this._validationStore.isValid() && areRoutePathLinksValid;
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public init = ({
        routePath,
        isNewRoutePath,
    }: {
        routePath: IRoutePath;
        isNewRoutePath: boolean;
    }) => {
        this.clear();
        this._routePath = _.cloneDeep(routePath);
        this._oldRoutePath = _.cloneDeep(routePath);

        this._isNewRoutePath = isNewRoutePath;
        const routePathLinks = routePath.routePathLinks ? routePath.routePathLinks : [];
        this.initRoutePathLinks(routePathLinks);
        const currentUndoState: UndoState = {
            routePathLinks,
            isStartNodeUsingBookSchedule: Boolean(this.routePath!.isStartNodeUsingBookSchedule),
            startNodeBookScheduleColumnNumber: this.routePath!.startNodeBookScheduleColumnNumber,
        };
        this._geometryUndoStore.addItem(currentUndoState);

        const validateRoutePathPrimaryKey = (routePath: IRoutePath) => {
            if (!this.isNewRoutePath) return;
            if (routePath.startDate.getTime() > routePath.endDate.getTime()) {
                const validationResult: IValidationResult = {
                    isValid: false,
                    errorMessage:
                        'Reitinsuunnan loppupäivämäärän täytyy olla alkupäivämäärän jälkeen.',
                };
                return validationResult;
            }

            const isPrimaryKeyDuplicated = this._existingRoutePaths.some(
                (rp) =>
                    routePath.routeId === rp.routeId &&
                    routePath.direction === rp.direction &&
                    routePath.startDate.getTime() === rp.startDate.getTime()
            );

            if (isPrimaryKeyDuplicated) {
                const validationResult: IValidationResult = {
                    isValid: false,
                    errorMessage:
                        'Reitinsuunta samalla reitillä, suunnalla ja alkupäivämäärällä on jo olemassa.',
                };
                return validationResult;
            }

            let validationResult: IValidationResult | null = null;
            this._existingRoutePaths.forEach((existingRp) => {
                if (routePath.direction !== existingRp.direction) return;
                if (
                    _areDateRangesOverlapping({
                        startDate1: routePath.startDate,
                        endDate1: routePath.endDate,
                        startDate2: existingRp.startDate,
                        endDate2: existingRp.endDate,
                    })
                ) {
                    validationResult = {
                        isValid: false,
                        errorMessage: `Päällekkäisyys olemassa olevan reitinsuunnan kanssa: suunta ${
                            existingRp.direction
                        } | ${toDateString(existingRp.startDate)} - ${toDateString(
                            existingRp.endDate
                        )}.`,
                    };
                }
            });
            if (validationResult) return validationResult;

            return {
                isValid: true,
            };
        };

        const customValidatorMap: ICustomValidatorMap = {
            // New property to routePath for validating routePathPrimaryKey to validate primary key only once and get that validation result into a single place
            routePathPrimaryKey: {
                validators: [validateRoutePathPrimaryKey],
            },
            direction: {
                validators: [],
                dependentProperties: ['routePathPrimaryKey'],
            },
            startDate: {
                validators: [],
                dependentProperties: ['routePathPrimaryKey'],
            },
            endDate: {
                validators: [],
                dependentProperties: ['routePathPrimaryKey'],
            },
        };
        this._validationStore.init(this._routePath, routePathValidationModel, customValidatorMap);
    };

    @action
    public initRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        this._routePath!.routePathLinks = routePathLinks;

        // Need to recalculate orderNumbers to ensure that they are correct
        this.recalculateOrderNumbers();
        this.sortRoutePathLinks();

        // Need to reinitialize routePathLinkValidationStore
        this._routePathLinkValidationStoreMap.clear();
        this._routePath!.routePathLinks.forEach((rpLink) =>
            this.initRoutePathLinkValidationStore(rpLink)
        );
        this.updateRoutePathNodes();
    };

    @action
    public setIsNewRoutePath = (isNewRoutePath: boolean) => {
        this._isNewRoutePath = isNewRoutePath;
    };

    @action
    public setExistingRoutePaths = (existingRoutePaths: IRoutePath[]) => {
        this._existingRoutePaths = existingRoutePaths;
    };

    @action
    public setSelectedTabIndex = (index: number) => {
        this._selectedTabIndex = index;
    };

    @action
    public removeListFilter = (listFilter: ListFilter) => {
        if (this._listFilters.includes(listFilter)) {
            this._listFilters = this._listFilters.filter((lF) => lF !== listFilter);
        }
    };

    @action
    public toggleListFilter = (listFilter: ListFilter) => {
        if (this._listFilters.includes(listFilter)) {
            this._listFilters = this._listFilters.filter((lF) => lF !== listFilter);
        } else {
            // Need to do concat (instead of push) to trigger observable reaction
            this._listFilters = this._listFilters.concat([listFilter]);
        }
    };

    @action
    public undo = () => {
        this._geometryUndoStore.undo((nextUndoState: UndoState) => {
            RoutePathLayerStore.setNeighborLinks([]);

            const undoRoutePathLinks = nextUndoState.routePathLinks;
            const oldRoutePathLinks = this._routePath!.routePathLinks;
            // Prevent undo if oldLink is found
            const newRoutePathLinks = undoRoutePathLinks.map((undoRpLink) => {
                const oldRpLink = oldRoutePathLinks.find((rpLink) => {
                    return rpLink.id === undoRpLink.id;
                });
                if (oldRpLink) {
                    return _.cloneDeep(oldRpLink);
                }
                return undoRpLink;
            });

            this.restoreBookScheduleProperties(nextUndoState);
            this.initRoutePathLinks(newRoutePathLinks);
        });
    };

    @action
    public redo = () => {
        this._geometryUndoStore.redo((previousUndoState: UndoState) => {
            RoutePathLayerStore.setNeighborLinks([]);

            const redoRoutePathLinks = previousUndoState.routePathLinks;
            const oldRoutePathLinks = this._routePath!.routePathLinks;
            // Prevent redo if oldLink is found
            const newRoutePathLinks = redoRoutePathLinks.map((redoRpLink) => {
                const oldRpLink = oldRoutePathLinks.find((rpLink) => {
                    return rpLink.id === redoRpLink.id;
                });
                if (oldRpLink) {
                    return _.cloneDeep(oldRpLink);
                }
                return redoRpLink;
            });

            this.restoreBookScheduleProperties(previousUndoState);
            this.initRoutePathLinks(newRoutePathLinks);
        });
    };

    @action
    public updateRoutePathProperty = (
        property: keyof IRoutePath | keyof IRoutePathLink,
        value?: string | number | Date | boolean | null
    ) => {
        this._routePath![property] = value;
        this._validationStore.updateProperty(property, value);
    };

    @action
    public updateRoutePathLinkProperty = (
        orderNumber: number,
        property: keyof IRoutePathLink,
        value: string | number | boolean
    ) => {
        const rpLinkToUpdate: IRoutePathLink | undefined = this._routePath!.routePathLinks.find(
            (rpLink) => rpLink.orderNumber === orderNumber
        );
        // As any to fix typing error: Type 'string' is not assignable to type 'never'
        (rpLinkToUpdate as any)[property] = value;
        this._routePathLinkValidationStoreMap
            .get(rpLinkToUpdate!.id)
            ?.updateProperty(property, value);
    };

    /**
     * Uses given routePathLink's orderNumber to place given routePathLink in the correct position
     * in routePath.routePathLinks array
     */
    @action
    public addLink = ({ routePathLink }: { routePathLink: IRoutePathLink }) => {
        const rpLinkToAdd = _.cloneDeep(routePathLink);
        const rpLinks = this._routePath!.routePathLinks;
        const rpLinkToAddClone = _.cloneDeep(rpLinkToAdd);
        // Need to do splice to trigger ReactionDisposer watcher
        rpLinks.splice(
            // Order numbers start from 1
            rpLinkToAdd.orderNumber - 1,
            0,
            rpLinkToAdd
        );

        /**
         * Last routePathLinkNode's book schedule data is stored at routePath (this is because of routePathLinkNode model is missing in jore)
         *
         * Example of adding rp link to the end of rpLink list
         * 1. node <- data stored at routePathLink
         * link
         * 2. node <- data stored at routePath
         *
         * after a link is added (to the end of routePath)
         * 1. node
         * link
         * 2. node <- data at routePathLink (data copied from routePath to this link)
         * link
         * 3. node <- data at routePath (from new link)
         *
         * Adding to the end of routePathList
         * rpLinkToAddClone = rpLinkToAdd
         * <add rpLink to the end of the list>
         * lastRpLink.data = routePath.data
         * routePath.data = rpLinkToAddClone.data
         */
        if (this.isLastRoutePathLink(rpLinkToAdd) && rpLinks.length > 1) {
            const lastRpLink = rpLinks[rpLinks.length - 1];
            this.copyPropertyToRoutePathLinkFromRoutePath(
                lastRpLink,
                'isStartNodeUsingBookSchedule'
            );
            this.copyPropertyToRoutePathLinkFromRoutePath(
                lastRpLink,
                'startNodeBookScheduleColumnNumber'
            );
            this.copyPropertyToRoutePathFromRoutePathLink(
                rpLinkToAddClone,
                'isStartNodeUsingBookSchedule'
            );
            this.copyPropertyToRoutePathFromRoutePathLink(
                rpLinkToAddClone,
                'startNodeBookScheduleColumnNumber'
            );
        }

        this.recalculateOrderNumbers();
        this.addCurrentStateToUndoStore();

        this.initRoutePathLinkValidationStore(rpLinkToAdd);
    };

    // Same as addLink() but doesnt support cloning routePath's bookSchedule properties.
    // TODO: if needed, copy those bookSchedule properties from segment's routePath if segment to copy ends into routePath's last node
    @action
    public cloneLink = ({ routePathLink }: { routePathLink: IRoutePathLink }) => {
        const rpLinkToAdd = _.cloneDeep(routePathLink);
        const rpLinks = this._routePath!.routePathLinks;
        // Need to do splice to trigger ReactionDisposer watcher
        rpLinks.splice(
            // Order numbers start from 1
            rpLinkToAdd.orderNumber - 1,
            0,
            rpLinkToAdd
        );

        this.recalculateOrderNumbers();
        this.addCurrentStateToUndoStore();

        this.initRoutePathLinkValidationStore(rpLinkToAdd);
    };

    @action
    public removeLink = (id: string) => {
        const rpLinks = this._routePath!.routePathLinks;

        const linkToRemoveIndex = rpLinks.findIndex((link) => link.id === id);

        /**
         * Last routePathLinkNode's book schedule data is stored at routePath (this is because of routePathLinkNode model is missing in jore)
         *
         * Example of adding rp link to the end of rpLink list
         * 1. node <- data stored at routePathLink
         * link
         * 2. node <- data stored at routePath
         *
         * after a link is removed
         * 1. node <- data stored at routePath (data from rpLink was copied into routePath)
         *
         * Last routePath link removal
         * routePath.data = last rpLink.data
         * <remove last link>
         */
        if (linkToRemoveIndex === rpLinks.length - 1) {
            const rpLinkToRemoveClone = _.cloneDeep(rpLinks[rpLinks.length - 1]);

            this.copyPropertyToRoutePathFromRoutePathLink(
                rpLinkToRemoveClone,
                'isStartNodeUsingBookSchedule'
            );
            this.copyPropertyToRoutePathFromRoutePathLink(
                rpLinkToRemoveClone,
                'startNodeBookScheduleColumnNumber'
            );
        }

        // Need to do splice to trigger ReactionDisposer watcher
        rpLinks.splice(linkToRemoveIndex, 1);

        this.recalculateOrderNumbers();
        this.addCurrentStateToUndoStore();

        this._routePathLinkValidationStoreMap.delete(id);
    };

    @action
    public addCurrentStateToUndoStore() {
        RoutePathLayerStore.setNeighborLinks([]);

        const routePathLinks =
            this._routePath && this._routePath.routePathLinks ? this._routePath.routePathLinks : [];
        const currentUndoState: UndoState = {
            routePathLinks: _.cloneDeep(routePathLinks),
            isStartNodeUsingBookSchedule: Boolean(this._routePath!.isStartNodeUsingBookSchedule),
            startNodeBookScheduleColumnNumber: this._routePath!.startNodeBookScheduleColumnNumber,
        };
        this._geometryUndoStore.addItem(currentUndoState);
    }

    @action
    public sortRoutePathLinks = () => {
        this._routePath!.routePathLinks = this._routePath!.routePathLinks.slice().sort(
            (a, b) => a.orderNumber - b.orderNumber
        );
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._routePath = null;
        this._oldRoutePath = null;
        this._invalidLinkOrderNumbers = [];
        this._routePathNodes = null;
        this._listFilters = [ListFilter.link];
        this._geometryUndoStore.clear();
        this._validationStore.clear();
        this._routePathLinkValidationStoreMap = new Map();
        RoutePathLayerStore.clear();
    };

    @action
    public resetChanges = () => {
        if (this.isDirty && this._oldRoutePath) {
            this.init({ routePath: this._oldRoutePath, isNewRoutePath: this._isNewRoutePath });
        }
        RoutePathCopySegmentStore.clear();
    };

    @action
    private restoreBookScheduleProperties(undoState: UndoState) {
        this.updateRoutePathProperty(
            'isStartNodeUsingBookSchedule',
            undoState.isStartNodeUsingBookSchedule
        );
        this.updateRoutePathProperty(
            'startNodeBookScheduleColumnNumber',
            undoState.startNodeBookScheduleColumnNumber
        );
    }

    @action
    private updateRoutePathNodes = () => {
        const routePathNodes: IRoutePathNodes = {};
        if (!this.routePath) return;
        this.routePath.routePathLinks.forEach((rpLink) => {
            routePathNodes[rpLink.startNode.id] = rpLink.startNode.id;
            routePathNodes[rpLink.endNode.id] = rpLink.endNode.id;
        });
        this._routePathNodes = routePathNodes;
    };

    public getSavePreventedText = (): string => {
        const routePathLinks = this.routePath!.routePathLinks;
        if (this.isEditingDisabled) {
            return getText('routePath_savePrevented_isEditingDisabled');
        }
        if (routePathLinks.length === 0) {
            return getText('routePath_savePrevented_routePathLinksMissing');
        }
        if (!RoutePathUtils.validateRoutePathLinkCoherency(routePathLinks)) {
            return getText('routePath_savePrevented_geometryInvalid');
        }
        const stopIdAppearingTwice = RoutePathUtils.getStopIdThatAppearsTwice(routePathLinks);
        if (stopIdAppearingTwice) {
            return getText('routePath_savePrevented_stopAppearingTwice', {
                stopId: stopIdAppearingTwice,
            });
        }
        if (RoutePathUtils.isRoutePathStartNodeTheSameAsEndNode(routePathLinks)) {
            return getText('routePath_savePrevented_startNodeTheSameAsEndNode');
        }
        if (!this.isFormValid) {
            return getText('routePath_savePrevented_checkRoutePathInfoTab');
        }
        if (!this.isDirty) {
            return getText('savePrevented_isNotDirty');
        }
        return '';
    };

    public getRoutePathLinkInvalidPropertiesMap = (id: string) => {
        return this._routePathLinkValidationStoreMap.get(id)!.getInvalidPropertiesMap();
    };

    public isLastRoutePathLink = (routePathLink: IRoutePathLink): boolean => {
        const routePathLinks = this._routePath!.routePathLinks;
        const index = routePathLinks.findIndex((rpLink) => {
            return rpLink.id === routePathLink.id;
        });
        return index === routePathLinks.length - 1;
    };

    public getLinkGeom = (linkId: string): L.LatLng[] => {
        const link = this._routePath!.routePathLinks.find((l) => l.id === linkId);
        if (link) {
            return link.geometry;
        }
        return [];
    };

    public getNodeGeom = (nodeId: string): L.LatLng[] => {
        let node = this._routePath!.routePathLinks.find((l) => l.startNode.id === nodeId);
        if (!node) {
            node = this._routePath!.routePathLinks.find((l) => l.endNode.id === nodeId);
        }
        if (node) {
            return node.geometry;
        }
        return [];
    };

    // O(1) way to know if node is found or not
    public isNodeFound = (nodeId: string): Boolean => {
        if (!this._routePathNodes) return false;
        return Boolean(this._routePathNodes[nodeId] !== undefined);
    };

    public hasNodeOddAmountOfNeighbors = (nodeInternalId: string): boolean => {
        const routePath = this.routePath;
        return (
            routePath!.routePathLinks.filter((x) => x.startNode.internalId === nodeInternalId)
                .length !==
            routePath!.routePathLinks.filter((x) => x.endNode.internalId === nodeInternalId).length
        );
    };

    private initRoutePathLinkValidationStore = (routePathLink: IRoutePathLink) => {
        this._routePathLinkValidationStoreMap.set(routePathLink.id, new ValidationStore());
        this._routePathLinkValidationStoreMap
            .get(routePathLink.id)!
            .init(routePathLink, routePathLinkValidationModel);
    };

    private recalculateOrderNumbers = () => {
        this._routePath!.routePathLinks.forEach((rpLink, index) => {
            // Order numbers start from 1
            rpLink.orderNumber = index + 1;
        });
    };

    // Expects that both routePath and routePathLink have property to copy with the same name
    private copyPropertyToRoutePathFromRoutePathLink = (
        routePathLink: IRoutePathLink,
        property: keyof IRoutePathLink | keyof IRoutePath
    ) => {
        const valueToCopy = _.cloneDeep(routePathLink[property]);
        this.updateRoutePathProperty(property, valueToCopy);
    };

    // Expects that both routePath and routePathLink have property to copy with the same name
    private copyPropertyToRoutePathLinkFromRoutePath = (
        routePathLink: IRoutePathLink,
        property: keyof IRoutePathLink
    ) => {
        const valueToCopy = _.cloneDeep(this.routePath![property]);
        this.updateRoutePathLinkProperty(routePathLink.orderNumber, property, valueToCopy);
        this.updateRoutePathProperty(property, null);
    };

    private onChangeIsEditingDisabled = () => {
        if (this._isEditingDisabled) {
            this.resetChanges();
            const selectedTool = ToolbarStore.selectedTool;
            if (
                selectedTool &&
                (selectedTool.toolType === ToolbarToolType.ExtendRoutePath ||
                    selectedTool.toolType === ToolbarToolType.RemoveRoutePathLink ||
                    selectedTool.toolType === ToolbarToolType.CopyRoutePathSegment)
            ) {
                ToolbarStore.selectDefaultTool();
            }
        } else {
            this._validationStore.validateAllProperties();
        }
    };
}

const _areDateRangesOverlapping = ({
    startDate1,
    endDate1,
    startDate2,
    endDate2,
}: {
    startDate1: Date;
    endDate1: Date;
    startDate2: Date;
    endDate2: Date;
}) => {
    // Date1 range is before date2 range
    if (startDate1.getTime() < startDate2.getTime()) {
        if (endDate1.getTime() < startDate2.getTime()) {
            return false;
        }
        return true;
    }
    // Date1 range is after date2 range
    if (startDate1.getTime() > startDate2.getTime()) {
        if (endDate2.getTime() < startDate1.getTime()) {
            return false;
        }
        return true;
    }
    return true;
};

export default new RoutePathStore();

export { RoutePathStore, UndoState, ListFilter };
