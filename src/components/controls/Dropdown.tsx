import React from 'react';
import * as s from './dropdown.scss';

export interface IDropdownItem {
    key: string;
    value: string;
}

interface IDropdownBaseProps {
    label?: string;
    selected: string;
    disabled?: boolean;
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
        let dropDownItemList: IDropdownItem[];

        if (usesCodeList(this.props)) {
            const codeList = this.props.codeList;
            dropDownItemList = Object.keys(codeList).map(
                key => ({ key, value: codeList[key] }),
            );
        } else {
            dropDownItemList = this.props.items;
        }

        const selectedItem = dropDownItemList.find(item => item.key === this.props.selected);

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
