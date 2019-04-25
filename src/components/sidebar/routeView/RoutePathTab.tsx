import React from 'react';
import { inject, observer } from 'mobx-react';
import { RouteStore } from '~/stores/routeStore';
import * as s from './routePathTab.scss';
import RouteItem from '../routeListView/RouteItem';

interface IRoutePathTabState {
    isLoading: boolean;
}

interface IRoutePathTabProps {
    routeStore?: RouteStore;
}

@inject('routeStore', 'errorStore')
@observer
class RoutePathTab extends React.Component<IRoutePathTabProps, IRoutePathTabState>{
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: true,
        };
    }

    render() {
        const route = this.props.routeStore!.route;
        return (
        <div className={s.routePathTabView}>
            <div className={s.content}>
                {/* TODO: make routeItem more generic so that it would work here properly*/}
                <RouteItem
                    route={route!}
                />
            </div>
        </div>
        );
    }
}
export default RoutePathTab;
