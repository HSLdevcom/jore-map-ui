import classnames from 'classnames';
import fi from 'date-fns/locale/fi';
import _ from 'lodash';
import Moment from 'moment';
import React, { ChangeEvent } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import ReactDOM from 'react-dom';
import { IoMdCalendar, IoMdClose } from 'react-icons/io';
import EventHelper from '~/helpers/EventHelper';
import { getMaxDate, getMinDate, toDateString } from '~/utils/dateUtils';
import * as s from './datePicker.scss';

registerLocale('fi', fi);

interface IDatePickerProps {
    value?: Date;
    isEmptyValueAllowed?: boolean;
    isClearButtonVisible?: boolean;
    onChange: (date: Date | null) => void;
    onFocus?: () => void;
    minStartDate?: Date;
    maxEndDate?: Date;
    excludeDates?: Date[];
}

interface IDatePickerState {
    isOpen: boolean;
    currentValue: string;
}

class DatePicker extends React.Component<IDatePickerProps, IDatePickerState> {
    private mounted: boolean;
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false,
            currentValue: this.props.value ? toDateString(this.props.value) : '',
        };
    }

    componentDidMount() {
        this.mounted = true;
        EventHelper.on('enter', this.trimInputString);
    }

    componentWillUnmount() {
        this.mounted = false;
        EventHelper.off('enter', this.trimInputString);
    }

    componentDidUpdate(prevProps: IDatePickerProps) {
        if (!this.props.value && !_.isEmpty(this.state.currentValue)) {
            this.setState({
                currentValue: '',
            });
            return;
        }
        if (this.props.value === prevProps.value) return;

        const newValue = this.props.value ? toDateString(this.props.value) : '';
        if (this.state.currentValue !== newValue) {
            this.setState({
                currentValue: newValue,
            });
        }
    }

    private onChangeDate = (date: Date | null) => {
        let newDate = date;
        if (date) {
            const timeInMs = date.getTime();
            if (timeInMs < getMinDate().getTime()) {
                newDate = getMinDate();
            } else if (timeInMs > getMaxDate().getTime()) {
                newDate = getMaxDate();
            }
        }
        this.props.onChange(newDate);
    }

    private openCalendar = () => {
        if (this.mounted) {
            this.setState({ isOpen: true });
        }
    };

    private closeCalendar = () => {
        if (this.mounted) {
            this.setState({ isOpen: false });
        }
    };

    private onInputChange = (inputValue: string) => {
        this.closeCalendar();

        // Allow input date that is in the correct format
        if (Moment(inputValue, 'DD.MM.YYYY', true).isValid()) {
            const dateMomentObject = Moment(inputValue, 'DD.MM.YYYY');
            const dateObject = dateMomentObject.toDate();
            this.onChangeDate(dateObject);
            return;
        }

        this.setState({
            currentValue: inputValue
        })

        if (_.isEmpty(inputValue) && this.props.isEmptyValueAllowed) {
            this.onChangeDate(null);
            return;
        }
    };

    private onCalendarDateSelect = (date: Date) => {
        // Have to set 1 ms timeout because state.isOpen might have not been updated
        setTimeout(() => { this.selectDateIfCalendarIsOpen(date) }, 1)
    }

    private selectDateIfCalendarIsOpen = (date: Date) => {
        if (this.state.isOpen) {
            this.onInputChange(toDateString(date));
        }
    }

    private trimInputString = () => {
        const currentValue = this.state.currentValue;
        const dateObjectToTrim = Moment(currentValue, 'DD.MM.YYYY').toDate();
        const day = (`0${dateObjectToTrim.getDate()}`).slice(-2);
        const month = (`0${(dateObjectToTrim.getMonth()+1)}`).slice(-2);
        const trimmedDateString = `${day}.${month}.${dateObjectToTrim.getFullYear()}`;
        if (Moment(trimmedDateString, 'DD.MM.YYYY', true).isValid()) {
            if (currentValue !== trimmedDateString) {
                this.setState({
                    currentValue: trimmedDateString
                })
                this.onChangeDate(Moment(trimmedDateString, 'DD.MM.YYYY').toDate());
            }
        }
    }

    render() {
        const {
            isClearButtonVisible,
            isEmptyValueAllowed,
            minStartDate,
            maxEndDate,
            excludeDates,
        } = this.props;
        const minDate = minStartDate ? minStartDate : getMinDate();
        const maxDate = maxEndDate ? maxEndDate : getMaxDate();

        return (
            <div className={classnames(s.datePicker, s.staticHeight)}>
                <ReactDatePicker
                    customInput={renderDatePickerInput({
                        isClearButtonVisible,
                        isEmptyValueAllowed,
                        value: this.state.currentValue,
                        onInputChange: this.onInputChange,
                        onInputBlur: this.trimInputString,
                        openCalendar: this.openCalendar,
                        placeholder: 'Syötä päivä',
                    })}
                    selected={this.props.value}
                    open={this.state.isOpen}
                    onClickOutside={this.closeCalendar}
                    onFocus={this.props.onFocus}
                    autoComplete={'off'}
                    disabledKeyboardNavigation={true}
                    onChange={this.onCalendarDateSelect}
                    locale={fi}
                    dateFormat={'dd.MM.yyyy'}
                    showMonthDropdown={true}
                    peekNextMonth={true}
                    showYearDropdown={true}
                    dropdownMode='select'
                    startDate={new Date()}
                    scrollableYearDropdown={true}
                    yearDropdownItemNumber={100}
                    minDate={minDate}
                    maxDate={maxDate}
                    excludeDates={excludeDates}
                    dateFormatCalendar={'dd.MM.yyyy'}
                    popperContainer={_renderCalendarContainer}
                    fixedHeight={true}
                />
            </div>
        );
    }
}

const _renderCalendarContainer = ({ children }: { children: JSX.Element[] }): React.ReactNode => {
    const el = document.getElementById('root');
    return ReactDOM.createPortal(children, el!);
};

const renderDatePickerInput = ({
    onInputChange,
    onInputBlur,
    placeholder,
    value,
    isClearButtonVisible,
    isEmptyValueAllowed,
    openCalendar,
}: {
    onInputChange: (value: any) => void;
    onInputBlur: () => void;
    placeholder: string;
    value?: string;
    isClearButtonVisible?: boolean;
    isEmptyValueAllowed?: boolean;
    openCalendar: Function;
}) => {
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        onInputChange(event.target.value);
    };

    const clearInputValue = (event: React.MouseEvent) => {
        onInputChange('');
        event.preventDefault();
    };

    const isInputValid = !_.isEmpty(value)
        ? Moment(value, 'DD.MM.YYYY', true).isValid()
        : Boolean(isEmptyValueAllowed);
    return (
        <div className={classnames(s.staticHeight, s.inputField)}>
            <input
                className={!isInputValid ? s.invalidDate : undefined}
                onClick={() => openCalendar()}
                placeholder={placeholder}
                type={'text'}
                value={value}
                onChange={onChange}
                onBlur={onInputBlur}
            />
            <IoMdCalendar className={s.calendarIcon} />
            {isClearButtonVisible && (
                <IoMdClose onClick={clearInputValue} className={s.clearIcon} />
            )}
        </div>
    );
};

export default DatePicker;
