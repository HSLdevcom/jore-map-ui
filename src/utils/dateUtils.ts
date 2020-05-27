import Moment from 'moment';
import constants from '~/constants/constants';

const toDateString = (date: Date): string => {
    return Moment(date).format('DD.MM.YYYY');
};

const toMidnightDate = (date: Date): Date => {
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

const isDateWithinTimeSpan = ({
    date,
    timeSpanStart,
    timeSpanEnd,
}: {
    date: Date;
    timeSpanStart: Date;
    timeSpanEnd: Date;
}) => {
    return (
        Moment(timeSpanStart).isBefore(Moment(date)) && Moment(timeSpanEnd).isAfter(Moment(date))
    );
};

// TODO: refactor to use isDateWithinTimeSpan
const isCurrentDateWithinTimeSpan = (a: Date, b: Date) => {
    return Moment(a).isBefore(Moment()) && Moment(b).isAfter(Moment());
};

const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(constants.MAX_YEAR);
    maxDate.setMonth(0);
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(1);
    return maxDate;
};

const getMinDate = () => {
    const minDate = new Date();
    minDate.setFullYear(constants.MIN_YEAR);
    minDate.setMonth(0);
    minDate.setHours(0, 0, 0, 0);
    minDate.setDate(1);
    return minDate;
};

export {
    toDateString,
    toMidnightDate,
    areDatesEqual,
    isDateWithinTimeSpan,
    isCurrentDateWithinTimeSpan,
    getMaxDate,
    getMinDate,
};
