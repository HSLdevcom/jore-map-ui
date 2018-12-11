import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { NetworkStore } from '~/stores/networkStore';
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

    private initStores() {
        this.props.networkStore!.selectAllTransitTypes();
        this.props.networkStore!.setNodeVisibility(true);
        this.props.networkStore!.setLinkVisibility(true);
        this.props.networkStore!.setPointVisibility(true);
        this.props.routeStore!.clearRoutes();
    }

    public render() {
        return (
            <div className={s.networkView}>
               <h2>Verkon muokkaus</h2>
            </div>
        );
    }
}

export default NetworkView;
