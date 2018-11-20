import { action, computed, observable } from 'mobx';
import ILogEntry from '~/models/ILogEntry';
import logActions from '~/enums/logActions';
import entityNames from '~/enums/entityNames';

export class GeometryLogStore {
    @observable private _log: ILogEntry[];

    constructor() {
        this._log = [];
    }

    @computed get log(): ILogEntry[] {
        return this._log;
    }

    @action
    public pushToLog(
        { action, entityName, objectId, oldObject, newObject }
      : {
          action: logActions,
          entityName: entityNames,
          objectId: string,
          oldObject?: object,
          newObject?: object,
      },
      ) {
        this._log.push({
            action,
            objectId,
            postObject: newObject,
            preObject: oldObject,
            timestamp: new Date(),
            entity: entityName,
        });
    }
}

const observableGeometryLogStore = new GeometryLogStore();

export default observableGeometryLogStore;
