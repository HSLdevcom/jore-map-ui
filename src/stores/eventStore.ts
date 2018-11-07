import { action, computed, observable } from 'mobx';
import { IEventLog } from '~/models';

export class EventStore {
    @observable private _eventLogs: IEventLog[];

    constructor() {
        this._eventLogs = [];
    }

    @computed get allEvents(): IEventLog[] {
        return this._eventLogs;
    }

    @action
    public setAllEvents(events: IEventLog[]) {
        this._eventLogs = events;
    }

    @action
    public setEvent(event: IEventLog) {
        this._eventLogs.push(event);
    }

}

const observableEventStore = new EventStore();

export default observableEventStore;
