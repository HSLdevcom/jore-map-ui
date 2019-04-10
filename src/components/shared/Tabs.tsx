import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import * as s from './tabs.scss';

interface ITabsProps {
    children: JSX.Element[];
}

const Tabs = observer((props: ITabsProps) => {
    return (
        <div className={s.tabs}>
            {props.children}
        </div>
    );
});

interface ITabListProps {
    children: JSX.Element[];
    selectedTabIndex: number;
    setSelectedTabIndex: Function;
}

const TabList = observer((props: ITabListProps) => {
    return (
        <div className={s.tabList}>
            {
                React.Children.map(props.children, (child, index) => {
                    const isActive = props.selectedTabIndex === index;
                    const setSelectedTabIndex = () => props.setSelectedTabIndex(index);
                    return (
                        <div
                            className={
                                classnames(
                                    isActive ? s.active : null,
                                )
                            }
                            onClick={setSelectedTabIndex}
                        >
                            {
                                React.cloneElement(child)
                            }
                        </div>
                    );
                })
            }
        </div>
    );
});

interface ITabProps {
    children: JSX.Element;
}

const Tab = observer((props: ITabProps) => {
    return (
        <div
            className={s.tab}
        >
            {props.children}
        </div>
    );
});

interface IContentListProps {
    children: JSX.Element[];
    selectedTabIndex: number;
}

const ContentList = observer((props: IContentListProps) => {
    return (
        <div className={s.contentList}>
            {
                React.Children.map(props.children, (child, index) => {
                    const isActive = props.selectedTabIndex === index;
                    return (
                        <div>
                            { isActive &&
                                React.cloneElement(child)
                            }
                        </div>
                    );
                })
            }
        </div>
    );
});

interface IContentItemProps {
    children: JSX.Element;
}

const ContentItem = observer((props: IContentItemProps) => {
    return (
        <div
            className={s.tab}
        >
            {props.children}
        </div>
    );
});

export {
    Tabs,
    TabList,
    Tab,
    ContentList,
    ContentItem,
};
