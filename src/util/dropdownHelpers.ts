import { IDropdownItem } from '~/components/controls/Dropdown';

const createDropdownItems = (itemList: string[]): IDropdownItem[] => {
    return itemList.map((item: string) => {
        const dropdownItem: IDropdownItem = {
            value: item,
            label: item
        };
        return dropdownItem;
    });
};

export { createDropdownItems };
