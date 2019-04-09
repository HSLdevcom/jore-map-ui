import React from 'react';
import { observer } from 'mobx-react';
import ICodeListItem from '~/models/ICodeListItem';
import * as s from './dropdown.scss';

export interface IDropdownItem {
    value: string;
    label: string;
}

interface IDropdownProps {
    label?: string;
    selected?: string;
    disabled?: boolean;
    items: ICodeListItem[];
    emptyItem?: IDropdownItem;
    onChange: (value: any) => void;
}

const Dropdown = observer((props: IDropdownProps) => {
    const onChange = (event: any) => {
        props.onChange(event.target.value);
    };
    const dropDownItemList = props.items.map((item): IDropdownItem => ({
        value: item.value,
        label: item.label,
    }));

    if (props.emptyItem) {
        dropDownItemList.unshift(props.emptyItem);
    }

    let selectedItem: IDropdownItem | undefined;
    if (props.selected) {
        selectedItem = dropDownItemList.find(item => item.value === props.selected!.trim());
    }

    return (
        <div className={s.formItem}>
            <div className={s.dropdownView}>
                {props.label &&
                    <div className={s.inputLabel}>
                        {props.label}
                    </div>
                }
                {props.disabled ?
                    <div className={s.disableEditing}>
                        {Boolean(selectedItem) ? selectedItem!.label : ''}
                    </div>
                :
                    <select
                        className={s.dropdown}
                        value={selectedItem ? selectedItem.value : undefined}
                        onChange={onChange}
                    >
                    {
                        dropDownItemList.map((item) => {
                            return (
                                <option
                                    key={item.value ? item.value : item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            );
                        })
                    }
                    </select>
                }
            </div>
        </div>
    );
});

export default Dropdown;
