import logActions from '~/enums/logActions';
import entityNames from '~/enums/entityNames';

export default interface ILogEntry {
    entity: entityNames;
    action: logActions;
    objectId: string;
    preObject?: object;
    postObject?: object;
    timestamp: Date;
}
