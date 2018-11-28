import eventTypes from '~/enums/eventTypes';
import entityNames from '~/enums/entityNames';

export default interface IEvent {
    entity: entityNames;
    action: eventTypes;
    objectId: string;
    preObject?: object;
    postObject?: object;
    timestamp: Date;
}
