import { isCurrentDateWithinTimeSpan, toMidnightDate } from '../dateUtils';

describe('dateUtils.isCurrentDateWithinTimeSpan', () => {
    it('Returns true if currentDate is within timeSpan', () => {
        const a = toMidnightDate(new Date(new Date().setDate(new Date().getDate() - 1)));
        const b = toMidnightDate(new Date());
        const c = toMidnightDate(new Date(new Date().setDate(new Date().getDate() + 1)));

        expect(isCurrentDateWithinTimeSpan(a, b));
        expect(isCurrentDateWithinTimeSpan(b, c));
        expect(isCurrentDateWithinTimeSpan(a, c));
        expect(!isCurrentDateWithinTimeSpan(c, c));
        expect(!isCurrentDateWithinTimeSpan(a, a));
    });
});
