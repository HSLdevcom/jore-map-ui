import { action, computed, observable, reaction } from 'mobx';
import { ILine } from '~/models';
import INodeBase from '~/models/baseModels/INodeBase';
import TransitType from '~/enums/transitType';
import SearchStore from './searchStore';

export class SearchResultStore {
    @observable private _allLines: ILine[];
    @observable private _allNodes: INodeBase[];
    @observable private _filteredItems: (INodeBase | ILine)[];
    private delayTimer: NodeJS.Timeout;

    constructor() {
        this._allLines = [];
        this._allNodes = [];
        this._filteredItems = [];

        reaction(
            () => SearchStore.searchInput,
            this.startUpdateTimer,
        );
        reaction(
            () => SearchStore.selectedTransitTypes,
            this.startUpdateTimer,
        );
    }

    @computed
    get allLines(): ILine[] {
        return this._allLines;
    }

    @computed
    get allNodes(): INodeBase[] {
        return this._allNodes;
    }

    @computed
    get filteredItems(): (INodeBase | ILine)[] {
        return this._filteredItems;
    }

    @action
    public setAllLines = (lines: ILine[]) => {
        this._allLines = lines;
    }

    @action
    public setAllNodes = (nodes: INodeBase[]) => {
        this._allNodes = nodes;
    }

    private matchWildcard(text: string, rule: string) {
        return new RegExp(`^${rule.split('*').join('.*')}$`).test(text);
    }

    private matchText(text: string, rule: string) {
        if (rule.includes('*')) {
            return this.matchWildcard(text, rule);
        }
        return text.includes(rule);
    }

    private startUpdateTimer = () => {
        clearTimeout(this.delayTimer);
        this.delayTimer = setTimeout(
            () => {
                this.search();
            },
            500,
        );
    }

    @action
    public search = () => {
        const searchInput = SearchStore.searchInput;

        let list: (INodeBase | ILine)[] = [];
        if (SearchStore.isSearchingForLines) {
            const lines = this.getFilteredLines(
                searchInput,
                SearchStore.selectedTransitTypes,
            );
            list = [
                ...list,
                ...lines,
            ];
        }
        if (SearchStore.isSearchingForNodes) {
            const nodes = this.getFilteredNodes(searchInput);
            list = [
                ...list,
                ...nodes,
            ];
        }

        this._filteredItems = list.sort((a, b) => a.id > b.id ? 1 : -1);
    }

    private getFilteredLines = (searchInput: string, transitTypes: TransitType[]) => {
        return this._allLines.filter((line) => {
            // Filter by transitType
            if (!transitTypes.includes(line.transitType)) {
                return false;
            }

            // Filter by line.id
            if (this.matchText(line.id, searchInput)) return true;

            // Filter by route.name
            return line.routes
                .map(route => route.name.toLowerCase())
                .some(name => this.matchText(name, searchInput.toLowerCase()));
        });
    }

    private getFilteredNodes = (searchInput: string) => {
        return this._allNodes.filter((node) => {
            return this.matchText(node.id, searchInput)
                || (
                    Boolean(node.shortId)
                        && this.matchText(node.shortId!, searchInput)
                );
        });
    }
}

const observableLineStore = new SearchResultStore();

export default observableLineStore;
