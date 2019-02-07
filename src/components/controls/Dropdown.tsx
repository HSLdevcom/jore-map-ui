import React from 'react';
import * as s from './dropdown.scss';

interface IDropdownState {
    selectedValue?: string;
}

export interface IDropdownItem {
    key: string;
    value: string;
}

interface IDropdownBaseProps {
    label?: string;
    selected: string;
    disabled?: boolean;
    onChange(selectedItem: string): void;
}

interface IDropdownProps extends IDropdownBaseProps {
    items: string[] | IDropdownItem[];
}

interface IDropdownWithCodeListProps extends IDropdownBaseProps {
    codeList: any;
}

const  usesDictionary = (
    item: IDropdownProps | IDropdownWithCodeListProps): item is IDropdownWithCodeListProps => {
    return (
        (item as IDropdownWithCodeListProps).codeList !== undefined
    ) && (
        (item as IDropdownProps).items === undefined
    );
};

class Dropdown extends React.Component
<IDropdownProps | IDropdownWithCodeListProps, IDropdownState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selectedValue: this.props.selected,
        };
    }

    onChange = (event: any) => {
        this.setState({
            selectedValue: event.target.value,
        });
        this.props.onChange(event.target.value);
    }

    public render() {
        let selectionDictionary: IDropdownItem[];

        if (usesDictionary(this.props)) {
            const dictionary = this.props.codeList;
            selectionDictionary = Object.keys(dictionary).map(
                key => ({ key, value: dictionary[key] }),
            );
        } else {
            const items = this.props.items;
            if (items.length > 0 && typeof items[0] === 'string') {
                selectionDictionary =
                    (items as string[]).map((i: string) => ({ key: i, value: i }));
            } else {
                selectionDictionary = items as IDropdownItem[];
            }
        }

        return (
            <div className={s.formItem}>
                <div className={s.dropdownView}>
                    {this.props.label &&
                        <div className={s.inputLabel}>
                            {this.props.label}
                        </div>
                    }
                    {this.props.disabled ?
                        <div>
                            {this.state.selectedValue}
                        </div>
                    :
                        <select
                            className={s.dropdown}
                            value={this.state.selectedValue}
                            onChange={this.onChange}
                        >
                        {
                            selectionDictionary.map((item) => {
                                return (
                                    <option
                                        key={item.key}
                                        value={item.key}
                                    >
                                        {item.value}
                                    </option>
                                );
                            })
                        }
                        </select>
                    }
                </div>
            </div>
        );
    }
}

export default Dropdown;
