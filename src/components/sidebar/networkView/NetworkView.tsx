
import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { NetworkStore } from '~/stores/networkStore';
import * as s from './networkView.scss';

interface INetworkViewProps {
    networkStore?: NetworkStore;
}

@inject('networkStore')
@observer
class NetworkView extends React.Component<INetworkViewProps> {
    constructor(props: any) {
        super(props);

        this.initStores();
    }

    private initStores() {
        this.props.networkStore!.selectAllTransitTypes();
        this.props.networkStore!.setNodeVisibility(true);
        this.props.networkStore!.setLinkVisibility(true);
        this.props.networkStore!.setPointVisibility(true);
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
