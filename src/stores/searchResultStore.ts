import { action, computed, observable } from 'mobx';
import { ILine } from '~/models';
import INodeBase from '~/models/baseModels/INodeBase';
import TransitType from '~/enums/transitType';
import SearchStore from './searchStore';

export class SearchResultStore {
    @observable private _allLines: ILine[];
    @observable private _allNodes: INodeBase[];

    constructor() {
        this._allLines = [];
        this._allNodes = [];
    }

    @computed
    get allLines(): ILine[] {
        return this._allLines;
    }

    @computed
    get allNodes(): INodeBase[] {
        return this._allNodes;
    }

    @action
    public setAllLines = (lines: ILine[]) => {
        this._allLines = lines;
    }

    @action
    public setAllNodes = (nodes: INodeBase[]) => {
        this._allNodes = nodes;
    }

    private getFilteredLines = (searchInput: string, transitTypes: TransitType[]) => {
        return this._allLines.filter((line) => {
            // Filter by transitType
            if (!transitTypes.includes(line.transitType)) {
                return false;
            }

            // Filter by line.id
            if (line.id.indexOf(searchInput) > -1) return true;

            // Filter by route.name
            return line.routes
                .map(route => route.name.toLowerCase())
                .some(name => name.indexOf(searchInput) > -1);
        });
    }

    private getFilteredNodes = (searchInput: string) => {
        return this._allNodes.filter((node) => {
            return node.id.indexOf(searchInput) > -1
                || (
                    Boolean(node.shortId)
                    && node.shortId!.indexOf(searchInput) > -1
                );
        });
    }

    public getFilteredItems = (): (INodeBase | ILine)[] => {
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

        list = list.sort((a, b) => a.id > b.id ? 1 : -1);

        return list;
    }
}

const observableLineStore = new SearchResultStore();

export default observableLineStore;
