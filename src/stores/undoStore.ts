import EventManager from '~/util/EventManager';

class UndoStore<UndoObject> {
    private _undoObjects: UndoObject[];
    private _undoIndex: number;

    constructor() {
        this.clear();
    }

    public addItem = (undoObject: UndoObject) => {
        if (this._undoObjects.length !== 0) {
            EventManager.trigger('geometryChange');
        }

        // Remove the history of undo's because current state is changed
        this._undoObjects.splice(this._undoIndex + 1);

        // Insert current undoObject to the stack
        this._undoObjects = this._undoObjects.concat([undoObject]);
        this._undoIndex += 1;
    }

    public undo = (undoCallback: (undoObject: UndoObject) => void) => {
        if (this._undoIndex <= 0) return;
        this._undoIndex -= 1;

        const previousUndoObject = this._undoObjects[this._undoIndex];
        undoCallback(previousUndoObject);
        EventManager.trigger('geometryChange');
    }

    public redo = (undoCallback: (undoObject: UndoObject) => void): any => {
        if (this._undoObjects.length <= 1 ||
            this._undoIndex >= this._undoObjects.length - 1) return;
        this._undoIndex += 1;

        const nextUndoObject = this._undoObjects[this._undoIndex];
        undoCallback(nextUndoObject);
        EventManager.trigger('geometryChange');
    }

    public clear = () => {
        this._undoObjects = [];
        this._undoIndex = -1;
    }
}

export default UndoStore;
