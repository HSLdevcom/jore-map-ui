import * as React from 'react';
import * as s from './dropdown.scss';
import DownArrow from '../../icons/downArrow';

interface IDropdownState {
    isOpen: boolean;
}

interface IDropdownProps {
    selected: string;
    items: string[];
    onChange(selectedItem: string): void;
}

class Dropdown extends React.Component
<IDropdownProps, IDropdownState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    public render(): any {
        const onChange = (selectedItem: string) => {
            this.setState({
                isOpen: false,
            });
            this.props.onChange(selectedItem);
        };

        return (
            <div
                onMouseLeave={this.hideDropdownList}
                className={s.dropdown}
            >
                <div
                    onMouseEnter={this.showDropdownList}
                    className={s.selectedItem}
                >
                    <div>
                        {this.props.selected}
                    </div>
                    <DownArrow height={'30px'}/>
                </div>
                <div className={this.getItemListClassName()}>
                {
                    this.props.items.map((item) => {
                        return (
                            <div
                                key={item}
                                onClick={onChange.bind(this, item)}
                                className={s.item}
                            >
                                {item}
                            </div>
                        );
                    })
                }
                </div>
            </div>
        );
    }

    private showDropdownList = () => {
        this.setState({
            isOpen: true,
        });
    }

    private hideDropdownList = () => {
        this.setState({
            isOpen: false,
        });
    }

    private getItemListClassName() {
        return this.state.isOpen ? s.itemListShown : s.itemListHidden;
    }

}

export default Dropdown;
