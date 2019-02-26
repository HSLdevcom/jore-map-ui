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
        // Windows
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
        // Macbook
        } else if (event.metaKey && event.code === KEYCODES.Z) {
            if (event.shiftKey) {
                EventManager.trigger('redo');
            } else {
                EventManager.trigger('undo');
            }
        }
    }
}

new KeyEventHandler();
