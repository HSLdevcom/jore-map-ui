import React from 'react';
import { inject, observer } from 'mobx-react';
import { RouteStore } from '~/stores/routeStore';
import RouteItem from '../routeListView/RouteItem';
import * as s from './routePathTab.scss';

interface IRoutePathTabState {
    isLoading: boolean;
}

interface IRoutePathTabProps {
    routeStore?: RouteStore;
}

@inject('routeStore', 'errorStore')
@observer
class RoutePathTab extends React.Component<IRoutePathTabProps, IRoutePathTabState>{
    constructor(props: IRoutePathTabProps) {
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
                <div><b>Huom! Tämän näkymän toteutus on vielä kesken.</b></div>
                <RouteItem
                    route={route!}
                />
            </div>
        </div>
        );
    }
}
export default RoutePathTab;
