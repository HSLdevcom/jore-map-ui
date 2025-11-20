import GeometryUndoStore from '../geometryUndoStore';

describe('geometryUndoStore', () => {
    interface IUndoItem {
        number: number;
    }

    it('adds values to undo store, and then undo and redo them', () => {
        const undoStore = new GeometryUndoStore<IUndoItem>();
        const item1: IUndoItem = {
            number: 1,
        };
        const item2: IUndoItem = {
            number: 2,
        };
        undoStore.addItem(item1);
        undoStore.addItem(item2);
        let receivedValue: IUndoItem | null = null;
        undoStore.undo((undoObject) => {
            receivedValue = undoObject;
        });
        expect(receivedValue).toEqual(item1);

        undoStore.redo((undoObject) => {
            receivedValue = undoObject;
        });
        expect(receivedValue).toEqual(item2);
    });
});
