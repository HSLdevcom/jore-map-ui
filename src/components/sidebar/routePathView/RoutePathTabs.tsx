import React from 'react';
import classnames from 'classnames';
import { observer, inject } from 'mobx-react';
import { RoutePathStore, RoutePathViewTab } from '~/stores/routePathStore';
import * as s from './routePathTabs.scss';

interface IRoutePathTabsProps {
    routePathStore?: RoutePathStore;
}

@inject('routePathStore')
@observer
class RoutePathTabs extends React.Component<IRoutePathTabsProps> {
    private openTab = (tab: RoutePathViewTab) => () => {
        this.props.routePathStore!.setActiveTab(tab);
    };

    render() {
        return (
            <>
                <div
                    className={classnames(
                        s.routePathTabButton,
                        this.props.routePathStore!.activeTab ===
                            RoutePathViewTab.Info
                            ? s.selected
                            : undefined
                    )}
                    onClick={this.openTab(RoutePathViewTab.Info)}
                >
                    <div className={s.tabLabel}>Reitinsuunnan tiedot</div>
                </div>
                <div
                    className={classnames(
                        s.routePathTabButton,
                        this.props.routePathStore!.activeTab ===
                            RoutePathViewTab.List
                            ? s.selected
                            : undefined
                    )}
                    onClick={this.openTab(RoutePathViewTab.List)}
                >
                    <div className={s.tabLabel}>Solmut ja linkit</div>
                </div>
            </>
        );
    }
}

export default RoutePathTabs;
