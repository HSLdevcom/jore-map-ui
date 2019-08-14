import { action, computed, observable } from 'mobx';
import _ from 'lodash';
import { ILineTopic } from '~/models';

export class LineTopicStore {
    @observable private _lineTopic: ILineTopic | null;
    @observable private _oldlineTopic: ILineTopic | null;

    @computed
    get lineTopic(): ILineTopic | null {
        return this._lineTopic;
    }

    get isDirty() {
        return !_.isEqual(this._lineTopic, this._oldlineTopic);
    }

    @action
    public setLineTopic = (lineTopic: ILineTopic) => {
        this._lineTopic = lineTopic;
        this.setOldLineTopic(this._lineTopic);
    };

    @action
    public setOldLineTopic = (lineTopic: ILineTopic) => {
        this._oldlineTopic = _.cloneDeep(lineTopic);
    };

    @action
    public updateLineTopicProperty = (
        property: keyof ILineTopic,
        value: string | number | Date
    ) => {
        this._lineTopic = {
            ...this._lineTopic!,
            [property]: value
        };
    };

    @action
    public resetChanges = () => {
        if (this._oldlineTopic) {
            this.setLineTopic(this._oldlineTopic);
        }
    };

    @action
    public clear = () => {
        this._lineTopic = null;
    };
}

const observableLineTopicStore = new LineTopicStore();

export default observableLineTopicStore;
