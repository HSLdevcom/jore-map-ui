import * as React from 'react';
import classnames from 'classnames';
import * as s from './routePathTabButtons.scss';

interface IRoutePathTabButtonsProps {
    selectedTab: number;
    selectTab: Function;
}

const routePathViewTabs = [
    'Reitinsuunta',
    'Solmut ja linkit',
];

const routePathTabButtons = (props: IRoutePathTabButtonsProps) => {
    return (
        <> {routePathViewTabs.map((tab: string, index) => {
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

export default routePathTabButtons;
