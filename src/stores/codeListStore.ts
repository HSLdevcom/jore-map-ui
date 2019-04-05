import { observable, action } from 'mobx';
import ICodeListItem from '~/models/ICodeListItem';

type codeListIdentifiers = 'Joukkoliikennelaji';

export class CodeListStore {
    @observable private _codeListItems: ICodeListItem[];

    constructor() {
        this._codeListItems = [];
    }

    @action
    public setCodeListItems(codeListItems: ICodeListItem[]) {
        this._codeListItems = codeListItems;
    }

    public getCodeListItems = (identifier: codeListIdentifiers) => {
        return this._codeListItems
          .filter(item => item.listId === identifier);
    }
}

const observableCodeListStore = new CodeListStore();

export default observableCodeListStore;
