import ErrorStore from '~/stores/errorStore';

const showError = (err: any) => {
    let message: string = '';
    if (err.errorCode) {
        switch (err.errorCode) {
        case 409:
            // tslint:disable-next-line:max-line-length
            message = 'Karttakäyttöliittymän sisäinen tietokanta oli epäsynkassa jore tietokannan kanssa. Päivitä sivu ja yritä uudelleen.';
            break;
        }
    }
    if (!message) {
        const errMessage = err.message ? `, (${err.message})` : '';
        message = `Tallennus epäonnistui${errMessage}`;
    }
    ErrorStore.addError(message);
};

export {
    showError,
};
