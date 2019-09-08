import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { IRoutePath, IRoutePathLink, IKilpiVia } from '~/models';
import lengthCalculator from '~/util/lengthCalculator';
import INeighborLink from '~/models/INeighborLink';
import GeometryUndoStore from '~/stores/geometryUndoStore';

// Is the neighbor to add either startNode or endNode
export enum NeighborToAddType {
    AfterNode,
    BeforeNode
}

export enum RoutePathViewTab {
    Info,
    List
}

export interface UndoState {
    routePathLinks: IRoutePathLink[];
    isStartNodeUsingBookSchedule: boolean;
    startNodeBookScheduleColumnNumber?: number;
}

export interface IKilpiViaHash {
    [key: string]: IKilpiVia
}

export enum ListFilter {
    stop,
    otherNodes,
    link
}

export class RoutePathStore {
    @observable private _routePath: IRoutePath | null;
    @observable private _oldRoutePath: IRoutePath | null;
    @observable private _neighborRoutePathLinks: INeighborLink[];
    @observable private _neighborToAddType: NeighborToAddType;
    @observable private _highlightedMapItem: string | null;
    @observable private _extendedListItems: string[];
    @observable private _activeTab: RoutePathViewTab;
    @observable private _listFilters: ListFilter[];
    @observable private _invalidLinkOrderNumbers: number[];
    @observable private _kilpiViaNamesHash: IKilpiViaHash;
    @observable private _oldKilpiViaNamesHash: IKilpiViaHash;
    private _geometryUndoStore: GeometryUndoStore<UndoState>;

    constructor() {
        this._neighborRoutePathLinks = [];
        this._highlightedMapItem = null;
        this._extendedListItems = [];
        this._activeTab = RoutePathViewTab.Info;
        this._listFilters = [ListFilter.link];
        this._geometryUndoStore = new GeometryUndoStore();
        this._invalidLinkOrderNumbers = [];
        this._kilpiViaNamesHash = {};
        this._oldKilpiViaNamesHash = {};
    }

    @computed
    get routePath(): IRoutePath | null {
        return this._routePath;
    }

    @computed
    get neighborLinks(): INeighborLink[] {
        return this._neighborRoutePathLinks;
    }

    @computed
    get neighborToAddType(): NeighborToAddType {
        return this._neighborToAddType;
    }

    @computed
    get isDirty() {
      const isViaKilpiDirty = !_.isEqual(this._oldKilpiViaNamesHash, this._kilpiViaNamesHash);
      const isRoutePathDirty = !_.isEqual(this._routePath, this._oldRoutePath);
      return (isRoutePathDirty || isViaKilpiDirty);
    }

    @computed
    get activeTab() {
        return this._activeTab;
    }

    @computed
    get listFilters() {
        return this._listFilters;
    }

    @computed
    get extendedObjects() {
        return this._extendedListItems;
    }

    @computed
    get invalidLinkOrderNumbers() {
        return this._invalidLinkOrderNumbers;
    }

    @computed
    get kilpiViaNamesHash(): IKilpiViaHash {
        return this._kilpiViaNamesHash;
    }

    @computed
    get kilpiViaNames(): IKilpiVia[] {
        const kilpiViaNames: IKilpiVia[] = [];
        const kilpiViaNamesHash = this._kilpiViaNamesHash;
        for (const k in kilpiViaNamesHash) {
          kilpiViaNames.push(kilpiViaNamesHash[k]);
        }
        return kilpiViaNames;
    }

    @action
    public setKilpiViaNamesHash = (kilpiViaNames: IKilpiVia[]) => {
        kilpiViaNames.forEach((kilpiViaName: IKilpiVia) => {
          this._kilpiViaNamesHash[kilpiViaName.relid] = kilpiViaName;
        });
        this.setOldKilpiViaNames(this._kilpiViaNamesHash);
    };

    @action
    public setKilpiViaName = (kilpiViaName: IKilpiVia) => {
      this._kilpiViaNamesHash[kilpiViaName.relid] = kilpiViaName;
    };

