import classnames from 'classnames';
import { isEqual } from 'lodash';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { areDatesEqual, toDateString } from '~/utils/dateUtils';
import * as s from './comparableRow.scss';

interface IRoutePathComparisonContainerProps {
    label: string;
    value1: any;
    value2: any;
}

const getAreValuesEqual = (value1: any, value2: any) => {
    return value1 instanceof Date ? areDatesEqual(value1, value2) : isEqual(value1, value2);
};

const ComparableRow = inject()(
    observer((props: IRoutePathComparisonContainerProps) => {
        const { label, value1, value2 } = props;
        const renderValue = (value: any, className: string) => {
            return (
                <div className={classnames(s.value, className)}>
                    {value instanceof Date ? toDateString(value) : value}
                </div>
            );
        };
        const areValuesEqual = getAreValuesEqual(value1, value2);
        return (
            <div className={s.comparableRow}>
                <div className={s.label}>{label}</div>
                <div className={classnames(s.values, areValuesEqual ? s.equalValues : undefined)}>
                    {renderValue(value1, s.leftValue)}
                    {renderValue(value2, s.rightValue)}
                </div>
            </div>
        );
    })
);

export default ComparableRow;

export { getAreValuesEqual };
