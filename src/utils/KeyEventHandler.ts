import EventHelper from '~/helpers/EventHelper';

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
        document.addEventListener('keyup', this.handleKeyUpEvent);
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
        }

        // Windows
        if (event.ctrlKey) {
            EventHelper.trigger('ctrl');
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
        } else if (event.shiftKey) {
            EventHelper.trigger('shift');
        }
        // Macbook
        else if (event.metaKey && event.code === KEYCODES.Z) {
            EventHelper.trigger('ctrl');
            if (event.shiftKey) {
                EventHelper.trigger('redo');
                event.preventDefault(); // to disable native undo event
            } else {
                EventHelper.trigger('undo');
                event.preventDefault(); // to disable native undo event
            }
        }
    };

    handleKeyUpEvent = (event: KeyboardEvent) => {
        // Windows
        EventHelper.trigger('keyUp');
    };
}

new KeyEventHandler();
