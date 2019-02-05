import { action, computed, observable } from 'mobx';
import { ILine, INode } from '~/models';

export class SearchResultStore {
    @observable private _allLines: ILine[];
    @observable private _allNodes: INode[];

    constructor() {
        this._allLines = [];
        this._allNodes = [];
    }

    @computed
    get allLines(): ILine[] {
        return this._allLines;
    }

    @computed
    get allNodes(): INode[] {
        return this._allNodes;
    }

    @action
    public setAllLines = (lines: ILine[]) => {
        this._allLines = lines;
    }

    @action
    public setAllNodes = (nodes: INode[]) => {
        this._allNodes = nodes;
    }
}

const observableLineStore = new SearchResultStore();

export default observableLineStore;
