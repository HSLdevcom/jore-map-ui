type itemNames = 'origin_url';

const setItem = (name: itemNames, value: any) => {
    localStorage.setItem(name, value);
};

const clearItem = (name: itemNames) => {
    localStorage.removeItem(name);
};

const getItem = (name: itemNames) => {
    return localStorage.getItem(name);
};

export { setItem, clearItem, getItem };
