import * as React from 'react';
import classnames from 'classnames';
import * as s from './routePathTabButtons.scss';

interface IRoutePathTabButtonsProps {
    tabs: String[];
    selectedTab: string;
    selectTab: Function;
}

const routePathTabButtons = (props: IRoutePathTabButtonsProps) => {
    return (
        <> {props.tabs.map((tab: string, index) => {
            return(
                <div
                    key={tab}
                    className={(props.selectedTab === tab) ?
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

export default routePathTabButtons;
