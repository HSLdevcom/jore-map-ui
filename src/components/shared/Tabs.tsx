import React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import * as s from './tabs.scss';

interface ITabsProps {
    children: JSX.Element[];
}

const Tabs = observer((props: ITabsProps) => {
    return <div className={s.tabs}>{props.children}</div>;
});

interface ITabListProps {
    children: JSX.Element[];
    selectedTabIndex: number;
    setSelectedTabIndex: (index: number) => void;
}

const TabList = observer((props: ITabListProps) => {
    return (
        <div className={s.tabList}>
            {React.Children.map(props.children, (child, index) => {
                const isActive = props.selectedTabIndex === index;
                return React.cloneElement(child, {
                    isActive,
                    index,
                    setSelectedTabIndex: props.setSelectedTabIndex
                });
            })}
        </div>
    );
});

interface ITabProps {
    children: JSX.Element;
    setSelectedTabIndex?: (index: number) => void;
    index?: number;
    isActive?: boolean;
    isDisabled?: boolean;
}

const Tab = observer((props: ITabProps) => {
    const isActive = props.isActive;
    const isDisabled = props.isDisabled;
    const setSelectedTabIndex = () => props.setSelectedTabIndex!(props.index!);

    return (
        <div
            className={classnames(
                s.tab,
                isActive ? s.active : null,
                isDisabled ? s.disabled : null
            )}
            onClick={setSelectedTabIndex}
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
            {React.Children.map(props.children, (child, index) => {
                const isActive = props.selectedTabIndex === index;
                if (!isActive) return null;
                return React.cloneElement(child);
            })}
        </div>
    );
});

interface IContentItemProps {
    children: JSX.Element;
}

const ContentItem = observer((props: IContentItemProps) => {
    return <div className={s.contentItem}>{props.children}</div>;
});

export { Tabs, TabList, Tab, ContentList, ContentItem };
