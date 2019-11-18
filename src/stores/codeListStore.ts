import { action, observable } from 'mobx';
import { IDropdownItem } from '~/components/controls/Dropdown';
import ICodeListItem from '~/models/ICodeListItem';

export type codeListName =
    | 'Joukkoliikennelaji'
    | 'Tilaajaorganisaatio'
    | 'Verkko'
    | 'Joukkoliikennekohde'
    | 'LinjanKorvaavaTyyppi'
    | 'Kyllä/Ei'
    | 'Solmutyyppi (P/E)'
    | 'Kunta (KELA)'
    | 'Lyhyttunnus'
    | 'Suunta'
    | 'Ajantasaus pysakki'
    | 'Pysäkin käyttö'
    | 'Pysäkkialueid';

export class CodeListStore {
    @observable private _codeListItems: ICodeListItem[];

    constructor() {
        this._codeListItems = [];
    }

    @action
    public setCodeListItems(codeListItems: ICodeListItem[]) {
        this._codeListItems = codeListItems;
    }

    public getDropdownItemList = (codeListName: codeListName): IDropdownItem[] => {
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

    // TODO: rename as getCodeListValueLabel?
    public getCodeListLabel = (codeListName: codeListName, value: string) => {
        const item = this._codeListItems.find(
            item => item.listId === codeListName && item.value === value
        );
        return item ? item.label : '';
    };
}

const observableCodeListStore = new CodeListStore();

export default observableCodeListStore;
