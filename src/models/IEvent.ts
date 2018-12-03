import eventType from '~/enums/eventType';
import entityName from '~/enums/entityName';

export default interface IEvent {
    entity: entityName;
    action: eventType;
    objectId: string;
    preObject?: object;
    postObject?: object;
    timestamp: Date;
}
