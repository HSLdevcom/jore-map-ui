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
}

export default ApiClientHelper;
