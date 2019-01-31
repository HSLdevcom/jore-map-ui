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
import NodeLocationType from '~/types/NodeLocationType';
import Loader from '~/components/shared/loader/Loader';
import NodeCoordinatesListView from './NodeCoordinatesListView';
import ViewHeader from '../../ViewHeader';
import StopForm from './StopForm';
import InputContainer from '../../InputContainer';
import * as s from './networkNode.scss';

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
        const nodes = this.props.editNetworkStore!.nodes;
        if (nodes && nodes.length === 1) {
            await this.fetchLinksForNodes(nodes[0]);
            this.props.mapStore!.setCoordinates(nodes[0].coordinates);
        }
        this.setState({ isLoading: false });
    }

    private async queryNode(nodeId: string) {
        const node = await NodeService.fetchNode(nodeId);
        if (node) {
            this.props.editNetworkStore!.setNodes([node]);
        }
    }

    private async fetchLinksForNodes(node: INode) {
        const links = await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
        if (links) {
            this.props.editNetworkStore!.setLinks(links);
        }
    }

    private onChangeLocations = (coordinatesType: NodeLocationType, coordinates: L.LatLng) => {
        const node = { ...this.props.editNetworkStore!.nodes!, [coordinatesType]:coordinates };
        this.props.editNetworkStore!.setNodes(node);
    }

    private onChange = (name: string) => () => {};

    public render() {
        const node = this.props.editNetworkStore!.nodes[0];
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
                            node={this.props.editNetworkStore!.nodes![0]}
                            onChangeCoordinates={this.onChangeLocations}
                        />
                    </div>
                    { node.type === NodeType.STOP &&
                        <StopForm
                            isEditingDisabled={false}
                            onChange={this.onChange('')}
                            stop={node.stop!}
                        />
                    }
                </div>
            </div>
        );
    }
}

export default NetworkNode;
