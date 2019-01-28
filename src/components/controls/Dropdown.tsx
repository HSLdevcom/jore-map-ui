import React from 'react';
import * as s from './dropdown.scss';

interface IDropdownState {
    selectedValue?: string;
}

interface IDropdownProps {
    label?: string;
    selected: string;
    items: string[];
    disabled?: boolean;
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
            <div className={s.formItem}>
                <div className={s.dropdownView}>
                    {this.props.label &&
                        <div className={s.inputLabel}>
                            {this.props.label}
                        </div>
                    }
                    {this.props.disabled &&
                        <div>
                            {this.state.selectedValue}
                        </div>
                    }
                    {!this.props.disabled &&
                        <select
                            className={s.dropdown}
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
                    }
                </div>
            </div>
        );
    }
}

export default Dropdown;
