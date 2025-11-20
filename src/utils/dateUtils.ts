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
        Moment(timeSpanStart).isSameOrBefore(Moment(date)) &&
        Moment(timeSpanEnd).isSameOrAfter(Moment(date))
    );
};

const isCurrentDateWithinTimeSpan = (a: Date, b: Date) => {
    const currentDate = toMidnightDate(new Date());
    return isDateWithinTimeSpan({
        date: currentDate,
        timeSpanStart: a,
        timeSpanEnd: b,
    });
};

const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(constants.MAX_YEAR + 1);
    maxDate.setMonth(0);
    maxDate.setDate(1);
    maxDate.setDate(maxDate.getDate() - 1);
    maxDate.setHours(0, 0, 0, 0);
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
