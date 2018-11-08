import moment from 'moment';

export default class ApiClientHelper {
    private static arrayToObject = (arr: [string, any][]) => {
        const res = {};
        arr.forEach(([key, value]:[string, any]) => {
            res[key] = value;
        });
        return res;
    }

    public static format = (obj: object) => {
        const entries = Object.entries(obj);
        const dates = entries
            .filter(([key, value]: [string, any]) => value instanceof Date)
            .map(
                ([key, value]: [string, any]) =>
                    [key, moment(value).format()] as [string, any]);

        return {
            ...obj,
            ...ApiClientHelper.arrayToObject(dates),
        };
    }
}
