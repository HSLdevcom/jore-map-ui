import * as React from 'react';
import classnames from 'classnames';
import * as s from './routePathViewTabButtons.scss';

interface IRoutePathViewTabButtonsProps {
    tabs: String[];
    selectedTab: string;
    selectTab: Function;
}

const routePathViewTabButtons = (props: IRoutePathViewTabButtonsProps) => {
    return (
        <> {props.tabs.map((tab: string, index) => {
            return(
                <div
                    key={tab}
                    className={(props.selectedTab === tab) ?
                        classnames(s.routePathViewTabButtonsView, s.selected) :
                        s.routePathViewTabButtonsView}
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

export default routePathViewTabButtons;
