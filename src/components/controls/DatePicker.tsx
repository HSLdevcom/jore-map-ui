import classnames from 'classnames';
import fi from 'date-fns/locale/fi';
import _ from 'lodash';
import Moment from 'moment';
import React, { ChangeEvent } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import ReactDOM from 'react-dom';
import { IoMdCalendar, IoMdClose } from 'react-icons/io';
import { toDateString } from '~/utils/dateUtils';
import * as s from './datePicker.scss';

registerLocale('fi', fi);

interface IDatePickerProps {
    value?: Date;
    isEmptyValueAllowed?: boolean;
    isClearButtonVisible?: boolean;
    onChange: (date: Date | null) => void;
    onFocus?: () => void;
}

interface IDatePickerState {
    isOpen: boolean;
    selectedDate: string;
}

class DatePicker extends React.Component<IDatePickerProps, IDatePickerState> {
    private mounted: boolean;
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false,
            selectedDate: this.props.value ? toDateString(this.props.value) : ''
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate(prevProps: IDatePickerProps) {
        if (this.props.value === prevProps.value) return;

        const newValue = this.props.value ? toDateString(this.props.value) : '';
        if (this.state.selectedDate !== newValue) {
            this.setState({
                selectedDate: newValue
            });
        }
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

    private onChange = (inputValue: Date | null | string) => {
        const getDateString = (value: Date | null | string): string | null => {
            if (typeof value === 'string' || !value) {
                return value;
            }
            return toDateString(value);
        };

        const dateString: string | null = getDateString(inputValue);
        this.setState({
            selectedDate: dateString ? dateString : ''
        });

        this.closeCalendar();

        // Allow input date that is in the correct format
        if (dateString && Moment(dateString, 'DD.MM.YYYY', true).isValid()) {
            const dateMomentObject = Moment(dateString, 'DD.MM.YYYY');
            const dateObject = dateMomentObject.toDate();

            this.props.onChange(dateObject);
        }
        if (!dateString && this.props.isEmptyValueAllowed) {
            this.props.onChange(null);
        }
    };

    render() {
        const { isClearButtonVisible, isEmptyValueAllowed } = this.props;
        const minDate = new Date();
        minDate.setFullYear(1970);
        minDate.setMonth(0);
        minDate.setDate(1);
        const maxDate = new Date();
        maxDate.setFullYear(2051);
        maxDate.setMonth(0);
        maxDate.setDate(1);

        // TODO: scroll to selected year missing from react-datepicker
        // open issue for this: https://github.com/Hacker0x01/react-datepicker/pull/1700
        return (
            <div className={classnames(s.datePicker, s.staticHeight)}>
                <ReactDatePicker
                    customInput={renderDatePickerInput({
                        isClearButtonVisible,
                        isEmptyValueAllowed,
                        value: this.state.selectedDate,
                        onChange: this.onChange,
                        openCalendar: this.openCalendar,
                        placeholder: 'Syötä päivä'
                    })}
                    open={this.state.isOpen}
                    onClickOutside={this.closeCalendar}
                    onSelect={this.onChange}
                    onFocus={this.props.onFocus}
                    autoFocus={true}
                    adjustDateOnChange={false}
                    autoComplete={'off'}
                    disabledKeyboardNavigation={true}
                    onChange={this.onChange}
                    locale={fi}
                    dateFormat={'dd.MM.yyyy'}
                    showMonthDropdown={true}
                    peekNextMonth={true}
                    showYearDropdown={true}
                    startDate={new Date()}
                    scrollableYearDropdown={true}
                    yearDropdownItemNumber={100}
                    minDate={minDate}
                    maxDate={maxDate}
                    dateFormatCalendar={'dd.MM.yyyy'}
                    popperContainer={_renderCalendarContainer}
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
    onChange,
    placeholder,
    value,
    isClearButtonVisible,
    isEmptyValueAllowed,
    openCalendar
}: {
    onChange: (value: any) => void;
    placeholder: string;
    value?: string;
    isClearButtonVisible?: boolean;
    isEmptyValueAllowed?: boolean;
    openCalendar: Function;
}) => {
    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    const clearInputValue = (event: React.MouseEvent) => {
        onChange('');
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
                onChange={onInputChange}
            />
            <IoMdCalendar className={s.calendarIcon} />
            {isClearButtonVisible && (
                <IoMdClose onClick={clearInputValue} className={s.clearIcon} />
            )}
        </div>
    );
};

export default DatePicker;
