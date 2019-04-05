import { observable, action } from 'mobx';
import ICodeListItem from '~/models/ICodeListItem';
import { IDropdownItem } from '~/components/controls/Dropdown';

type codeListIdentifier =
  'Joukkoliikennelaji' |
  'Kyllä/Ei' |
  'Solmutyyppi (P/E)' |
  'Kunta (ris/pys)' |
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

    public getDropdownItems = (identifier: codeListIdentifier): IDropdownItem[] => {
        return this._codeListItems
            .filter(item => item.listId === identifier)
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .map(item => ({
                label: item.label,
                value: item.value,
            }));
    }

    public getCodeListLabel = (identifier: codeListIdentifier, value: string) => {
        const item = this._codeListItems
            .find(item => item.listId === identifier && item.value === value);
        return item ? item.label : '';
    }
}

const observableCodeListStore = new CodeListStore();

export default observableCodeListStore;