    @action
    public setOldKilpiViaNames = (kilpiViaNames: IKilpiViaHash) => {
        this._oldKilpiViaNamesHash = _.cloneDeep(kilpiViaNames);
    };

    @action
    public clearKilpiViaNamesHash = () => {
        this._kilpiViaNamesHash = {};
    };

    @action
    public setActiveTab = (tab: RoutePathViewTab) => {
        this._activeTab = tab;
    };



    @action
    public toggleActiveTab = () => {
        if (this._activeTab === RoutePathViewTab.Info) {
            this._activeTab = RoutePathViewTab.List;
        } else {
            this._activeTab = RoutePathViewTab.Info;
        }
    };

    @action
    public removeListFilter = (listFilter: ListFilter) => {
        if (this._listFilters.includes(listFilter)) {
            this._listFilters = this._listFilters.filter(
                lF => lF !== listFilter
            );
        }
    };

    @action
    public toggleListFilter = (listFilter: ListFilter) => {
        if (this._listFilters.includes(listFilter)) {
            this._listFilters = this._listFilters.filter(
                lF => lF !== listFilter
            );
        } else {
            // Need to do concat (instead of push) to trigger ReactionDisposer watcher
            this._listFilters = this._listFilters.concat([listFilter]);
        }
    };

    @action
    public undo = () => {
        this._geometryUndoStore.undo((nextUndoState: UndoState) => {
            this._neighborRoutePathLinks = [];

            const undoRoutePathLinks = nextUndoState.routePathLinks;
            const oldRoutePathLinks = this._routePath!.routePathLinks;
            // Prevent undo if oldLink is found
            const newRoutePathLinks = undoRoutePathLinks.map(undoRpLink => {
                const oldRpLink = oldRoutePathLinks.find(rpLink => {
                    return rpLink.id === undoRpLink.id;
                });
                if (oldRpLink) {
                    return _.cloneDeep(oldRpLink);
                }
                return undoRpLink;
            });

            this.restoreBookScheduleProperties(nextUndoState);
            this.setRoutePathLinks(newRoutePathLinks);
        });
    };

    @action
    public redo = () => {
        this._geometryUndoStore.redo((previousUndoState: UndoState) => {
            this._neighborRoutePathLinks = [];

            const redoRoutePathLinks = previousUndoState.routePathLinks;
            const oldRoutePathLinks = this._routePath!.routePathLinks;
            // Prevent redo if oldLink is found
            const newRoutePathLinks = redoRoutePathLinks.map(redoRpLink => {
                const oldRpLink = oldRoutePathLinks.find(rpLink => {
                    return rpLink.id === redoRpLink.id;
                });
                if (oldRpLink) {
                    return _.cloneDeep(oldRpLink);
                }
                return redoRpLink;
            });

            this.restoreBookScheduleProperties(previousUndoState);
            this.setRoutePathLinks(newRoutePathLinks);
        });
    };

    @action
    public setHighlightedObject = (objectId: string | null) => {
        this._highlightedMapItem = objectId;
    };

    @action
    public toggleExtendedListItem = (objectId: string) => {
        if (this._extendedListItems.some(o => o === objectId)) {
            this._extendedListItems = this._extendedListItems.filter(
                o => o !== objectId
            );
        } else {
            this._extendedListItems.push(objectId);
        }
    };

    @action
    public setExtendedListItems = (objectIds: string[]) => {
        this._extendedListItems = objectIds;
    };

    @action
    public setRoutePath = (routePath: IRoutePath) => {
        this._routePath = routePath;
        const routePathLinks = routePath.routePathLinks
            ? routePath.routePathLinks
            : [];
        this.setRoutePathLinks(routePathLinks);
        const currentUndoState: UndoState = {
            routePathLinks,
            isStartNodeUsingBookSchedule: Boolean(
                this.routePath!.isStartNodeUsingBookSchedule
            ),
            startNodeBookScheduleColumnNumber: this.routePath!
                .startNodeBookScheduleColumnNumber
        };
        this._geometryUndoStore.addItem(currentUndoState);

        this.setOldRoutePath(this._routePath);
        this.clearKilpiViaNamesHash();
    };

