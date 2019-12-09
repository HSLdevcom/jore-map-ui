import classnames from 'classnames';
import fi from 'date-fns/locale/fi';
import { observer } from 'mobx-react';
import Moment from 'moment';
import React, { ChangeEvent } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDOM from 'react-dom';
import { IoMdCalendar, IoMdClose } from 'react-icons/io';
import { toDateString } from '~/util/dateHelpers';
import { IValidationResult } from '~/validation/FormValidator';
import * as s from './inputContainer.scss';

registerLocale('fi', fi);

type inputType = 'text' | 'number' | 'date';

interface IInputProps {
    label: string | JSX.Element;
    onChange?: (value: any) => void;
    validationResult?: IValidationResult;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    value?: string | number | Date | null;
    type?: inputType; // Defaults to text
    capitalizeInput?: boolean;
    isInputColorRed?: boolean;
    isClearButtonVisibleOnDates?: boolean;
    darkerInputLabel?: boolean; // TODO: rename as isInputLabelDarker
}

const renderEditableContent = (props: IInputProps) => {
    const type = props.type || 'text';
    const validationResult = props.validationResult;
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        let value = e.currentTarget.value;
        if (props.type === 'number') {
            const parsedValue = parseFloat(value);
            props.onChange!(!isNaN(parsedValue) ? parsedValue : null);
        } else {
            if (props.capitalizeInput) {
                value = value.toUpperCase();
            }
            props.onChange!(value);
        }
    };

    if (type === 'date') {
        return (
            <DatePicker
                value={props.value! as Date}
                onChange={props.onChange!}
                isClearButtonVisible={props.isClearButtonVisibleOnDates}
            />
        );
    }

    return (
        <input
            placeholder={props.disabled ? '' : props.placeholder}
            type={props.type === 'number' ? 'number' : 'text'}
            className={classnames(
                s.staticHeight,
                s.inputField,
                props.disabled ? s.disabled : null,
                validationResult && !validationResult.isValid ? s.invalidInput : null
            )}
            value={
                props.value !== null && props.value !== undefined
                    ? (props.value as string | number)
                    : ''
            }
            onChange={onChange}
        />
    );
};

const renderValidatorResult = (validationResult?: IValidationResult) => {
    if (!validationResult || !validationResult.errorMessage) {
        return null;
    }
    return <div className={s.errorMessage}>{validationResult.errorMessage}</div>;
};

const renderUneditableContent = (props: IInputProps) => (
    <div
        className={classnames(
            s.inputField,
            props.disabled ? s.staticHeight : null,
            props.isInputColorRed ? s.redInputText : null
        )}
    >
        {props.value instanceof Date
            ? Moment(props.value!).format('DD.MM.YYYY')
            : props.value
            ? props.value
            : '-'}
    </div>
);

const InputContainer = observer((props: IInputProps) => {
    return (
        <div className={classnames(s.formItem, s.inputContainer, props.className)}>
            {props.label && (
                <div className={props.darkerInputLabel ? s.darkerInputLabel : s.inputLabel}>
                    {props.label}
                </div>
            )}
            {props.disabled ? renderUneditableContent(props) : renderEditableContent(props)}
            {renderValidatorResult(props.validationResult)}
        </div>
    );
});

interface IDatePickerProps {
    value?: Date;
    isClearButtonVisible?: boolean;
    onChange: (date: Date) => void;
}

interface IDatePickerState {
    isOpen: boolean;
}

class DatePicker extends React.Component<IDatePickerProps, IDatePickerState> {
    private mounted: boolean;
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
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

    render() {
        const { value, isClearButtonVisible, onChange } = this.props;
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
            <div className={classnames(s.staticHeight)}>
                <ReactDatePicker
                    customInput={renderDatePickerInput({
                        value,
                        onChange,
                        isClearButtonVisible,
                        openCalendar: this.openCalendar,
                        placeholder: 'Syötä päivä'
                    })}
                    open={this.state.isOpen}
                    onClickOutside={this.closeCalendar}
                    onSelect={this.closeCalendar}
                    autoFocus={true}
                    selected={value}
                    onChange={onChange}
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
    openCalendar
}: {
    onChange: (value: any) => void;
    placeholder: string;
    value?: Date;
    isClearButtonVisible?: boolean;
    openCalendar: Function;
}) => {
    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        // TODO: implement a better way of changing input value
        const value = event.target.value;
        // Allow input date that is in the correct format
        if (Moment(value, 'DD.MM.YYYY', true).isValid()) {
            onChange(value);
        }
    };

    const clearInputValue = (event: React.MouseEvent) => {
        onChange('');
        event.preventDefault();
    };

    return (
        <div className={classnames(s.staticHeight, s.inputField)}>
            <input
                onClick={() => openCalendar()}
                placeholder={placeholder}
                type={'text'}
                value={value ? toDateString(value) : ''}
                onChange={onInputChange}
            />
            <IoMdCalendar className={s.calendarIcon} />
            {isClearButtonVisible && (
                <IoMdClose onClick={clearInputValue} className={s.clearIcon} />
            )}
        </div>
    );
};

export default InputContainer;
