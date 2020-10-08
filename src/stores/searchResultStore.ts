import _ from 'lodash';
import { action, computed, observable, reaction } from 'mobx';
import TransitType from '~/enums/transitType';
import RouteFactory from '~/factories/routeFactory';
import { ISearchLine } from '~/models/ILine';
import { ISearchNode } from '~/models/INode';
import IRoute, { ISearchRoute } from '~/models/IRoute';
import NodeUtils from '~/utils/NodeUtils';
import SearchStore from './searchStore';

class SearchResultStore {
    @observable private _allLines: ISearchLine[];
    @observable private _allNodes: ISearchNode[];
    @observable private _filteredLines: ISearchLine[];
    @observable private _filteredNodes: ISearchNode[];
    @observable private _isSearching: boolean;
    private delayTimer: NodeJS.Timeout;

    constructor() {
        this._allLines = [];
        this._allNodes = [];
        this._filteredLines = [];
        this._filteredNodes = [];
        this._isSearching = false;

        reaction(
            () => [
                SearchStore.searchInput,
                SearchStore.selectedTransitTypes,
                SearchStore.isSearchingForLines,
                SearchStore.isSearchingForNodes,
                SearchStore.areInactiveLinesHidden,
            ],
            this.startUpdateTimer
        );
    }

    @computed
    get allLines(): ISearchLine[] {
        return this._allLines;
    }

    @computed
    get allNodes(): ISearchNode[] {
        return this._allNodes;
    }

    @computed
    get isSearching(): boolean {
        return this._isSearching;
    }

    @computed
    get filteredLines(): ISearchLine[] {
        return this._filteredLines;
    }

    @computed
    get filteredNodes(): ISearchNode[] {
        return this._filteredNodes;
    }

    @action
    public setAllLines = (lines: ISearchLine[]) => {
        this._allLines = lines.sort((a, b) => (a.id > b.id ? 1 : -1));
    };

    @action
    public updateSearchLine = (line: ISearchLine) => {
        const existingIndex = this._allLines.findIndex((n) => n.id === line.id);
        if (existingIndex === -1) {
            // Need to do concat (instead of push) to trigger observable reaction
            this._allLines = this._allLines.concat([line]).sort((a, b) => (a.id < b.id ? -1 : 1));
        } else {
            // Update existing line
            this._allLines = this._allLines.map((n) => (n.id === line.id ? line : n));
        }
        this.search();
    };

    @action
    public updateSearchRoute = (lineId: string, route: IRoute) => {
        const searchLineToUpdate = _.cloneDeep(this.allLines.find((line) => line.id === lineId));
        if (!searchLineToUpdate) {
            throw `SearchLine to update was not found by lineId: ${lineId}`;
        }
        const existingIndex = searchLineToUpdate.routes.findIndex((r) => r.id === route.id);
        if (existingIndex === -1) {
            const searchRoute = RouteFactory.createSearchRoute({ route, isUsedByRoutePath: false });
            searchLineToUpdate.routes = searchLineToUpdate.routes
                .concat([searchRoute])
                .sort((a, b) => (a.id < b.id ? -1 : 1));
        } else {
            // Get isUsedByRoutePath from existing searchRoute (we dont want to overwrite that)
            const existingSearchRoute = searchLineToUpdate.routes[existingIndex];
            const searchRoute = RouteFactory.createSearchRoute({
                route,
                isUsedByRoutePath: existingSearchRoute.isUsedByRoutePath,
            });
            // Update existing searchRoute
            searchLineToUpdate.routes = searchLineToUpdate.routes.map((r: ISearchRoute) =>
                r.id === searchRoute.id ? searchRoute : r
            );
        }
        // Update searchLine with new the updated searchRoute
        this._allLines = this._allLines.map((n) => (n.id === lineId ? searchLineToUpdate : n));
        this.search();
    };

    @action
    public setAllSearchNodes = (nodes: ISearchNode[]) => {
        this._allNodes = nodes.sort((a, b) => (a.id > b.id ? 1 : -1));
    };

    @action
    public updateSearchNode = (node: ISearchNode) => {
        const existingIndex = this._allNodes.findIndex((n) => n.id === node.id);
        if (existingIndex === -1) {
            // Need to do concat (instead of push) to trigger observable reaction
            this._allNodes = this._allNodes.concat([node]);
        } else {
            // Update existing node
            this._allNodes = this._allNodes.map((n) => (n.id === node.id ? node : n));
        }
        this.search();
    };

    @action
    public updateSearchNodeStopName = (id: string, stopName: string) => {
        this._allNodes = this.allNodes.map((n) => {
            if (n.id === id) {
                n.stopName = stopName;
                return n;
            }
            return n;
        });
        this.search();
    };

    private matchWildcard(text: string, rule: string) {
        return new RegExp(`^${rule.split('*').join('.*')}$`).test(text);
    }

    private matchText(text: string, searchInput: string) {
        if (searchInput.includes('*')) {
            return this.matchWildcard(text, searchInput);
        }
        return text.includes(searchInput);
    }

    @action
    private startUpdateTimer = () => {
        this._isSearching = true;
        clearTimeout(this.delayTimer);
        this.delayTimer = setTimeout(() => {
            this.search();
        }, 500);
    };

    @action
    private setIsSearching = (isSearching: boolean) => {
        this._isSearching = isSearching;
    };

    @action
    public search = async () => {
        this.setIsSearching(true);
        const searchInput = SearchStore.searchInput.trim();

        if (SearchStore.isSearchingForLines) {
            this._filteredLines = this.getFilteredLines(
                searchInput,
                SearchStore.selectedTransitTypes
            );
        }
        if (SearchStore.isSearchingForNodes) {
            this._filteredNodes = this.getFilteredNodes(searchInput);
        }
        this.setIsSearching(false);
    };

    private getFilteredLines = (
        searchInput: string,
        transitTypes: TransitType[]
    ): ISearchLine[] => {
        const areInactiveLinesHidden = SearchStore.areInactiveLinesHidden;
        return this._allLines.filter((line) => {
            // Filter by route.isUsedByRoutePath
            if (areInactiveLinesHidden) {
                let isLineActive = false;
                line.routes.forEach((route) => {
                    if (route.isUsedByRoutePath) {
                        isLineActive = true;
                        return;
                    }
                });
                if (!isLineActive) return false;
            }

            // Filter by transitType
            if (!transitTypes.includes(line.transitType)) {
                return false;
            }

            // Filter by line.id
            if (this.matchText(line.id, searchInput)) return true;

            // Filter by route.name
            return line.routes
                .map((route) => route.name.toLowerCase())
                .some((name) => this.matchText(name, searchInput.toLowerCase()));
        });
    };

    private getFilteredNodes = (searchInput: string): ISearchNode[] => {
        const trimmedSearchInput = searchInput.toLowerCase();
        return this._allNodes.filter((node) => {
            const shortId = NodeUtils.getShortId(node);
            return (
                this.matchText(node.id, trimmedSearchInput) ||
                (Boolean(shortId) && this.matchText(shortId.toLowerCase(), trimmedSearchInput)) ||
                (Boolean(node.stopName) &&
                    this.matchText(node.stopName!.toLowerCase(), trimmedSearchInput))
            );
        });
    };
}

export default new SearchResultStore();

export { SearchResultStore };
