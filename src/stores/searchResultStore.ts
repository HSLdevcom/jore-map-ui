import { action, computed, observable, reaction } from 'mobx';
import TransitType from '~/enums/transitType';
import { ISearchLine } from '~/models/ILine';
import { INodeBase } from '~/models/INode';
import NodeUtils from '~/utils/NodeUtils';
import SearchStore from './searchStore';

class SearchResultStore {
    @observable private _allLines: ISearchLine[];
    @observable private _allNodes: INodeBase[];
    @observable private _filteredLines: ISearchLine[];
    @observable private _filteredNodes: INodeBase[];
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
    get allNodes(): INodeBase[] {
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
    get filteredNodes(): INodeBase[] {
        return this._filteredNodes;
    }

    @action
    public setAllLines = (lines: ISearchLine[]) => {
        this._allLines = lines.sort((a, b) => (a.id > b.id ? 1 : -1));
    };

    @action
    public setAllNodes = (nodes: INodeBase[]) => {
        this._allNodes = nodes.sort((a, b) => (a.id > b.id ? 1 : -1));
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

    private getFilteredLines = (searchInput: string, transitTypes: TransitType[]) => {
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

    private getFilteredNodes = (searchInput: string) => {
        return this._allNodes.filter((node) => {
            const shortId = NodeUtils.getShortId(node);
            return (
                this.matchText(node.id, searchInput) ||
                (Boolean(shortId) && this.matchText(shortId, searchInput))
            );
        });
    };
}

export default new SearchResultStore();

export { SearchResultStore };
