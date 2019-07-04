import { observable, action } from 'mobx';
import ICodeListItem from '~/models/ICodeListItem';
import { IDropdownItem } from '~/components/controls/Dropdown';

export type codeListName =
    | 'Joukkoliikennelaji'
    | 'Tilaajaorganisaatio'
    | 'Verkko'
    | 'Joukkoliikennekohde'
    | 'LinjanKorvaavaTyyppi'
    | 'Kyllä/Ei'
    | 'Solmutyyppi (P/E)'
    | 'Kunta (ris/pys)'
    | 'Lyhyttunnus'
    | 'Suunta'
    | 'Ajantasaus pysakki'
    | 'Pysäkin käyttö';

export class CodeListStore {
    @observable private _codeListItems: ICodeListItem[];

    constructor() {
        this._codeListItems = [];
    }

    @action
    public setCodeListItems(codeListItems: ICodeListItem[]) {
        this._codeListItems = codeListItems;
    }

    public getDropdownItemList = (
        codeListName: codeListName
    ): IDropdownItem[] => {
        return this._codeListItems
            .filter(item => item.listId === codeListName)
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .map((codeListItem: ICodeListItem) => {
                return {
                    value: codeListItem.value,
                    label: codeListItem.label
                };
            });
    };

    public getCodeListLabel = (codeListName: codeListName, value: string) => {
        const item = this._codeListItems.find(
            item => item.listId === codeListName && item.value === value
        );
        return item ? item.label : '';
    };
}

const observableCodeListStore = new CodeListStore();

export default observableCodeListStore;
