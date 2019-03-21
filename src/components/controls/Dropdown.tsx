import React from 'react';
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

class Dropdown extends React.Component<IDropdownProps | IDropdownWithCodeListProps> {
    onChange = (event: any) => {
        this.props.onChange(event.target.value);
    }

    public render() {
        let dropDownItemList: IDropdownItem[] = [];

        if (this.props.emptyItem) {
            dropDownItemList = [
                this.props.emptyItem,
                ...dropDownItemList,
            ];
        }

        if (usesCodeList(this.props)) {
            const codeList = this.props.codeList;
            dropDownItemList = dropDownItemList.concat(Object.keys(codeList).map(
                value => ({ value, label: codeList[value] }),
            ));
        } else {
            dropDownItemList = dropDownItemList.concat(this.props.items);
        }

        const selectedItem = dropDownItemList.find(item => item.value === this.props.selected);

        return (
            <div className={s.formItem}>
                <div className={s.dropdownView}>
                    {this.props.label &&
                        <div className={s.inputLabel}>
                            {this.props.label}
                        </div>
                    }
                    {this.props.disabled ?
                        <div className={s.disableEditing}>
                            {Boolean(selectedItem) ? selectedItem!.value : ''}
                        </div>
                    :
                        <select
                            className={s.dropdown}
                            value={this.props.selected}
                            onChange={this.onChange}
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
    }
}

export default Dropdown;
