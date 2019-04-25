import React from 'react';
import { inject, observer } from 'mobx-react';
import * as s from './routePathTab.scss';

interface IRoutePathTabState {
    isLoading: boolean;
}

interface IRoutePathTabProps {
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

    componentDidMount() {
        this.fetchAllRoutePaths();
    }

    private fetchAllRoutePaths = async () => {
        // TODO
    }

    render() {
        return (
        <div className={s.routePathTabView}>
            <div className={s.content}>
                List of route paths
            </div>
        </div>
        );
    }
}
export default RoutePathTab;
