import constants from '~/constants/constants';

type itemNames =
    | 'origin_url'
    | 'visible_layers'
    | 'visible_transit_types'
    | 'user_transit_type'
    | 'visible_node_labels';

const KEY_PREFIX = constants.LOCAL_STORAGE_KEY_PREFIX;

class LocalStorageHelper {
    public static setItem = (name: itemNames, value: any) => {
        localStorage.setItem(KEY_PREFIX + name, JSON.stringify(value));
    };

    public static removeItem = (name: itemNames) => {
        localStorage.removeItem(KEY_PREFIX + name);
    };

    public static getItem = (name: itemNames) => {
        const item = localStorage.getItem(KEY_PREFIX + name);
        if (item) {
            try {
                return JSON.parse(item);
            } catch {}
        }
        return null;
    };
}

export default LocalStorageHelper;
