import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { match } from 'react-router';
import { ICoordinates, INode } from '~/models';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import { NotificationStore } from '~/stores/notificationStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import NodeCoordinatesListView from '~/components/sidebar/networkView/node/NodeCoordinatesListView';
import { CoordinatesType } from '~/components/sidebar/nodeView/NodeView';
import Loader from '~/components/shared/loader/Loader';
import * as s from './networkNode.scss';

interface INetworkNodeProps {
    match?: match<any>;
    editNetworkStore?: EditNetworkStore;
    notificationStore?: NotificationStore;
    mapStore?: MapStore;
}

interface InetworkNodeState {
    isLoading: boolean;
}

@inject('editNetworkStore', 'notificationStore', 'mapStore')
@observer
class NetworkNode extends React.Component<INetworkNodeProps, InetworkNodeState> {
    constructor(props: INetworkNodeProps) {
        super(props);
        this.state = {
            isLoading: false,
        };
    }

    async componentDidMount() {
        const selectedNodeId = this.props.match!.params.id;

        this.setState({ isLoading: true });
        if (selectedNodeId) {
            this.props.mapStore!.setSelectedNodeId(selectedNodeId);
            await this.queryNode(selectedNodeId);
        }
        const node = this.props.editNetworkStore!.node;
        if (node) {
            await this.fetchLinksForNode(node!);
            this.props.mapStore!.setCoordinates(node.coordinates.lat, node.coordinates.lon);
        }
        this.setState({ isLoading: false });
    }

    private async queryNode(nodeId: string) {
        const node = await NodeService.fetchNode(nodeId);
        if (node) {
            this.props.editNetworkStore!.setNode(node);
        }
    }

    private async fetchLinksForNode(node: INode) {
        const links = await LinkService.fetchLinksByStartNodeAndEndNode(node.id);
        if (!links) return;
        this.props.editNetworkStore!.setNode(node);
        this.props.editNetworkStore!.setLinks(links);
    }

    private onChangeLocations = (coordinatesType: CoordinatesType) =>
        (coordinates: ICoordinates) => {
            const node = { ...this.props.editNetworkStore!.node!, [coordinatesType]:coordinates };
            this.props.editNetworkStore!.setNode(node);
        }

    public render() {
        if (this.state.isLoading) {
            return(
                <div className={s.editNetworkView}>
                    <Loader/>
                </div>
            );
        }
        const node = this.props.editNetworkStore!.node;
        if (node && node.id) {
            return (
                <div className={s.editNetworkView}>
                   <h2>Solmun {node.id} muokkaus</h2>
                    <NodeCoordinatesListView
                        node={this.props.editNetworkStore!.node!}
                        onChangeCoordinates={this.onChangeLocations}
                    />
                </div>
            );
        }

        return (
            <div className={s.editNetworkView}>
               <h2>Solmun muokkaus</h2>
            </div>
        );
    }
}

export default NetworkNode;
