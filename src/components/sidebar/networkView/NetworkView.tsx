import React from 'react';
import { inject, observer } from 'mobx-react';
import { Route, Switch } from 'react-router';
import { NetworkStore } from '~/stores/networkStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { RouteStore } from '~/stores/routeStore';
import subSites from '~/routing/subSites';
import NetworkNode from './nodeView/NetworkNode';
import * as s from './networkView.scss';
import NetworkDefault from './NetworkDefault';

interface INetworkViewProps {
    networkStore?: NetworkStore;
    routeStore?: RouteStore;
    toolbarStore?: ToolbarStore;
}

@inject('networkStore', 'routeStore', 'toolbarStore')
@observer
class NetworkView extends React.Component<INetworkViewProps> {
    constructor(props: INetworkViewProps) {
        super(props);

        this.initStores();
    }

    private initStores = () => {
        this.props.routeStore!.clearRoutes();
    }

    render() {
        return (
            <div className={s.networkView}>
                <Switch>
                    <Route
                        exact={true}
                        path={subSites.networkNode}
                        component={NetworkNode}
                    />
                    <Route
                        exact={false}
                        path={subSites.network}
                        component={NetworkDefault}
                    />
                </Switch>
            </div>
        );
    }
}

export default NetworkView;
