
class EventManager {

    public trigger(eventName: string) {
        const event = new Event(eventName);
        document.dispatchEvent(event);
    }

    // TODO: use eventName: type
    public on(eventName: string, callback: Function) {
        document.addEventListener(eventName, () => {
            callback();
        });
    }

    // TODO: use eventName: type
    public off(eventName: string, callback: Function) {
        document.removeEventListener(eventName, () => {
            callback();
        });
    }

}

export default new EventManager();
