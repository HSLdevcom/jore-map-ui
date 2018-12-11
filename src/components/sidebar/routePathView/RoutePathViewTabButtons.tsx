import * as React from 'react';
import classnames from 'classnames';
import * as s from './routePathViewTabButtons.scss';

interface IRoutePathViewTabButtonsState {
}

interface IRoutePathViewTabButtonsProps {
    tabs: String[];
    selectedTab: string;
    onClick: Function;
}

class RoutePathViewTabButtons extends React.Component
<IRoutePathViewTabButtonsProps, IRoutePathViewTabButtonsState>{
    constructor(props: any) {
        super(props);
        this.state = {
            routePath: null,
            isLoading: true,
            selectedTab: 'Reitinsuunta',
        };
    }

    public render(): any {
        return this.props.tabs.map((tab: string) => {
            return(
                <div
                    key={tab}
                    className={(this.props.selectedTab === tab) ?
                    classnames(s.routePathViewTabButtonsView, s.selected) :
                    s.routePathViewTabButtonsView}
                    onClick={this.props.onClick(tab)}
                >
                    <div className={s.tabLabel}>
                        {tab}
                    </div>
                </div>
            );
        });
    }
}

export default RoutePathViewTabButtons;
