import _ from 'lodash';
import { observer } from 'mobx-react';
import React from 'react';
import Select from 'react-select';
import { InputActionMeta } from 'react-select/src/types';
import { IValidationResult } from '~/validation/FormValidator';
import Loader from '../shared/loader/Loader';
import TextContainer from './TextContainer';
import * as s from './dropdown.scss';

export interface IDropdownItem {
    value?: string;
    label: string;
}

interface IDropdownProps {
    items: IDropdownItem[];
    label?: string;
    selected?: string | null;
    disabled?: boolean;
    isLoading?: boolean;
    emptyItem?: IDropdownItem;
    onChange?: (value: any) => void;
    validationResult?: IValidationResult;
    isInputLabelDarker?: boolean;
    isBackgroundGrey?: boolean;
    isAnyInputValueAllowed?: boolean; // Can user give any input as dropdown field value
    isNoOptionsMessageHidden?: boolean;
    isSelectedOptionHidden?: boolean;
    isJokerAllowed?: boolean;
}

interface IDropdownState {
    searchString: string;
    displayedItems: IDropdownItem[];
}

const EMPTY_VALUE_LABEL = '-';
const MAX_DISPLAYED = 500; // With large amount of items, the dropdown seems to lag

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

    private matchWildcard(text: string, rule: string) {
        return new RegExp(`^${rule.split('*').join('.*')}$`).test(text);
    }

    private matchText(text: string, searchInput: string) {
        if (searchInput.includes('*')) {
            return this.matchWildcard(text, searchInput);
        }
        return text.includes(searchInput);
    }

    filterItems(searchString: string) {
        const displayedItems = this.props.items
            .filter((dropdownItem: IDropdownItem) => {
                if (this.props.isJokerAllowed) {
                    return this.matchText(dropdownItem.label, searchString);
                }
                return dropdownItem.label.toLowerCase().includes(searchString.toLowerCase());
            })
            .slice(0, MAX_DISPLAYED);

        if (this.props.emptyItem) {
            displayedItems.unshift(this.props.emptyItem);
        }

        return displayedItems;
    }

    handleInputChange(searchString: string, action: InputActionMeta) {
        if (
            this.props.isAnyInputValueAllowed &&
            (action.action === 'input-blur' || action.action === 'menu-close')
        ) {
            // Return to prevent input from clearing out in onBlur / close menu events
            return;
        }

        const displayedItems = this.filterItems(searchString);
        this.setState({ searchString, displayedItems });

        if (this.props.isAnyInputValueAllowed) {
            this.props.onChange!(searchString);
        }
    }

    render() {
        const {
            items,
            label,
            selected,
            disabled,
            isLoading,
            emptyItem,
            onChange,
            validationResult,
            isInputLabelDarker,
            isBackgroundGrey,
            isAnyInputValueAllowed,
            isNoOptionsMessageHidden,
            isSelectedOptionHidden,
            isJokerAllowed,
            ...attr
        } = this.props;
        const displayedItems = this.state.displayedItems;
        const _onChange = (selectedItem: IDropdownItem) => {
            if (selectedItem) onChange!(selectedItem.value);
        };
        // Push selectedItem into dropdownItemList if it doesn't exist in dropdownItemList
        let selectedItem: IDropdownItem | undefined;
        if (selected) {
            selectedItem = items.find(item => item.value === selected!.trim());
            if (!selectedItem) {
                selectedItem = {
                    label: selected,
                    value: selected
                };
                displayedItems.push(selectedItem);
            }
        }
        if (isLoading) {
            return (
                <div className={s.formItem}>
                    <Loader size='small' />
                </div>
            );
        }

        if (disabled) {
            return (
                <TextContainer
                    label={label}
                    value={Boolean(selectedItem) ? selectedItem!.label : EMPTY_VALUE_LABEL}
                    isInputLabelDarker={isInputLabelDarker}
                    {...attr}
                />
            );
        }

        // <Select/> works with null values instead of undefined
        const selectValue: IDropdownItem | null = selectedItem ? selectedItem : null;
        return (
            <div className={s.formItem}>
                <div className={s.dropdownView}>
                    {label && (
                        <div className={isInputLabelDarker ? s.darkerInputLabel : s.inputLabel}>
                            {label}
                        </div>
                    )}

                    <div {...attr}>
                        <Select
                            value={selectValue}
                            onChange={_onChange}
                            onInputChange={this.handleInputChange}
                            options={displayedItems}
                            isDisabled={disabled}
                            isSearchable={true}
                            filterOption={null}
                            placeholder={'Valitse...'}
                            styles={_getCustomStyles(this.props)}
                            noOptionsMessage={() =>
                                isNoOptionsMessageHidden ? null : 'Ei hakutuloksia'
                            }
                            hideSelectedOptions={Boolean(isSelectedOptionHidden)}
                            className={isBackgroundGrey ? s.greyBackground : ''}
                        />
                    </div>
                    <div>
                        {validationResult && validationResult.errorMessage && !disabled && (
                            <div className={s.errorMessage}>{validationResult.errorMessage}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const _getCustomStyles = (props: IDropdownProps) => {
    // Giving styles with style object (TODO: better way would be to use classnames)
    return {
        // Make input value as light grey to indicate that cursor is not in the end of text
        singleValue: (styles: any, state: any) => ({
            ...styles,
            color: state.selectProps.menuIsOpen ? '#bebebe' : '#000'
        }),
        container: (styles: any) => ({
            ...styles,
            height: s.inputFieldHeight,
            fontSize: s.smallFontSize
        }),
        control: (styles: any, state: any) => ({
            ...styles,
            backgroundColor: props.isBackgroundGrey ? s.greyBackground : '#fff',
            border: state.isFocused ? '2px solid #007ac9' : '1px solid #bebebe',
            boxShadow: 'none',
            height: s.inputFieldHeight,
            '&:hover': {
                cursor: 'pointer'
            }
        }),
        option: (styles: any, state: any) => ({
            ...styles,
            cursor: 'pointer',
            backgroundColor: _getMenuOptionBackgroundColor(state.isSelected, state.isFocused),
            height: 30,
            fontSize: s.smallFontSize,
            padding: '0px 10px',
            display: 'flex',
            alignItems: 'center'
        }),
        menu: (styles: any, state: any) => ({
            ...styles,
            margin: '2px 0px 0px 0px'
        })
    };
};

const _getMenuOptionBackgroundColor = (isSelected: boolean, isFocused: boolean) => {
    if (isSelected) {
        return s.busBlue; // Selected item color
    }
    if (isFocused) {
        return s.lightblue; // Color when something is highlighted
    }
    return 0; // Unselected item color
};

export default Dropdown;
