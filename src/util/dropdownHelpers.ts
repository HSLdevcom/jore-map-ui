import { IDropdownItem } from '~/components/controls/Dropdown';

const createDropdownItemsFromList = (itemList: string[]): IDropdownItem[] => {
    return itemList.map((item: string) => {
        const dropdownItem: IDropdownItem = {
            value: item,
            label: item
        };
        return dropdownItem;
    });
};

export { createDropdownItemsFromList };
