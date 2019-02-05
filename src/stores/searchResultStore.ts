import { action, computed, observable } from 'mobx';
import { ILine } from '~/models';
import INodeBase from '~/models/baseModels/INodeBase';

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
}

const observableLineStore = new SearchResultStore();

export default observableLineStore;
