import Moment from 'moment';

const getDateString = (date: Date): String => {
    return Moment(date).format('DD.MM.YYYY');
};

const getDateWithoutHours = (date: Date): Date => {
    date.setHours(0, 0, 0, 0);
    return date;
};

export { getDateString, getDateWithoutHours };
