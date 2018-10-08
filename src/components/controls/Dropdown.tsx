import * as React from 'react';
import * as s from './dropdown.scss';

interface IDropdownState {
    selectedName?: string;
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
            selectedName: undefined,
            selectedValue: undefined,
        };
    }

    onChange = (event: any) => {
        this.setState({
            selectedName: event.target.name,
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
                defaultValue={this.props.selected}
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
