import React from 'react';
import ReactDatePicker from 'react-date-picker';
import { IoMdCalendar, IoMdClose } from 'react-icons/io';
import * as s from './datePicker.scss';

interface IDatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

const datePicker = (props: IDatePickerProps) => (
    <div className={s.datepickerContainer}>
        <ReactDatePicker
            value={(props.value as Date)}
            onChange={props.onChange}
            locale='fi-FI'
            calendarIcon={<IoMdCalendar />}
            clearIcon={<IoMdClose />}
        />
  </div>
);

export default datePicker;
