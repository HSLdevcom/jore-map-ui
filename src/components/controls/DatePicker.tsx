import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import ReactDatePicker from 'react-date-picker';
import { IoMdCalendar } from 'react-icons/io';
import * as s from './datePicker.scss';

interface IDatePickerProps {
    value?: Date;
    isClearButtonVisible?: boolean;
    onChange: (date: Date) => void;
}

const DatePicker = observer((props: IDatePickerProps) => (
    <div className={classnames(s.staticHeight, s.datepickerContainer)}>
        <ReactDatePicker
            value={props.value}
            onChange={props.onChange}
            locale='fi-FI'
            calendarIcon={<IoMdCalendar />}
            clearIcon={props.isClearButtonVisible ? undefined : null}
        />
    </div>
));

export default DatePicker;
