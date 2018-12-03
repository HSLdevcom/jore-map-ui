import eventType from '~/enums/eventType';
import entityName from '~/enums/entityName';

export default interface IEvent {
    entity: entityName;
    action: eventType;
    objectId: string;
    // Add variables for keeping track of changes
    //
    // changedObject: object;
    // or
    // preObject?: object;
    // postObject?: object;
    timestamp: Date;
}
