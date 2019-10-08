import React from 'react';
import Select from 'react-select';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { IValidationResult } from '~/validation/FormValidator';
import * as s from './dropdown.scss';

export interface IDropdownItem {
    value: string;
    label: string;
}

interface IDropdownProps {
    label?: string;
    selected?: string | null;
    disabled?: boolean;
    items: IDropdownItem[];
    emptyItem?: IDropdownItem;
    onChange: (value: any) => void;
    validationResult?: IValidationResult;
    darkerInputLabel?: boolean;
}

interface IDropdownState {
    searchString: string;
    displayedItems: IDropdownItem[];
}

const EMPTY_VALUE_LABEL = '-';
const MAX_DISPLAYED = 500; // With large amount of items, the dropdown seems to lag

// Giving styles with style object (TODO: better way would be to use classnames)
const customStyles = {
    container: (styles: any) => ({
        ...styles,
        height: s.inputFieldHeight,
        fontSize: s.smallFontSize
    }),
    control: (styles: any, state: any) => ({
        ...styles,
        borderColor: state.isFocused ? s.busBlue : s.mediumLightGrey,
        borderWidth: state.isFocused ? '1.5px' : '1px',
        boxShadow: 'none',
        height: s.inputFieldHeight,
        transition: 'none',
        '&:hover': {
            boxShadow: 'none',
            borderWidth: state.isFocused ? '1.5px' : '1px',
            borderColor: state.isFocused ? s.busBlue : s.mediumLightGrey,
            cursor: 'pointer'
        }
    }),
    option: (styles: any, state: any) => ({
        ...styles,
        cursor: 'pointer',
        backgroundColor: state.isSelected
            ? s.busBlue // Selected item color
            : state.isFocused
            ? s.lightblue // Color when something is highlighted
            : 0, // Unselected item color
        height: 30,
        fontSize: s.smallFontSize,
        padding: '0px 10px',
        display: 'flex',
        alignItems: 'center'
    })
};

@observer
class Dropdown extends React.Component<IDropdownProps, IDropdownState> {
    constructor(props: IDropdownProps) {
        super(props);
        const searchString = '';

        this.state = {
            searchString,
            displayedItems: this.filterItems(searchString)
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    componentDidUpdate(prevProps: IDropdownProps) {
        if (!_.isEqual(this.props.items, prevProps.items)) {
            const searchString = '';
            const displayedItems = this.filterItems(searchString);
            this.setState({ displayedItems });
        }
    }

    filterItems(searchString: string) {
        const displayedItems = _.cloneDeep(
            this.props.items
                .filter((dropdownItem: IDropdownItem) =>
                    dropdownItem.label
                        .toLowerCase()
                        .includes(searchString.toLowerCase())
                )
                .slice(0, MAX_DISPLAYED)
        );

        if (this.props.emptyItem) {
            displayedItems.unshift(this.props.emptyItem);
        }

        return displayedItems;
    }

    handleInputChange(searchString: string) {
        const displayedItems = this.filterItems(searchString);
        this.setState({ searchString, displayedItems });
    }

    render() {
        const props = this.props;
        const validationResult = props.validationResult;
        const displayedItems = this.state.displayedItems;

        const onChange = (selectedItem: IDropdownItem) => {
            props.onChange(selectedItem.value);
        };

        // Push selectedItem into dropdownItemList if it doesn't exist in dropdownItemList
        let selectedItem: IDropdownItem | undefined;
        if (props.selected) {
            selectedItem = this.props.items.find(
                item => item.value === props.selected!.trim()
            );
            if (!selectedItem) {
                selectedItem = {
                    label: props.selected,
                    value: props.selected
                };
                displayedItems.push(selectedItem);
            }
        }
        // <Select/> works with null values instead of undefined
        const selectValue = selectedItem ? selectedItem : null;

        return (
            <div className={s.formItem}>
                <div className={s.dropdownView}>
                    {props.label && (
                        <div
                            className={
                                props.darkerInputLabel
                                    ? s.darkerInputLabel
                                    : s.inputLabel
                            }
                        >
                            {props.label}
                        </div>
                    )}
                    {props.disabled ? (
                        <div className={s.disableEditing}>
                            {Boolean(selectedItem)
                                ? selectedItem!.label
                                : EMPTY_VALUE_LABEL}
                        </div>
                    ) : (
                        <>
                            <Select
                                value={selectValue}
                                onChange={onChange}
                                onInputChange={this.handleInputChange}
                                options={displayedItems}
                                isDisabled={props.disabled}
                                isSearchable={true}
                                placeholder={'Valitse...'}
                                styles={customStyles}
                                noOptionsMessage={() => 'Ei hakutuloksia'}
                            />
                            <div>
                                {validationResult &&
                                    validationResult.errorMessage &&
                                    !props.disabled && (
                                        <div className={s.errorMessage}>
                                            {validationResult.errorMessage}
                                        </div>
                                    )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default Dropdown;
