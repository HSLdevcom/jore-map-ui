import Moment from 'moment';

const dateToDateString = (date: Date) => {
    return Moment(
        date,
    ).format('DD.MM.YYYY');
};

export {
    dateToDateString,
};
