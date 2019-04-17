import { action, computed, observable } from 'mobx';

export class ConfirmStore {
    @observable private _content: React.ReactNode;
    private _onConfirm: null | (() => void);
    private _onCancel: null | (() => void);

    constructor() {
        this._content = null;
    }

    @computed
    get message() {
        return this._content;
    }

    @computed
    get isConfirmOpen(): boolean {
        return this._content !== null;
    }

    @action
    public openConfirm = (
        message: React.ReactNode,
        onConfirm: () => void,
        onCancel?: () => void,
    ) => {
        this._content = message;
        this._onConfirm = onConfirm;
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
    }
}

const observableAlertStore = new ConfirmStore();

export default observableAlertStore;
