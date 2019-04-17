import { action, computed, observable } from 'mobx';

export class ConfirmStore {
    private _content: React.ReactNode;
    @observable private _isOpen: boolean;
    private _onConfirm: null | (() => void);
    private _onCancel: null | (() => void);

    constructor() {
        this._content = null;
        this._isOpen = false;
    }

    @computed
    get message() {
        return this._content;
    }

    @computed
    get isConfirmOpen(): boolean {
        return this._isOpen;
    }

    @action
    public openConfirm = (
        message: React.ReactNode,
        onConfirm: () => void,
        onCancel?: () => void,
    ) => {
        this._content = message;
        this._onConfirm = onConfirm;
        this._isOpen = true;
        if (onCancel) {
            this._onCancel = onCancel;
        }
    }

    @action
    public cancel = () => {
        if (this._onCancel) {
            this._onCancel();
        }
        this.clear();
    }

    @action
    public confirm = () => {
        if (this._onConfirm) {
            this._onConfirm();
        }
        this.clear();
    }

    @action
    private clear = () => {
        this._content = null;
        this._onCancel = null;
        this._onConfirm = null;
        this._isOpen = false;
    }
}

const observableAlertStore = new ConfirmStore();

export default observableAlertStore;