    @action
    public setRoutePathLinks = (routePathLinks: IRoutePathLink[]) => {
        this._routePath!.routePathLinks = routePathLinks;

        // Need to recalculate orderNumbers to ensure that they are correct
        this.recalculateOrderNumbers();
        this.sortRoutePathLinks();
    };

    @action
    public setOldRoutePath = (routePath: IRoutePath) => {
        this._oldRoutePath = _.cloneDeep(routePath);
    };

    @action
    public updateRoutePathProperty = (
        property: keyof IRoutePath | keyof IRoutePathLink,
        value?: string | number | Date | boolean | null
    ) => {
        this._routePath = {
            ...this._routePath!,
            [property]: value
        };
    };

    @action
    public updateRoutePathLinkProperty = (
        orderNumber: number,
        property: keyof IRoutePathLink,
        value: string | number | boolean
    ) => {
        const rpLinkToUpdate:
            | IRoutePathLink
            | undefined = this._routePath!.routePathLinks.find(
            rpLink => rpLink.orderNumber === orderNumber
        );
        rpLinkToUpdate![property] = value;
    };

    @action
    public setLinkFormValidity = (orderNumber: number, isValid: boolean) => {
        if (isValid) {
            this._invalidLinkOrderNumbers = this._invalidLinkOrderNumbers.filter(
                item => item !== orderNumber
            );
        } else {
            if (!this.invalidLinkOrderNumbers.includes(orderNumber)) {
                this.invalidLinkOrderNumbers.push(orderNumber);
            }
        }
    };

    @action
    public setNeighborRoutePathLinks = (neighborLinks: INeighborLink[]) => {
        this._neighborRoutePathLinks = neighborLinks;
    };

    @action
    public setNeighborToAddType = (neighborToAddType: NeighborToAddType) => {
        this._neighborToAddType = neighborToAddType;
    };

    /**
     * Uses given routePathLink's orderNumber to place given routePathLink in the correct position
     * in routePath.routePathLinks array
     */
    @action
    public addLink = (routePathLink: IRoutePathLink) => {
        const rpLinks = this._routePath!.routePathLinks;

        // Need to do splice to trigger ReactionDisposer watcher
        rpLinks.splice(
            // Order numbers start from 1
            routePathLink.orderNumber - 1,
            0,
            routePathLink
        );

        // Copy bookSchedule properties from routePath to last routePathLink
        if (this.isLastRoutePathLink(routePathLink) && rpLinks.length > 1) {
            const routePathLinkToCopyFor = rpLinks[rpLinks.length - 1];
            this.copyPropertyToRoutePathLinkFromRoutePath(
                routePathLinkToCopyFor,
                'isStartNodeUsingBookSchedule'
            );
            this.copyPropertyToRoutePathLinkFromRoutePath(
                routePathLinkToCopyFor,
                'startNodeBookScheduleColumnNumber'
            );
        }

        this.recalculateOrderNumbers();
        this.addCurrentStateToUndoStore();
    };

    @action
    public removeLink = (id: string) => {
        const rpLinks = this._routePath!.routePathLinks;

        const linkToRemoveIndex = rpLinks.findIndex(link => link.id === id);
        const routePathLinkToCopyFor = rpLinks[rpLinks.length - 1];

        // Need to do splice to trigger ReactionDisposer watcher
        rpLinks.splice(linkToRemoveIndex, 1);

        // Copy bookSchedule properties from last routePathLink to routePath
        if (linkToRemoveIndex === this._routePath!.routePathLinks.length) {
            this.copyPropertyToRoutePathFromRoutePathLink(
                routePathLinkToCopyFor,
                'isStartNodeUsingBookSchedule'
            );
            this.copyPropertyToRoutePathFromRoutePathLink(
                routePathLinkToCopyFor,
                'startNodeBookScheduleColumnNumber'
            );
        }

        this.recalculateOrderNumbers();
        this.addCurrentStateToUndoStore();
    };

