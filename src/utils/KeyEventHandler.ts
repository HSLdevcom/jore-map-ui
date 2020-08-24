import EventListener from '~/helpers/EventListener';

const KEYCODES = {
    enter: 'Enter',
    arrowUp: 'ArrowUp',
    arrowDown: 'ArrowDown',
    Y: 'KeyY',
    Z: 'KeyZ',
    escape: 'Escape',
};

class KeyEventHandler {
    constructor() {
        document.addEventListener('keydown', this.handleKeyDownEvent);
    }

    handleKeyDownEvent = (event: KeyboardEvent) => {
        switch (event.code) {
            case KEYCODES.enter: {
                EventListener.trigger('enter');
                break;
            }
            case KEYCODES.arrowUp: {
                EventListener.trigger('arrowUp');
                break;
            }
            case KEYCODES.arrowDown: {
                EventListener.trigger('arrowDown');
                break;
            }
            case KEYCODES.escape: {
                EventListener.trigger('escape');
                break;
            }
        }

        // Windows
        if (event.ctrlKey) {
            switch (event.code) {
                case KEYCODES.Z: {
                    EventListener.trigger('undo');
                    event.preventDefault(); // to disable native undo event
                    break;
                }
                case KEYCODES.Y: {
                    EventListener.trigger('redo');
                    event.preventDefault(); // to disable native undo event
                    break;
                }
            }
        }
        // Macbook
        else if (event.metaKey && event.code === KEYCODES.Z) {
            if (event.shiftKey) {
                EventListener.trigger('redo');
                event.preventDefault(); // to disable native undo event
            } else {
                EventListener.trigger('undo');
                event.preventDefault(); // to disable native undo event
            }
        }
    };
}

new KeyEventHandler();
