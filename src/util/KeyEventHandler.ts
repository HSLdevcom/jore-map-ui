import EventManager from '~/util/EventManager';

const KEYCODES = {
    enter: 'Enter',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    Y: 'KeyY',
    Z: 'KeyZ'
};

class KeyEventHandler {
    constructor() {
        document.addEventListener('keydown', this.handleKeyDownEvent);
    }

    handleKeyDownEvent = (event: KeyboardEvent) => {
        switch (event.code) {
            case KEYCODES.enter: {
                EventManager.trigger('enter');
                break;
            }
            case KEYCODES.arrowUp: {
                EventManager.trigger('arrowUp');
                break;
            }
            case KEYCODES.arrowDown: {
                EventManager.trigger('arrowDown');
                break;
            }
        }

        // Windows
        if (event.ctrlKey) {
            switch (event.code) {
                case KEYCODES.Z: {
                    EventManager.trigger('undo');
                    break;
                }
                case KEYCODES.Y: {
                    EventManager.trigger('redo');
                    break;
                }
            }
            // Macbook
        } else if (event.metaKey && event.code === KEYCODES.Z) {
            if (event.shiftKey) {
                EventManager.trigger('redo');
            } else {
                EventManager.trigger('undo');
            }
        }
    };
}

new KeyEventHandler();
