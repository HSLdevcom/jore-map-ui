import moment from 'moment';
import { toJS } from 'mobx';

class ApiClientHelper {
    private static arrayToObject = (arr: [string, any][]) => {
        const res = {};
        arr.forEach(([key, value]:[string, any]) => {
            res[key] = value;
        });
        return res;
    }

    public static format = (obj: object) => {
        // Formats the object to include dates as formatted strings, instead of Date objects
        const entries = Object.entries(
            toJS(obj),
        );
        const dates = entries
            .filter(([key, value]: [string, any]) => value instanceof Date)
            .map(
                ([key, value]: [string, Date]) =>
                    [key, moment(value).format()] as [string, string]);

        return {
            ...obj,
            ...ApiClientHelper.arrayToObject(dates),
        };
    }

    public static stringify = (obj: object) => {
        let cache: any = [];
        const res = JSON.stringify(obj, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found
                    try {
                        // If this value does not reference a parent it can be deduped
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        // discard key if value cannot be deduped
                        return;
                    }
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // Enable garbage collection
        return res;
    }
}

export default ApiClientHelper;
