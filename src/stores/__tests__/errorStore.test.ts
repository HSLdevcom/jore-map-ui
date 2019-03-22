import { ErrorStore } from '../errorStore';

describe('errorStore.addError', () => {
    it('Adds one error to error store', () => {
        const errorStore = new ErrorStore;
        const errorMessage = 'This is a test error';

        errorStore.addError(errorMessage);

        expect(errorStore.errorCount).toEqual(1);
        expect(errorStore.latestError).toEqual(errorMessage);
    });

    it('Adds one error to error store, then removes it', () => {
        const errorStore = new ErrorStore;
        const errorMessage = 'This is a test error';

        errorStore.addError(errorMessage);

        expect(errorStore.errorCount).toEqual(1);

        const error = errorStore.pop();

        expect(error).toEqual(errorMessage);
        expect(errorStore.errorCount).toEqual(0);
    });

    it('Adds one error with exception to error store', () => {
        // tslint:disable:no-console
        // Mocks console.error
        const consoleError = console.error;
        global.console.error = jest.fn();

        const errorStore = new ErrorStore;
        const errorMessage = 'This is a test error';
        const exceptionMessage = 'This is a test exception message';
        const errorException: Error = {
            message: exceptionMessage,
            name: 'Test exception',
        };

        errorStore.addError(errorMessage, errorException);

        expect(errorStore.errorCount).toEqual(1);
        expect(errorStore.latestError).toContain(errorMessage);
        expect(errorStore.latestError).toContain(exceptionMessage);
        expect(console.error).toBeCalled();
        // Clean up console.error to be back to normal
        console.error = consoleError;
        // tslint:enable:no-console
    });
});
