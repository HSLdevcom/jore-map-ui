import { action, computed, observable } from 'mobx';

const DEFAULT_CONFIRM_BUTTON_TEXT = 'Hyväksy';
const DEFAULT_CANCEL_BUTTON_TEXT = 'Peruuta';

/**
 * Only affects the color of the confirm button.
 * Usage note: if want to save after confirm click, use <SaveButton /> to open confirm modal or if want to use <SaveButton /> as the confirm button, use <Modal /> instead of <Confirm />
 **/
type confirmType = 'default' | 'save' | 'delete';

type confirmComponentName = 'default' | 'savePrompt' | 'unmeasuredStopGapsConfirm' | 'splitConfirm';

class ConfirmStore {
    @observable private _confirmComponentName: confirmComponentName;
    @observable private _confirmData: any; // Data format is dependent on used confirm component
    @observable private _isOpen: boolean;
    @observable private _isConfirmButtonDisabled: boolean;
    @observable private _confirmButtonText: string | null;
    @observable private _cancelButtonText: string | null;
    @observable private _confirmNotification: string | null;
    @observable private _confirmType: confirmType;
    @observable private _doubleConfirmText: string | null;
    private _onConfirm: null | (() => void);
    private _onCancel: null | (() => void);

    constructor() {
        this._isOpen = false;
    }

    @computed
    get confirmComponentName() {
        return this._confirmComponentName;
    }

    @computed
    get confirmData() {
        return this._confirmData;
    }

    @computed
    get isOpen(): boolean {
        return this._isOpen;
    }

    @computed
    get isConfirmButtonDisabled(): boolean {
        return this._isConfirmButtonDisabled;
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
    get confirmType(): string {
        return this._confirmType;
    }

    @computed
    get doubleConfirmText(): string | null {
        return this._doubleConfirmText;
    }

    @action
    public openConfirm = ({
        confirmComponentName = 'default',
        confirmData,
        onConfirm,
        onCancel,
        confirmButtonText,
        cancelButtonText,
        confirmNotification,
        confirmType = 'default',
        doubleConfirmText,
    }: {
        confirmComponentName?: confirmComponentName;
        confirmData?: any;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmButtonText?: string;
        cancelButtonText?: string;
        confirmNotification?: string;
        confirmType?: confirmType;
        doubleConfirmText?: string;
    }) => {
        this._confirmComponentName = confirmComponentName;
        this._confirmData = confirmData;
        this._onConfirm = onConfirm;
        this._isOpen = true;
        this._onCancel = onCancel ? onCancel : null;
        this._confirmButtonText = confirmButtonText
            ? confirmButtonText
            : DEFAULT_CONFIRM_BUTTON_TEXT;
        this._cancelButtonText = cancelButtonText ? cancelButtonText : DEFAULT_CANCEL_BUTTON_TEXT;
        this._confirmNotification = confirmNotification ? confirmNotification : null;
        this._confirmType = confirmType;
        this._doubleConfirmText = doubleConfirmText ? doubleConfirmText : null;
    };

    @action
    public cancel = () => {
        // In cases of having two confirm's in a row, we want to first call clear, then call onCancel()
        const onCancelTemp = this._onCancel ? this._onCancel.bind({}) : null;
        this.clear();
        if (onCancelTemp) {
            onCancelTemp();
        }
    };

    @action
    public confirm = () => {
        // In cases of having two confirm's in a row, we want to first call clear, then call onConfirm()
        const onConfirmTemp = this._onConfirm ? this._onConfirm.bind({}) : null;
        this.clear();
        if (onConfirmTemp) {
            onConfirmTemp();
        }
    };

    @action
    public setIsConfirmButtonDisabled = (isDisabled: boolean) => {
        this._isConfirmButtonDisabled = isDisabled;
    };

    @action
    public clear = () => {
        this._confirmData = null;
        this._onCancel = null;
        this._onConfirm = null;
        this._isOpen = false;
        this._confirmButtonText = DEFAULT_CONFIRM_BUTTON_TEXT;
        this._cancelButtonText = DEFAULT_CANCEL_BUTTON_TEXT;
        this._confirmNotification = null;
        this._isConfirmButtonDisabled = false;
        this._doubleConfirmText = null;
    };
}

export default new ConfirmStore();

export { ConfirmStore };
