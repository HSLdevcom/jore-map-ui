import classnames from 'classnames';
import * as React from 'react';
import * as s from './multiTabInput.scss';

interface IMultiTabInputProps {
    tabs: string[];
}

interface IMultiTabInputState {
    tabSelected: number;
}

class MultiTabInput extends React.Component<IMultiTabInputProps, IMultiTabInputState> {
    constructor(props: any) {
        super(props);
        this.state = {
            tabSelected: 0,
        };

    }

    public onTabClick = (tabSelected: number) => {
        this.setState({
            tabSelected,
        });
    }

    public generateTabs = () => {
        return this.props.tabs.map((tab: string, index) => {
            let classname = classnames(s.tabButton, s.tabButtonMiddle);
            if (index === 0) {
                classname = classnames(s.tabButton, s.tabButtonLeft);
            } else if (index === this.props.tabs.length - 1) {
                classname = classnames(s.tabButton, s.tabButtonRight);
            }
            return(
                <div
                    key={index}
                    className={(this.state.tabSelected === index) ?
                    classnames(classname, s.opened) :
                    classname}
                    onClick={this.onTabClick.bind(this, index)}
                >
                    <div className={s.tabLabel}>
                        {tab}
                    </div>
                </div>
            );
        });
    }

    public render(): any {
        return (
             <div className={s.tabsInputContainer}>
                <div className={s.flexRow}>
                    {this.generateTabs()}
                </div>
                <textarea
                    placeholder=''
                    className={s.tabsInput}
                />
            </div>
        );
    }
}

export default MultiTabInput;
