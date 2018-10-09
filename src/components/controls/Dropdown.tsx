import * as React from 'react';
import DownArrow from '~/icons/downArrow';
import * as s from './dropdown.scss';

interface IDropdownState {
    selectedValue?: string;
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
            selectedValue: this.props.selected,
        };
    }

    onChange = (event: any) => {
        this.setState({
            selectedValue: event.target.value,
        });
        this.props.onChange(event.target.value);
    }

    public render(): any {
        return (
            <select
                className={s.dropdownView}
                value={this.state.selectedValue}
                onChange={this.onChange}
            >
            {
                this.props.items.map((item) => {
                    return (
                        <option
                            key={item}
                            value={item}
                        >
                            {item}
                        </option>
                    );
                })
            }
            </select>
        );
    }
}

export default Dropdown;
