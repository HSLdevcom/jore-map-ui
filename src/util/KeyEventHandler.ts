import EventManager from '~/util/EventManager';

const KEYCODES = {
    Y: 'KeyY',
    Z: 'KeyZ',
};

class KeyEventHandler {

    constructor() {
        document.addEventListener('keydown', this.handleKeyDownEvent);
    }

    handleKeyDownEvent = (event: KeyboardEvent) => {
        if (event.ctrlKey) {
            switch (event.code) {
            case KEYCODES.Z: {
                EventManager.trigger('undo');
                break;
            }
            case KEYCODES.Y: {
                EventManager.trigger('redo');
                break;
            }}
        }
    }
}

export default new KeyEventHandler();
