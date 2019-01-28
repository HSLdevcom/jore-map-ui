import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { match } from 'react-router';
import { INode } from '~/models';
import { EditNetworkStore } from '~/stores/editNetworkStore';
import { MapStore } from '~/stores/mapStore';
import LinkService from '~/services/linkService';
import { Dropdown } from '~/components/controls';
import NodeType from '~/enums/nodeType';
import NodeService from '~/services/nodeService';
import NodeCoordinatesListView from '~/components/sidebar/networkView/node/NodeCoordinatesListView';
import { CoordinatesType } from '~/components/sidebar/nodeView/NodeView';
import Loader from '~/components/shared/loader/Loader';
import ViewHeader from '../../ViewHeader';
import * as s from './networkNode.scss';
import InputContainer from '../../InputContainer';

interface INetworkNodeProps {
    match?: match<any>;
    editNetworkStore?: EditNetworkStore;
    mapStore?: MapStore;
}

interface InetworkNodeState {
    isLoading: boolean;
    isEditDisabled: boolean;
}

@inject('editNetworkStore', 'mapStore')
@observer
class NetworkNode extends React.Component<INetworkNodeProps, InetworkNodeState> {
    constructor(props: INetworkNodeProps) {
        super(props);
        this.state = {
            isLoading: false,
            isEditDisabled: false,
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
            this.props.mapStore!.setCoordinates(node.coordinates);
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
        if (links) {
            this.props.editNetworkStore!.setLinks(links);
        }
    }

    private onChangeLocations = (coordinatesType: CoordinatesType) =>
        (coordinates: L.LatLng) => {
            const node = { ...this.props.editNetworkStore!.node!, [coordinatesType]:coordinates };
            this.props.editNetworkStore!.setNode(node);
        }

    private onChange = (name: string) => () => {};

    public render() {
        const node = this.props.editNetworkStore!.node;
        const isEditingDisabled = this.state.isEditDisabled;

        if (this.state.isLoading || !node || !node.id) {
            return(
                <div className={s.editNetworkView}>
                    <Loader/>
                </div>
            );
        }
        return (
            <div className={s.editNetworkView}>
                <ViewHeader
                    closePromptMessage={undefined}
                >
                    Solmu {node.id}
                </ViewHeader>
                <div className={s.form}>
                    <div className={s.formSection}>
                        <div className={s.flexRow}>
                            <InputContainer
                                label='LYHYT ID'
                                disabled={isEditingDisabled}
                                value={node.shortId}
                                onChange={this.onChange('routePathShortName')}
                            />
                            <Dropdown
                                label='TYYPPI'
                                onChange={this.onChange}
                                items={['Pysäkki', 'Risteys']}
                                // TODO: Add other alternatives, and remove hardcoding
                                selected={node.type === NodeType.STOP ? 'Pysäkki' : 'Risteys'}
                            />
                        </div>
                    </div>
                    <div className={s.formSection}>
                        <NodeCoordinatesListView
                            node={this.props.editNetworkStore!.node!}
                            onChangeCoordinates={this.onChangeLocations}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default NetworkNode;
