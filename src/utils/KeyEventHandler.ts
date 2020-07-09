import EventHelper from '~/helpers/EventHelper';

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
                EventHelper.trigger('enter');
                break;
            }
            case KEYCODES.arrowUp: {
                EventHelper.trigger('arrowUp');
                break;
            }
            case KEYCODES.arrowDown: {
                EventHelper.trigger('arrowDown');
                break;
            }
            case KEYCODES.escape: {
                EventHelper.trigger('escape');
                break;
            }
        }

        // Windows
        if (event.ctrlKey) {
            switch (event.code) {
                case KEYCODES.Z: {
                    EventHelper.trigger('undo');
                    event.preventDefault(); // to disable native undo event
                    break;
                }
                case KEYCODES.Y: {
                    EventHelper.trigger('redo');
                    event.preventDefault(); // to disable native undo event
                    break;
                }
            }
        }
        // Macbook
        else if (event.metaKey && event.code === KEYCODES.Z) {
            if (event.shiftKey) {
                EventHelper.trigger('redo');
                event.preventDefault(); // to disable native undo event
            } else {
                EventHelper.trigger('undo');
                event.preventDefault(); // to disable native undo event
            }
        }
    };
}

new KeyEventHandler();
