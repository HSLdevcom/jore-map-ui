import React from 'react';
import classnames from 'classnames';
import * as s from './routePathTabs.scss';

interface IRoutePathTabsProps {
    selectedTab: number;
    selectTab: Function;
}

const tabs = [
    'Reitinsuunnan tiedot',
    'Solmut ja linkit',
];

const routePathTabs = (props: IRoutePathTabsProps) => {
    return (
        <> {tabs.map((tab: string, index) => {
            return(
                <div
                    key={tab}
                    className={(props.selectedTab === index) ?
                        classnames(s.routePathTabButtonsView, s.selected) :
                        s.routePathTabButtonsView}
                    onClick={props.selectTab(index)}
                >
                    <div className={s.tabLabel}>
                        {tab}
                    </div>
                </div>
            );
        })}
        </>
    );
};

export default routePathTabs;
