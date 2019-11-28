import Moment from 'moment';

const toDateString = (date: Date): string => {
    return Moment(date).format('DD.MM.YYYY');
};

const getDateWithoutHours = (date: Date): Date => {
    date.setHours(0, 0, 0, 0);
    return date;
};

const areDatesEqual = (a: Date, b: Date) => {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
};

export { toDateString, getDateWithoutHours, areDatesEqual };
