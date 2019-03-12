const ORIGIN_URL_NAME = 'origin_url';

const setOriginUrl = (url: string) => {
    localStorage.setItem(ORIGIN_URL_NAME, url);
};

const clearOriginUrl = () => {
    localStorage.removeItem(ORIGIN_URL_NAME);
};

const getOriginUrl = () => {
    return localStorage.getItem(ORIGIN_URL_NAME);
};

export {
    setOriginUrl,
    getOriginUrl,
    clearOriginUrl,
};
