import eventType from '~/enums/eventType';
import endpoints from '~/enums/endpoints';

export default interface IEvent {
    entity: endpoints;
    action: eventType;
    preObject: object;
}
