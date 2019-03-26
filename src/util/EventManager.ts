
type eventName = 'undo' | 'redo'
    | 'mapClick' | 'nodeClick'
    | 'networkNodeClick' | 'networkLinkClick';

class EventManager {

    public trigger(eventName: eventName, data?: any) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail: data,
        });
        document.dispatchEvent(event);
    }
    public on(eventName: eventName, callback: (event: CustomEvent) => void) {
        document.addEventListener(eventName, callback);
    }

    public off(eventName: eventName, callback: (event: CustomEvent) => void) {
        document.removeEventListener(eventName, callback);
    }

}

export default new EventManager();