    @action
    public addCurrentStateToUndoStore() {
        this._neighborRoutePathLinks = [];

        const routePathLinks =
            this._routePath && this._routePath.routePathLinks
                ? this._routePath.routePathLinks
                : [];
        const currentUndoState: UndoState = {
            routePathLinks: _.cloneDeep(routePathLinks),
            isStartNodeUsingBookSchedule: Boolean(
                this._routePath!.isStartNodeUsingBookSchedule
            ),
            startNodeBookScheduleColumnNumber: this._routePath!
                .startNodeBookScheduleColumnNumber
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
    public undoChanges = () => {
        if (this._oldRoutePath) {
            this.setRoutePath(this._oldRoutePath);
        }
    };

    @action
    public clear = () => {
        this._routePath = null;
        this._neighborRoutePathLinks = [];
        this._invalidLinkOrderNumbers = [];
        this._listFilters = [ListFilter.link];
        this._geometryUndoStore.clear();
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

    public isLastRoutePathLink = (routePathLink: IRoutePathLink): boolean => {
        const routePathLinks = this._routePath!.routePathLinks;
        const index = routePathLinks.findIndex(rpLink => {
            return rpLink.id === routePathLink.id;
        });
        return index === routePathLinks.length - 1;
    };

    public isMapItemHighlighted = (objectId: string): boolean => {
        return (
            this._highlightedMapItem === objectId ||
            (!this._highlightedMapItem && this.isListItemExtended(objectId))
        );
    };

    public isListItemExtended = (objectId: string): boolean => {
        return this._extendedListItems.some(n => n === objectId);
    };

    public getCalculatedLength = (): number => {
        if (this.routePath && this.routePath.routePathLinks) {
            return Math.floor(
                lengthCalculator.fromRoutePathLinks(
                    this.routePath!.routePathLinks
                )
            );
        }
        return 0;
    };

    public getLinkGeom = (linkId: string): L.LatLng[] => {
        const link = this._routePath!.routePathLinks.find(l => l.id === linkId);
        if (link) {
            return link.geometry;
        }
        return [];
    };

    public getNodeGeom = (nodeId: string): L.LatLng[] => {
        let node = this._routePath!.routePathLinks.find(
            l => l.startNode.id === nodeId
        );
        if (!node) {
            node = this._routePath!.routePathLinks.find(
                l => l.endNode.id === nodeId
            );
        }
        if (node) {
            return node.geometry;
        }
        return [];
    };

    public hasNodeOddAmountOfNeighbors = (nodeId: string): boolean => {
        const routePath = this.routePath;
        return (
            routePath!.routePathLinks.filter(x => x.startNode.id === nodeId)
                .length !==
            routePath!.routePathLinks.filter(x => x.endNode.id === nodeId)
                .length
        );
    };

    public hasRoutePathLinksChanged = () => {
        const newRoutePathLinks = this.routePath!.routePathLinks;
        const oldRoutePathLinks = this._oldRoutePath!.routePathLinks;
        return !_.isEqual(newRoutePathLinks, oldRoutePathLinks);
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
        const valueToCopy = routePathLink[property];
        this.updateRoutePathProperty(property, valueToCopy);
    };

    // Expects that both routePath and routePathLink have property to copy with the same name
    private copyPropertyToRoutePathLinkFromRoutePath = (
        routePathLink: IRoutePathLink,
        property: keyof IRoutePathLink
    ) => {
        const valueToCopy = this.routePath![property];
        this.updateRoutePathLinkProperty(
            routePathLink.orderNumber,
            property,
            valueToCopy
        );
        this.updateRoutePathProperty(property, null);
    };
}

const observableStoreStore = new RoutePathStore();

export default observableStoreStore;
