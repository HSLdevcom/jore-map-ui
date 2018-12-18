import eventType from '~/enums/eventType';
import entityName from '~/enums/entityName';

export default interface IEvent {
    entity: entityName;
    action: eventType;
    preObject: object;
    timestamp: Date;
}
