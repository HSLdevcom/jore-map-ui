import { action, computed, observable } from 'mobx';
import { INode } from '~/models';

export class PopupStore {
    @observable private _node: INode | null;

    constructor() {
        this._node = null;
    }

    @computed
    get popupNode(): INode | null {
        return this._node;
    }

    @action
    public showPopup = (node: INode) => {
        this._node = node;
    };

    @action
    public closePopup = () => {
        this._node = null;
    };
}

const observablePopupStore = new PopupStore();

export default observablePopupStore;
