
export class UndoStore<UndoObject> {
    private _undoObjects: UndoObject[];
    private _undoIndex: number;

    constructor() {
        this.clear();
    }

    public addUndoObject = (undoObject: UndoObject) => {
        // Remove the history of undo's because current state is changed
        this._undoObjects.splice(this._undoIndex + 1);

        // Insert current undoObject to the pile
        this._undoObjects = this._undoObjects.concat([undoObject]);
        this._undoIndex += 1;
    }

    public undo = (undoCallback: Function) => {
        if (this._undoIndex <= 0) return;
        this._undoIndex -= 1;

        const previousUndoObject = this._undoObjects[this._undoIndex];
        undoCallback(previousUndoObject);
    }

    public redo = (undoCallback: Function): any => {
        if (this._undoObjects.length <= 1 ||
            this._undoIndex >= this._undoObjects.length - 1) return;
        this._undoIndex += 1;

        const nextUndoObject = this._undoObjects[this._undoIndex];
        undoCallback(nextUndoObject);
    }

    public clear = () => {
        this._undoObjects = [];
        this._undoIndex = -1;
    }
}

export default UndoStore;
