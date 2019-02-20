
type eventName = 'undo' | 'redo';

class EventManager {

    public trigger(eventName: eventName) {
        const event = new Event(eventName);
        document.dispatchEvent(event);
    }

    public on(eventName: eventName, callback: Function) {
        document.addEventListener(eventName, () => {
            callback();
        });
    }

    public off(eventName: eventName, callback: Function) {
        document.removeEventListener(eventName, () => {
            callback();
        });
    }

}

export default new EventManager();
