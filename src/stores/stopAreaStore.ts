import _ from 'lodash';
import { action, computed, observable } from 'mobx';
import TransitType from '~/enums/transitType';
import { IStopArea } from '~/models';

export interface UndoState {
    stopArea: IStopArea;
}

export class StopAreaStore {
    @observable private _stopArea: IStopArea | null;
    @observable private _oldStopArea: IStopArea | null;
    @observable private _isEditingDisabled: boolean;

    constructor() {
        this._stopArea = null;
        this._oldStopArea = null;
        this._isEditingDisabled = true;
    }

    @computed
    get stopArea() {
        return this._stopArea!;
    }

    @computed
    get oldStopArea() {
        return this._oldStopArea!;
    }

    @computed
    get isDirty() {
        return this._stopArea && !_.isEqual(this._stopArea, this._oldStopArea);
    }

    @computed
    get isEditingDisabled() {
        return this._isEditingDisabled;
    }

    @action
    public init = ({
        stopArea,
        isNewStopArea
    }: {
        stopArea: IStopArea;
        isNewStopArea: boolean;
    }) => {
        this.clear();

        const oldStopArea = _.cloneDeep(stopArea);
        const newStopArea = _.cloneDeep(stopArea);

        this._stopArea = newStopArea;

        this.setOldStopArea(oldStopArea);

        this._isEditingDisabled = !isNewStopArea;
    };

    @action
    public setOldStopArea = (stopArea: IStopArea) => {
        this._oldStopArea = _.cloneDeep(stopArea);
    };

    @action
    public updateStopAreaProperty = (
        property: keyof IStopArea,
        value: string | Date | TransitType
    ) => {
        this._stopArea = {
            ...this._stopArea!,
            [property]: value
        };
    };

    @action
    public setIsEditingDisabled = (isEditingDisabled: boolean) => {
        this._isEditingDisabled = isEditingDisabled;
    };

    @action
    public toggleIsEditingDisabled = () => {
        this._isEditingDisabled = !this._isEditingDisabled;
    };

    @action
    public clear = () => {
        this._stopArea = null;
        this._oldStopArea = null;
        this._isEditingDisabled = true;
    };

    @action
    public resetChanges = () => {
        if (this._oldStopArea) {
            this.init({ stopArea: this._oldStopArea, isNewStopArea: false });
        }
    };
}

const observableStopAreaStore = new StopAreaStore();

export default observableStopAreaStore;
