import React from 'react';
import { observer } from 'mobx-react';
import * as s from './dropdown.scss';

export interface IDropdownItem {
    value: string|number;
    label: string;
}

interface IDropdownBaseProps {
    label?: string;
    selected?: string;
    disabled?: boolean;
    emptyItem?: IDropdownItem;
    onChange: (value: any) => void;
}

interface IDropdownProps extends IDropdownBaseProps {
    items: IDropdownItem[];
}

interface IDropdownWithCodeListProps extends IDropdownBaseProps {
    codeList: any;
}

const usesCodeList = (
    item: IDropdownProps | IDropdownWithCodeListProps): item is IDropdownWithCodeListProps => {
    return (
        (item as IDropdownWithCodeListProps).codeList !== undefined
    ) && (
        (item as IDropdownProps).items === undefined
    );
};

const Dropdown = observer((props: IDropdownProps | IDropdownWithCodeListProps) => {
    const onChange = (event: any) => {
        props.onChange(event.target.value);
    };

    let dropDownItemList: IDropdownItem[] = [];

    if (usesCodeList(props)) {
        const codeList = props.codeList;
        dropDownItemList = dropDownItemList.concat(Object.keys(codeList).map(
            value => ({ value, label: codeList[value] }),
        ));
    } else {
        dropDownItemList = dropDownItemList.concat(props.items);
    }

    if (props.emptyItem) {
        dropDownItemList.unshift(props.emptyItem);
    }

    const selectedItem = dropDownItemList.find(item => item.value === props.selected);

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
                        {Boolean(selectedItem) ? selectedItem!.value : ''}
                    </div>
                :
                    <select
                        className={s.dropdown}
                        value={props.selected}
                        onChange={onChange}
                    >
                    {
                        dropDownItemList.map((item) => {
                            return (
                                <option
                                    key={item.value ? item.value : 'empty'}
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
