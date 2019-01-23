import React from 'react';
import { inject, observer } from 'mobx-react';
import { NetworkStore, MapLayer } from '~/stores/networkStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import { RouteStore } from '~/stores/routeStore';
import * as s from './networkView.scss';

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
        this.props.networkStore!.selectAllTransitTypes();
        this.props.networkStore!.showMapLayer(MapLayer.node);
        this.props.networkStore!.showMapLayer(MapLayer.nodeWithoutLink);
        this.props.networkStore!.showMapLayer(MapLayer.link);
        this.props.routeStore!.clearRoutes();
    }

    render() {
        return (
            <div className={s.networkView}>
               <h2>Verkon muokkaus</h2>
            </div>
        );
    }
}

export default NetworkView;
