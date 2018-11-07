import { IEventLog } from '~/models';

class EventFactory {
    public static createNode = (message: string): IEventLog => {
        const date = new Date().getTime();
        return {
            message,
            timestamp: date,
        };
    }
}

export default EventFactory;
