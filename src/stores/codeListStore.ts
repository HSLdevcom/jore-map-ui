import { observable, action } from 'mobx';
import ICodeListItem from '~/models/ICodeListItem';

export type codeListName =
  'Joukkoliikennelaji' |
  'Tilaajaorganisaatio' |
  'Verkko' |
  'Joukkoliikennekohde' |
  'LinjanKorvaavaTyyppi' |
  'Kyllä/Ei' |
  'Solmutyyppi (P/E)' |
  'Kunta (ris/pys)' |
  'Lyhyttunnus' |
  'Suunta';

export class CodeListStore {
    @observable private _codeListItems: ICodeListItem[];

    constructor() {
        this._codeListItems = [];
    }

    @action
    public setCodeListItems(codeListItems: ICodeListItem[]) {
        this._codeListItems = codeListItems;
    }

    public getCodeList = (codeListName: codeListName): ICodeListItem[] => {
        return this._codeListItems
            .filter(item => item.listId === codeListName)
            .sort((a, b) => a.orderNumber - b.orderNumber);
    }

    public getCodeListLabel = (codeListName: codeListName, value: string) => {
        const item = this._codeListItems
            .find(item => item.listId === codeListName && item.value === value);
        return item ? item.label : '';
    }
}

const observableCodeListStore = new CodeListStore();

export default observableCodeListStore;
