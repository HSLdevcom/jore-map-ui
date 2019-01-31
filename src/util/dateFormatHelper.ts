import moment from 'moment';

const dateToDateString = (date: Date) => {
    return moment(
        date,
    ).format('DD.MM.YYYY');
};

export {
    dateToDateString,
};
