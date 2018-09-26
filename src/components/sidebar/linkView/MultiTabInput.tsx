// import classnames from 'classnames';
import * as React from 'react';
import * as s from './linkView.scss';

interface IMultiTabInputProps {
}

interface IMultiTabInputState {
    tabSelected: number;
    class: string;
}

class MultiTabInput extends React.Component<IMultiTabInputProps, IMultiTabInputState> {
    constructor(props: any) {
        super(props);
        this.state = {
            tabSelected: 0,
            class: s.tabButtonA,
        };

    }

    public onTabClick = (tabSelected: number) => {
        this.setState({
            tabSelected,
            class: s.tabButtonC,
        });
    }

    public isTabSelected = (tabIndex: number) => {
        const tabSelected = this.state.tabSelected;
        console.log(tabSelected);
        return (tabIndex === tabSelected);
    }

    public render(): any {
        return (
             <div className={s.tabsInputContainer}>
                <div className={s.flexRow}>
                    <div
                        className={this.state.class}
                        onClick={this.onTabClick.bind(this, 0)}
                    >
                        1
                    </div>
                    <div className={s.tabButtonB} onClick={this.onTabClick.bind(this, 1)}>
                        2
                    </div>
                    <div className={s.tabButtonC} onClick={this.onTabClick.bind(this, 2)}>
                        3
                    </div>
                </div>
                <input
                    placeholder=''
                    type='text'
                    className={s.tabsInput}
                />
            </div>
        );
    }
}

export default MultiTabInput;
