
type eventName = 'undo' | 'redo' | 'mapClick';

class EventManager {

    public trigger(eventName: eventName, data?: any) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail: data,
        });
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
