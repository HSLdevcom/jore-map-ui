import { action, computed, observable } from 'mobx';

const DEFAULT_CONFIRM_BUTTON_TEXT = 'Hyväksy';
const DEFAULT_CANCEL_BUTTON_TEXT = 'Peruuta';

export class ConfirmStore {
    private _content: React.ReactNode;
    @observable private _isOpen: boolean;
    private _onConfirm: null | (() => void);
    private _onCancel: null | (() => void);
    private _confirmButtonText: string | null;
    private _cancelButtonText: string | null;
    private _confirmNotification: string | null;

    constructor() {
        this._content = null;
        this._isOpen = false;
    }

    @computed
    get content() {
        return this._content;
    }

    @computed
    get confirmButtonText(): string | null {
        return this._confirmButtonText;
    }

    @computed
    get cancelButtonText(): string | null {
        return this._cancelButtonText;
    }

    @computed
    get confirmNotification(): string | null {
        return this._confirmNotification;
    }

    @computed
    get isConfirmOpen(): boolean {
        return this._isOpen;
    }

    @action
    public openConfirm = ({
        content,
        onConfirm,
        onCancel,
        confirmButtonText,
        cancelButtonText,
        confirmNotification
    }: {
        content: React.ReactNode | string;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmButtonText?: string;
        cancelButtonText?: string;
        confirmNotification?: string;
    }) => {
        this._content = content;
        this._onConfirm = onConfirm;
        this._isOpen = true;
        this._onCancel = onCancel ? onCancel : null;
        this._confirmButtonText = confirmButtonText
            ? confirmButtonText
            : DEFAULT_CONFIRM_BUTTON_TEXT;
        this._cancelButtonText = cancelButtonText ? cancelButtonText : DEFAULT_CANCEL_BUTTON_TEXT;
        this._confirmNotification = confirmNotification ? confirmNotification : null;
    };

    @action
    public cancel = () => {
        if (this._onCancel) {
            this._onCancel();
        }
        this.clear();
    };

    @action
    public confirm = () => {
        if (this._onConfirm) {
            this._onConfirm();
        }
        this.clear();
    };

    @action
    private clear = () => {
        this._content = null;
        this._onCancel = null;
        this._onConfirm = null;
        this._isOpen = false;
        this._confirmButtonText = DEFAULT_CONFIRM_BUTTON_TEXT;
        this._cancelButtonText = DEFAULT_CANCEL_BUTTON_TEXT;
        this._confirmNotification = null;
    };
}

export default new ConfirmStore();
